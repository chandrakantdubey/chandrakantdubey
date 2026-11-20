import assert from "node:assert/strict";
import { specimenLine, specimenLines, shouldComment, SPECIMEN_COMMENT_COOLDOWN_MS } from "../src/exhibition/specimenCharacter.ts";

const moments=Object.keys(specimenLines);
assert.deepEqual(moments.sort(),["awakened","defeat","restored","victory"]);
for(const moment of moments){
  const entries=specimenLines[moment];
  assert.ok(entries.length>=2,"multiple responses avoid repetition: "+moment);
  for(let i=0;i<entries.length*3;i++){
    assert.equal(specimenLine(moment,i),entries[i%entries.length]);
    assert.notEqual(specimenLine(moment,i),specimenLine(moment,i+1),"consecutive lines must differ");
    assert.ok(specimenLine(moment,i).length<92,"a short line, not a monologue");
  }
  assert.ok(entries.every(x=>!/looks harmless|legendary beast|god mode|unlock your power/i.test(x)),
    "do not replace dry humor with marketing slogans");
}
assert.equal(SPECIMEN_COMMENT_COOLDOWN_MS,20000);
assert.equal(shouldComment(1000,1000),false);
assert.equal(shouldComment(1000,20999),false);
assert.equal(shouldComment(1000,21000),true);
assert.equal(shouldComment(1000,25000),true);
console.log("Specimen editorial dialogue, deduplication and silence budget — PASS");
