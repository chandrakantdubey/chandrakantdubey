import assert from 'node:assert/strict';
import {parsePacketAction} from '../api/packet.ts';
const room='A1b2C3d4E5f6';
const token='a'.repeat(32);
const commandId='a2fa2e1e-5161-4ef2-94ce-12a012e13342';
for(const action of ['pair','shield']){
  const body={action,room,token,commandId,...(action==='pair'?{index:12}:{})};
  const parsed=parsePacketAction(body);
  assert.ok(parsed.ok,action+' should be recognized by server allowlist');
  assert.equal(parsePacketAction({...body,commandId:'not-a-uuid'}).ok,false,'idempotency UUID mandatory');
  assert.equal(parsePacketAction({...body,token:'invalid'}).ok,false,'room tokens required');
  assert.equal(parsePacketAction({...body,room:'invalid'}).ok,false,'validated room code required');
}
assert.equal(parsePacketAction({action:'pair',room,token,commandId,index:35}).ok,false,'invalid node rejected');
assert.equal(parsePacketAction({action:'pair',room,token,commandId,index:-1}).ok,false,'negative node rejected');
assert.equal(parsePacketAction({action:'pair',room,token,commandId}).ok,false,'pair must specify the router');
assert.equal(parsePacketAction({action:'root',room,token,commandId}).ok,false,'unsupported command still rejected');
console.log('Co-op server parsing: action allowlist, tokens, idempotency IDs and node bounds PASS');
