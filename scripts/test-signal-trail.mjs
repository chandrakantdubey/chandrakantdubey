import assert from "node:assert/strict";
import {
  SIGNAL_IDS,SIGNAL_REPORT,PROJECT_QUESTIONS,recordSignal,parseSignalProgress,
  signalReport,signalFile,combinedSignalReport,
} from "../src/exhibition/signalTrail.ts";
import {runRootCommand} from "../src/exhibition/rootCommands.ts";

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
console.log("Signal trail: fixed IDs, private session progress, honest source-backed notes and fictional terminal commands — PASS");
