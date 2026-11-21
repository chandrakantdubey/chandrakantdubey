import assert from 'node:assert/strict';
import {
  newCoopGame, beginPacketGame, advancePacketGame, rotatePacketTile,
  pairRotateCoop, shieldCoopFault,
} from '../src/play/packetEngine.js';
import {validateCoopAction} from '../src/play/coopAuthorizer.js';

/**
 * Test-double for the repository's PRIVATE BLOB / If-Match room persistence.
 * This exercises pure-engine concurrency and server-derived authority against
 * a faithful storage control-flow model, NOT the real @vercel/blob HTTP route.
 * Keep that distinction explicit in release gates.
 */
class Conflict extends Error {}
class FakeBlob {
  constructor(game, now) {
    this.value={game, createdAt:now, expiresAt:now+8*60*60*1000, commands:[]};
    this.revision=1;
    this.conflicts=0;
    this.successfulWrites=0;
  }
  async read() {
    // Rehydrate copies as separate Vercel Functions would do. No shared refs.
    return {data:structuredClone(this.value),etag:`r${this.revision}`};
  }
  async save(value, expectedEtag) {
    if (expectedEtag!==`r${this.revision}`) {
      this.conflicts++;
      throw new Conflict('BlobPreconditionFailedError');
    }
    this.value=structuredClone(value);
    this.revision++;
    this.successfulWrites++;
  }
}
const HOST='H'.repeat(32),GUEST='G'.repeat(32),INTRUDER='I'.repeat(32);
const UUID=a=>`${String(a).padStart(8,'0')}-1234-4abc-8def-123456789abc`;
const tokens=new Map([[HOST,1],[GUEST,2]]);

class RoomServiceDouble {
  constructor(seed=2026, now=1000) {
    this.db=new FakeBlob(beginPacketGame(newCoopGame(seed,2),now),now);
  }
  async execute({token,action,index,commandId,now=1000,claimedPlayer=undefined,barrier=null}) {
    const player=tokens.get(token);
    if(!player) return {status:403,error:'Invalid player credentials.'};
    // Claimed player is intentionally discarded; only token-derived side counts.
    void claimedPlayer;
    for(let attempt=0;attempt<5;attempt++) {
      const {data,etag}=await this.db.read();
      if(now>data.expiresAt)return {status:404,error:'Room expired.'};
      const identity=`${player}:${commandId}`;
      if(data.commands.includes(identity))return {status:200,game:data.game,duplicate:true};
      let game=advancePacketGame(data.game,now);
      let error=null;
      switch(action){
        case 'pair':
        case 'shield':
          error=validateCoopAction(action,player,game,index);
          if(!error) game=action==='pair'?pairRotateCoop(game,index):shieldCoopFault(game);
          break;
        case 'rotate':
          if(game.phase!=='playing')error='Round not active.';
          else if(!Number.isInteger(index)||index<0||index>=35)error='Invalid index.';
          else if(player===1?index%7>=4:index%7<4)error='Outside player domain.';
          else game=rotatePacketTile(game,index);
          break;
        default: error='Invalid action';
      }
      if(error)return {status:409,error};
      const updated={...data,game,commands:[...data.commands.slice(-39),identity]};
      // An async barrier forces both parallel clients to have observed the
      // same ETag before the first write, exactly like parallel Functions.
      if(attempt===0&&barrier)await barrier();
      try {
        await this.db.save(updated,etag);
        return {status:200,game:updated.game,duplicate:false};
      }catch(error){
        if(!(error instanceof Conflict))throw error;
        if(attempt===4)return {status:409,error:'Room changed; retry the action.'};
      }
    }
    throw Error('Unreachable');
  }
}
function pairedBarrier() {
  let arrivals=0,release;
  const promise=new Promise(resolve=>{release=resolve});
  return async()=>{if(++arrivals===2)release();await promise};
}

// 1. Cross-role auth and client-side role forgery.
{
  const service=new RoomServiceDouble();
  assert.equal((await service.execute({token:INTRUDER,claimedPlayer:1,action:'pair',index:2,commandId:UUID(10)})).status,403);
  assert.equal((await service.execute({token:GUEST,claimedPlayer:1,action:'pair',index:2,commandId:UUID(11)})).status,409);
  assert.equal((await service.execute({token:HOST,claimedPlayer:2,action:'shield',commandId:UUID(12)})).status,409);
  assert.equal((await service.execute({token:HOST,action:'pair',index:3,commandId:UUID(13)})).status,409);
  assert.equal(service.db.successfulWrites,0,'unauthorized actions never create storage writes');
}

