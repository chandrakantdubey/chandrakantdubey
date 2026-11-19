/**
 * The hero geometry is compiled from literal 8x10 bitmap glyphs, not imported
 * artwork. Every set bit becomes a real extruded module with six lit faces.
 * Deterministic scatter coordinates allow a reversible build animation.
 */
export const GLYPHS = {
  C: [
    "00111110",
    "01100011",
    "11000001",
    "11000000",
    "11000000",
    "11000000",
    "11000000",
    "11000001",
    "01100011",
    "00111110",
  ],
  D: [
    "11111000",
    "11001100",
    "11000110",
    "11000011",
    "11000011",
    "11000011",
    "11000011",
    "11000110",
    "11001100",
    "11111000",
  ],
} as const;

export type CodeGeometry = { vertices:Float32Array; indices:Uint16Array; modules:number };
const STRIDE=16;
export const CODE_VERTEX_STRIDE=STRIDE;
const sides:ReadonlyArray<{normal:[number,number,number];corners:ReadonlyArray<readonly [number,number,number]>}>=[
  {normal:[0,0,1],corners:[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]},
  {normal:[0,0,-1],corners:[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]},
  {normal:[1,0,0],corners:[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]]},
  {normal:[-1,0,0],corners:[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]]},
  {normal:[0,1,0],corners:[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]]},
  {normal:[0,-1,0],corners:[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]},
];
const UV:ReadonlyArray<[number,number]>=[[0,0],[1,0],[1,1],[0,1]];
function randomFrom(seed:number):()=>number {
  let state=seed>>>0;
  return()=>{
    state=(state+0x6D2B79F5)>>>0;
    let z=state;
    z=Math.imul(z^(z>>>15),z|1);
    z^=z+Math.imul(z^(z>>>7),z|61);
    return ((z^(z>>>14))>>>0)/4294967296;
  };
}
export function createCodeMonument(seed=2026):CodeGeometry {
  const random=randomFrom(seed);
  const vertices:number[]=[];
  const indices:number[]=[];
  let modules=0;
  for(const [letter,glyph] of Object.entries(GLYPHS)){
    const offset=letter==="C"?0:10;
    for(let row=0;row<glyph.length;row++){
      for(let col=0;col<glyph[row].length;col++){
        if(glyph[row][col]!=="1")continue;
        const x=(col+offset-8.5)*.43;
        const y=(4.5-row)*.46;
        const z=Math.sin(row*.79+col*.68)*.125+(letter==="D"?.12:-.1);
        const phase=random()*.95;
        const angle=random()*Math.PI*2;
        const reach=2.4+random()*4.2;
        const scatterX=x+Math.cos(angle)*reach;
        const scatterY=y+Math.sin(angle)*reach;
        const scatterZ=z+(random()-.38)*6;
        const material=(random()<.12?2:random()<.26?1:0);
        const start=vertices.length/STRIDE;
        for(const side of sides){
          for(let corner=0;corner<4;corner++){
            const point=side.corners[corner];
            const dimensions:[number,number,number]=[.36,.385,.36];
            vertices.push(
              point[0]*dimensions[0]/2,point[1]*dimensions[1]/2,point[2]*dimensions[2]/2,
              ...side.normal,
              x,y,z,
              scatterX,scatterY,scatterZ,
              ...UV[corner],
              phase,material,
            );
          }
        }
        for(let face=0;face<6;face++){
          const first=start+face*4;
          indices.push(first,first+1,first+2,first,first+2,first+3);
        }
        modules++;
      }
    }
  }
  if(modules*24>65535)throw Error("Too many modules for WebGL1 uint16 indices");
  return {vertices:new Float32Array(vertices),indices:new Uint16Array(indices),modules};
}
