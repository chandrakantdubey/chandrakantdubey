import assert from "node:assert/strict";
import { runRootCommand, ROOT_COMMANDS } from "../src/exhibition/rootCommands.ts";
import { INCIDENT_METRICS, EVIDENCE, REMEDIATIONS, evaluateRemediation } from "../src/exhibition/incidentScenario.ts";
import { utcChallengeDay, challengeSeed, resultShareText } from "../src/play/dailyChallenge.ts";

for(const cmd of ROOT_COMMANDS){
  const result=runRootCommand(cmd);
  assert.ok(Array.isArray(result.lines),"every command returns display-only text");
  assert.ok(result.lines.every(x=>typeof x==="string"),"terminal never emits executable payloads");
  assert.ok(["chaos","gravity","restore","exit","clear",null].includes(result.effect));
}
assert.equal(runRootCommand("  THEME   --CHAOS ").effect,"chaos");
assert.equal(runRootCommand("gravity --off").effect,"gravity");
assert.equal(runRootCommand("restore").effect,"restore");
assert.equal(runRootCommand("exit").effect,"exit");
assert.equal(runRootCommand("clear").effect,"clear");
assert.equal(runRootCommand("sudo hire chandrakant").effect,null);
assert.ok(runRootCommand("<script>alert(1)</script>").lines.join("").includes("command not found"));
assert.ok(!runRootCommand("<script>").lines.join("").includes("<script>"),"not even console output reflects literal tags");
assert.ok(runRootCommand("deploy --friday").lines.join("").includes("rollback"));

assert.equal(utcChallengeDay(new Date("2026-11-20T23:59:59Z")),"2026-11-20");
assert.equal(utcChallengeDay(new Date("2026-11-21T00:00:00Z")),"2026-11-21");
assert.equal(challengeSeed("2026-11-20"),challengeSeed("2026-11-20"));
assert.notEqual(challengeSeed("2026-11-20"),challengeSeed("2026-11-21"));
assert.throws(()=>challengeSeed("../../secrets"));
const share=resultShareText("2026-11-20",1320,8,37,false);
assert.ok(share.includes("1,320 PTS")&&share.includes("37% integrity"));
assert.ok(share.includes("chandrakantdubey.vercel.app/play/packet"));
assert.ok(resultShareText(null,321,2,71,true).includes("FREE PLAY"));
assert.ok(resultShareText(null,321,2,71,true,true).includes("CO-OP"));
assert.throws(()=>challengeSeed("2026-02-30"));


assert.equal(INCIDENT_METRICS.length,8);
assert.ok(INCIDENT_METRICS[0].latency<INCIDENT_METRICS.at(-1).latency);
assert.deepEqual(Object.keys(EVIDENCE).sort(),["deploy","logs","traces"]);
assert.ok(EVIDENCE.traces.lines.join(" ").includes("db.connection.acquire"));
assert.ok(EVIDENCE.deploy.lines.join(" ").includes("DB_POOL_MAX"));
assert.equal(REMEDIATIONS.length,3);
assert.equal(REMEDIATIONS.filter(x=>x.correct).length,1);
assert.equal(evaluateRemediation("rollback").correct,true);
assert.equal(evaluateRemediation("scale").correct,false);
assert.equal(evaluateRemediation("restart").correct,false);
console.log("ROOT ACCESS, session-safe fictional commands, daily challenges and interactive incident evidence: PASS");