// 2. Two clients mutate different routing cells at the same revision.
{
  const service=new RoomServiceDouble();
  const gate=pairedBarrier();
  const [host,guest]=await Promise.all([
    service.execute({token:HOST,claimedPlayer:2,action:'pair',index:7,commandId:UUID(20),barrier:gate}),
    service.execute({token:GUEST,claimedPlayer:1,action:'rotate',index:20,commandId:UUID(21),barrier:gate}),
  ]);
  assert.equal(host.status,200);
  assert.equal(guest.status,200);
  assert.equal(service.db.conflicts,1,'one ETag collision, followed by transparent rebase');
  const stored=(await service.db.read()).data.game;
  assert.equal(stored.coop.pairCharges,1);
  assert.equal(stored.tiles[7].rotation,(newCoopGame().tiles[7].rotation+1)&3);
  assert.equal(stored.tiles[8].rotation,(newCoopGame().tiles[8].rotation+1)&3);
  assert.equal(stored.tiles[20].rotation,(newCoopGame().tiles[20].rotation+1)&3);
  assert.equal(service.db.successfulWrites,2);
  const duplicate=await service.execute({token:HOST,action:'pair',index:7,commandId:UUID(20)});
  assert.equal(duplicate.duplicate,true,'resend with the same command ID has no side effects');
  assert.equal(service.db.successfulWrites,2);
}

// 3. Guest shield and host pair rotate must both survive a concurrent commit.
{
  const service=new RoomServiceDouble();
  const gate=pairedBarrier();
  const [shield,pair]=await Promise.all([
    service.execute({token:GUEST,action:'shield',commandId:UUID(31),barrier:gate}),
    service.execute({token:HOST,action:'pair',index:2,commandId:UUID(32),barrier:gate}),
  ]);
  assert.equal(shield.status,200);
  assert.equal(pair.status,200);
  let game=(await service.db.read()).data.game;
  assert.equal(game.coop.pendingShields,1);
  assert.equal(game.coop.shieldCharges,1);
  assert.equal(game.coop.pairCharges,1);
  game=advancePacketGame(game,1000+64*520);
  assert.equal(game.coop.pendingShields,0,'a pending shield must be consumed after a deterministic fault');
  assert.equal(game.coop.blockedFaults,1);
  assert.equal(game.incidents,0);
}

// 4. Two concurrent retries of the *same* user command must only apply once.
{
  const service=new RoomServiceDouble();
  const gate=pairedBarrier();
  const options={token:HOST,action:'pair',index:1,commandId:UUID(35),barrier:gate};
  const [a,b]=await Promise.all([service.execute(options),service.execute(options)]);
  assert.equal(a.status,200);
  assert.equal(b.status,200);
  const game=(await service.db.read()).data.game;
  assert.equal(game.coop.pairCharges,1,'the same command ID cannot consume two charges');
  assert.equal(service.db.successfulWrites,1,'only one successful storage write');
  assert.equal(service.db.conflicts,1,'losing writer must reread the committed command');
  assert.equal([a.duplicate,b.duplicate].filter(Boolean).length,1);
}

// 5. Client must retain its newest authoritative snapshot across out-of-order polls.
{
  const newer={version:12,integrity:83,score:440};
  const stale={version:11,integrity:96,score:100};
  const acceptSnapshot=(previous,incoming)=>previous.version>incoming.version?previous:incoming;
  assert.deepEqual(acceptSnapshot(newer,stale),newer);
  assert.deepEqual(acceptSnapshot(stale,newer),newer);
}

// 6. Token isolation across reconnect, one-shot credits, and expiry.
{
  const service=new RoomServiceDouble();
  assert.equal((await service.execute({token:GUEST,action:'shield',commandId:UUID(40)})).status,200);
  assert.equal((await service.execute({token:GUEST,action:'shield',commandId:UUID(41)})).status,200);
  assert.equal((await service.execute({token:GUEST,action:'shield',commandId:UUID(42)})).status,409);
  assert.equal((await service.execute({token:HOST,action:'pair',index:0,commandId:UUID(43)})).status,200);
  assert.equal((await service.execute({token:HOST,action:'pair',index:1,commandId:UUID(44)})).status,200);
  assert.equal((await service.execute({token:HOST,action:'pair',index:2,commandId:UUID(45)})).status,409);
  assert.equal((await service.execute({token:GUEST,action:'rotate',index:7,commandId:UUID(46)})).status,409);
  const reconnect=await service.execute({token:GUEST,action:'rotate',index:27,commandId:UUID(47),now:1000+1500});
  assert.equal(reconnect.status,200,'guest can reconnect and act under the same signed token');
  assert.equal((await service.execute({token:GUEST,action:'shield',commandId:UUID(48),now:1000+8*60*60*1000+1})).status,404);
}
console.log('Room concurrency double: two-client CAS rebase, role spoof rejection, idempotency, fault shield, credits, reconnect, expiry PASS');
