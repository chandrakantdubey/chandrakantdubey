import assert from 'node:assert/strict';
import {newNegotiation,negotiate,negotiationEnding,negotiationReplay} from '../src/experience/negotiatorEngine.ts';
const run=(seed,actions)=>actions.reduce((s,a)=>negotiate(s,a),newNegotiation(seed));
for(let seed=0;seed<12;seed++){
  assert.deepEqual(newNegotiation(seed),newNegotiation(seed));
  const transparent=['inspect-ledger','inspect-contract','inspect-failsafe','offer-audit','demonstrate-consistency','design-rollback','ask-why','acknowledge-risk','request-release'];
  const result=run(seed,transparent);
  assert.equal(result.ending,'transparent-release',`Transparent ending should be attainable for seed ${seed}`);
  assert.deepEqual(result,negotiationReplay(seed,transparent));
  assert.ok(result.history.some(t=>t.result==='evidence'));
  assert.ok(negotiationEnding(result).includes('YIELDS'));
  const delegation=['inspect-ledger','inspect-contract','inspect-failsafe','ask-why','offer-escrow','propose-timebox','request-release'];
  const alternate=run(seed,delegation);
  assert.equal(alternate.ending,'delegated-release',`Alternate ending should be attainable for seed ${seed}`);
  assert.ok(alternate.history.length<=15);
  const unsafe=run(seed,Array.from({length:4},()=> 'claim-root'));
  assert.equal(unsafe.ending,'sealed');
  assert.equal(negotiate(unsafe,'request-release'),unsafe);
}
const noEvidence=run(1,['request-release']);
assert.equal(noEvidence.ending,null);
assert.ok(noEvidence.suspicion>18);
assert.throws(()=>negotiate(newNegotiation(),'invalid'));
assert.throws(()=>newNegotiation(-1));
assert.throws(()=>negotiationReplay(1,Array.from({length:16},()=> 'ask-why')));
console.log('Negotiator: two valid resolutions, skepticism and failure mode, replay, command bounds PASS');
