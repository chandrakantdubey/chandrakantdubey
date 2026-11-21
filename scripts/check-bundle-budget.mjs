import assert from "node:assert/strict";
import { readFileSync,readdirSync,statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const dist="dist";
const root=readFileSync(join(dist,"index.html"),"utf8");
const assets=readdirSync(join(dist,"assets"));
const scripts=assets.filter(name=>name.endsWith(".js"));
const styles=assets.filter(name=>name.endsWith(".css"));
const gzipBytes=name=>gzipSync(readFileSync(join(dist,"assets",name)),{level:9}).length;
const kib=value=>Math.round(value/1024*10)/10;

assert.ok(scripts.length>=5,
  "Incident Replay, two games, standalone route and consistency experiment must be code-split");
for(const expected of ["Exhibition-","StandalonePacket-","PacketPanic-","FluxGame-","IncidentReplay-"]){
  assert.ok(scripts.some(name=>name.startsWith(expected)),"Missing independently loadable route/experience: "+expected);
}

const entry=root.match(/<script[^>]+type="module"[^>]+src="\/assets\/([^"]+\.js)"/)?.[1]
  ??root.match(/<script[^>]+src="\/assets\/([^"]+\.js)"[^>]+type="module"/)?.[1];
assert.ok(entry,"Vite HTML must advertise its initial module script.");
const seen=new Set();
function visit(name){
  if(seen.has(name))return;
  assert.ok(scripts.includes(name),"Static JS import from build is missing: "+name);
  seen.add(name);
  const source=readFileSync(join(dist,"assets",name),"utf8");
  // Static ESM dependencies: ignore import("./dynamic.js") and Vite prefetch.
  const imports=/(?:\bfrom\s*|(?:^|[;\n])\s*import\s*)["']\.\/([^"']+\.js)["']/g;
  for(const match of source.matchAll(imports))visit(match[1]);
}
visit(entry);

const entryGzip=[...seen].reduce((sum,name)=>sum+gzipBytes(name),0);
const totalJs=scripts.reduce((sum,name)=>sum+gzipBytes(name),0);
const totalCss=styles.reduce((sum,name)=>sum+gzipBytes(name),0);
const largest=Math.max(...scripts.map(name=>gzipBytes(name)));
const BUDGET={
  initialJsGzip:115*1024,
  totalJsGzip:260*1024,
  totalCssGzip:50*1024,
  largestJsChunkGzip:120*1024,
};
const result={
  initialModules:[...seen],
  initialJsGzipKiB:kib(entryGzip),
  totalJsGzipKiB:kib(totalJs),
  totalCssGzipKiB:kib(totalCss),
  largestChunkGzipKiB:kib(largest),
  jsChunks:scripts.length,
  cssChunks:styles.length,
  budgetsKiB:Object.fromEntries(Object.entries(BUDGET).map(([key,bytes])=>[key,kib(bytes)])),
};
console.log("Performance bundle budget:",JSON.stringify(result,null,2));

assert.ok(entryGzip<=BUDGET.initialJsGzip, "Initial JS exceeds budget "+kib(entryGzip)+" KiB");
assert.ok(totalJs<=BUDGET.totalJsGzip, "Total JS exceeds budget "+kib(totalJs)+" KiB");
assert.ok(totalCss<=BUDGET.totalCssGzip, "CSS exceeds budget "+kib(totalCss)+" KiB");
assert.ok(largest<=BUDGET.largestJsChunkGzip,"Individual JS chunk exceeds budget "+kib(largest)+" KiB");
assert.ok(statSync(join(dist,"index.html")).size>100);
console.log("Entrypoint isolation, meaningful chunks and compressed asset budgets — PASS");
