import assert from "node:assert/strict";
import { createCodeMonument, GLYPHS, CODE_VERTEX_STRIDE, codeMonumentCorners, fitCodeMonument } from "../src/exhibition/codeGeometry.ts";
import { contactMailto } from "../src/atelier/contactMailto.ts";
import { featuredProjects, workExperience, technologyGroups, links } from "../src/atelier/content.ts";
import { publicTeamWork, internalTeamWork } from "../src/atelier/clientWork.ts";

assert.equal(GLYPHS.C.length,10);
assert.equal(GLYPHS.D.length,10);
assert.ok([...GLYPHS.C,...GLYPHS.D].every(row=>row.length===8 && /^[01]+$/.test(row)));
const occupied=[...GLYPHS.C,...GLYPHS.D].join("").split("").filter(x=>x==="1").length;
const a=createCodeMonument(2026),b=createCodeMonument(2026),c=createCodeMonument(2027);
assert.equal(a.modules,occupied);
assert.ok(a.modules>=60 && a.modules<=120,"letter geometry must be bounded");
assert.equal(a.vertices.length,a.modules*24*CODE_VERTEX_STRIDE);
assert.equal(a.indices.length,a.modules*36);
assert.deepEqual(a.vertices,b.vertices,"same identity seed gives identical compiled geometry");
assert.deepEqual(a.indices,b.indices);
assert.notDeepEqual(a.vertices.slice(0,64),c.vertices.slice(0,64),"scatter positions vary with seed");
assert.ok([...a.vertices].every(Number.isFinite),"all geometry components must be finite");
assert.ok([...a.indices].every(i=>i>=0 && i<a.modules*24),"indices must be inside VBO");
assert.ok(a.modules*24<65535,"WebGL1 Uint16 index range not exceeded");
let chrome=0,lime=0,coral=0;
for(let v=0;v<a.vertices.length;v+=CODE_VERTEX_STRIDE){
  const nx=a.vertices[v+3],ny=a.vertices[v+4],nz=a.vertices[v+5];
  assert.ok(Math.abs(Math.hypot(nx,ny,nz)-1)<.0001,"unit normal");
  const material=a.vertices[v+15];
  assert.ok([0,1,2].includes(material));
  if(material===0)chrome++;else if(material===1)lime++;else coral++;
}
assert.ok(chrome>0 && lime>0 && coral>0,"geometry needs contrasting materials");
assert.ok(a.vertices.byteLength<256*1024,"single GPU geometry stays small");


const inbox="919chandrakant@gmail.com";
assert.equal(contactMailto(inbox,{name:"",email:"",message:""}),"mailto:"+inbox,"blank draft must contain no empty labels");
const filledDraft=contactMailto(inbox,{name:"Alice & Bob",email:"alice+test@example.com",message:"Hello, let's talk about C++ & APIs."});
const filledURL=new URL(filledDraft);
assert.equal(filledURL.protocol,"mailto:");
assert.equal(filledURL.pathname,inbox);
assert.equal(filledURL.searchParams.get("subject"),"Portfolio enquiry from Alice & Bob");
assert.match(filledURL.searchParams.get("body"),/Hello, let's talk about C\+\+ & APIs\./);
assert.match(filledURL.searchParams.get("body"),/— Alice & Bob/);
assert.match(filledURL.searchParams.get("body"),/Preferred reply address: alice\+test@example.com/);
assert.ok(!filledURL.searchParams.get("body").includes("From:"),"sender is determined by the visitor's email app");
const partialDraft=new URL(contactMailto(inbox,{name:"",email:"",message:"Just saying hi."}));
assert.equal(partialDraft.searchParams.get("body"),"Just saying hi.");
assert.ok(!partialDraft.searchParams.get("body").includes("Reply"),"do not emit empty reply-to metadata");
const nameOnly=new URL(contactMailto(inbox,{name:"  Alice  ",email:"",message:""}));
assert.equal(nameOnly.searchParams.get("body"),"— Alice");
assert.equal(nameOnly.searchParams.get("subject"),"Portfolio enquiry from Alice");

const fov=1/Math.tan(43*Math.PI/360);
for(const geometry of [a,b,c]){
  const corners=codeMonumentCorners(geometry);
  assert.equal(corners.length,8);
  for(const aspect of [320/700,390/779,768/800,1440/820,1920/900]){
    for(let angle=-Math.PI;angle<=Math.PI;angle+=Math.PI/12){
      for(const pitch of [-.78,-.4,0,.4,.78]){
        const scale=fitCodeMonument(aspect,angle,pitch,corners);
        assert.ok(scale>0 && scale<=1.38,"fit scale is finite and capped");
        const cy=Math.cos(angle),sy=Math.sin(angle),cx=Math.cos(pitch),sx=Math.sin(pitch);
        for(const [x,y,z] of corners){
          const px=cy*x+sy*z,py=sy*sx*x+cx*y-cy*sx*z,pz=-sy*cx*x+sx*y+cy*cx*z;
          const depth=10-pz*scale;
          const ndcX=fov/aspect*px*scale/depth;
          const ndcY=fov*py*scale/depth;
          assert.ok(depth>0 && Math.abs(ndcX)<=.861 && Math.abs(ndcY)<=.861,
            "rotated 3D bounds must stay inside the viewport: "+JSON.stringify({aspect,angle,pitch,scale,ndcX,ndcY}));
        }
      }
    }
  }
}

assert.equal(featuredProjects.length,6);
assert.deepEqual(featuredProjects.map(p=>p.name),["Blackout Protocol","Timesheet","StyleScape","Pokédex RPG","FitStream","FarmPulse"]);
assert.ok(!featuredProjects.some(p=>p.name==="AI Concepts Atlas"));
assert.ok(featuredProjects.every(p=>p.repository.startsWith("https://github.com/chandrakantdubey/")));
assert.equal(workExperience.find(p=>p.company==="Nutriiya")?.period,"Sep 2025 — Jan 2026");
assert.equal(technologyGroups.length,4);
assert.equal(publicTeamWork.length,6);
assert.equal(internalTeamWork.length,4);
assert.ok(publicTeamWork.some(p=>p.url==="https://retail.bombaydyeing.com/"));
assert.ok(publicTeamWork.some(p=>p.url==="https://brushofhope.life"));
assert.ok(publicTeamWork.some(p=>p.url==="https://nutriiya.com"));
assert.ok(internalTeamWork.every(p=>!Object.hasOwn(p,"url")),"private work must not leak public URLs");
assert.match(links.email,/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
console.log("Code monument geometry, rotation-safe full-bleed framing, clean mailto drafts and portfolio content: PASS");
