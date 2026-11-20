import assert from "node:assert/strict";
import {
  SIGNAL_IDS,SIGNAL_REPORT,PROJECT_QUESTIONS,recordSignal,parseSignalProgress,
  signalReport,signalFile,combinedSignalReport,
} from "../src/exhibition/signalTrail.ts";
import {runRootCommand} from "../src/exhibition/rootCommands.ts";
import {simulateCasRace,CAS_START_VERSION} from "../src/exhibition/consistencyRace.ts";
import {readSpecimenMode} from "../src/exhibition/specimenSession.ts";

assert.deepEqual(SIGNAL_IDS,["archive","lab","arcade"]);
assert.deepEqual(parseSignalProgress(null),[]);
assert.deepEqual(parseSignalProgress({signals:["archive"]}),[]);
assert.deepEqual(parseSignalProgress(["lab","lab","unknown","archive"]),
  ["archive","lab"],"invalid, duplicate and out-of-order stored IDs are rejected");
assert.equal(Object.keys(PROJECT_QUESTIONS).length,6);
for(const id of ["blackout","timesheet","stylescape","pokedex","fitstream","farmpulse"]){
  assert.ok(PROJECT_QUESTIONS[id]?.endsWith("?"),"project note asks an engineering question");
}
let progress=[];
progress=recordSignal(progress,"arcade");
assert.deepEqual(progress,["arcade"]);
progress=recordSignal(progress,"archive");
assert.deepEqual(progress,["archive","arcade"],"notes have stable ordering");
assert.strictEqual(recordSignal(progress,"arcade"),progress,"repeating a discovery is a no-op");
assert.equal(signalReport(progress)[0],"SIGNAL INDEX  2/3 RECOVERED");
assert.ok(signalFile("lab",progress).join(" ").includes("No note recovered"));
assert.ok(!combinedSignalReport(progress).join(" ").includes("Explicit state ownership"));
const context={awakened:true,signals:progress};
assert.ok(runRootCommand("signals",context).lines.join(" ").includes("2/3"));
assert.ok(runRootCommand("ls /signals",context).lines.includes("archive.note"));
assert.ok(runRootCommand("cat /signals/archive.note",context).lines.join(" ").includes(SIGNAL_REPORT.archive.title));
assert.ok(runRootCommand("cat /signals/lab",context).lines.join(" ").includes("No note recovered"));
assert.equal(runRootCommand("signals --reset",context).effect,"reset-signals");
assert.ok(runRootCommand("signals", {awakened:false,signals:progress}).lines[0].includes("dormant"));
assert.ok(runRootCommand("cat /signals/archive",{awakened:false,signals:progress}).lines[0].includes("dormant"));
progress=recordSignal(progress,"lab");
assert.deepEqual(progress,["archive","lab","arcade"]);
assert.ok(signalFile("lab",progress).join(" ").includes("1,957"));
assert.ok(runRootCommand("cat /signals/report",{awakened:true,signals:progress})
  .lines.join(" ").includes("Explicit state ownership"));
assert.ok(runRootCommand("cat /signals/report",{awakened:false,signals:progress})
  .lines.join(" ").includes("dormant"));
assert.equal(runRootCommand("rm -rf /",context).effect,null,"terminal never executes arbitrary commands");
assert.equal(readSpecimenMode("awakened"),"awakened");
assert.equal(readSpecimenMode("sealed"),"sealed");
assert.equal(readSpecimenMode("javascript:evil"),"sealed","unknown persisted states fall back to safe defaults");
for(const winner of ["ingress","egress"]) {
  const race=simulateCasRace(winner);
  assert.equal(race.startVersion,CAS_START_VERSION);
  assert.equal(race.winnerVersion,race.startVersion+1);
  assert.equal(race.finalVersion,race.startVersion+2);
  assert.notEqual(race.winner,race.loser);
  assert.equal(race.losingExpected,CAS_START_VERSION,"the losing action must remain stale");
  assert.equal(race.conflictActual,CAS_START_VERSION+1,"stale CAS is rejected, not overwritten");
  assert.ok(race.orderedEvents[2].includes("rejected"));
  assert.ok(race.orderedEvents.at(-1).includes("Both valid actions survive"));
}
console.log("Signal trail: fixed IDs, private session progress, honest source-backed notes and fictional terminal commands — PASS");
