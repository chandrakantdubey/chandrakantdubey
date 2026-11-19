/** Deterministic closed parametric foil ribbon. No DOM or graphics API dependencies. */
type Vec3 = [number,number,number];
const add=(a:Vec3,b:Vec3):Vec3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const scale=(a:Vec3,m:number):Vec3=>[a[0]*m,a[1]*m,a[2]*m];
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const normal=(v:Vec3):Vec3=>{const d=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/d,v[1]/d,v[2]/d];};
function curve(t:number):Vec3 {
  const loop=1.07+0.43*Math.cos(3*t);
  return [loop*Math.cos(2*t),loop*Math.sin(2*t),0.49*Math.sin(3*t)];
}
export function createFoilGeometry(segments=320,sides=16):{positions:Float32Array;indices:Uint16Array} {
  const ns=Math.max(36,Math.min(480,Math.floor(segments)));
  const nc=Math.max(8,Math.min(24,Math.floor(sides)));
  const values:number[]=[];
  const indices:number[]=[];
  for(let i=0;i<=ns;i++){
    const t=i/ns*Math.PI*2,p=curve(t),delta=0.0002;
    const tangent=normal(add(curve(t+delta),scale(curve(t-delta),-1)));
    const base=normal(cross(tangent,[0,0,1]));
    const up=normal(cross(tangent,base));
    const twist=t*2+Math.sin(3*t)*0.65;
    const u=add(scale(base,Math.cos(twist)),scale(up,Math.sin(twist)));
    const v=add(scale(base,-Math.sin(twist)),scale(up,Math.cos(twist)));
    const width=0.35+0.08*Math.sin(5*t+0.5),thickness=0.065+0.015*Math.cos(7*t);
    for(let j=0;j<=nc;j++){
      const a=j/nc*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
      const pos=add(p,add(scale(u,ca*width),scale(v,sa*thickness)));
      const surfaceNormal=normal(add(scale(u,ca/width),scale(v,sa/thickness)));
      values.push(...pos,...surfaceNormal);
      if(i<ns&&j<nc){
        const index=i*(nc+1)+j,next=index+nc+1;
        indices.push(index,next,index+1,next,next+1,index+1);
      }
    }
  }
  return {positions:new Float32Array(values),indices:new Uint16Array(indices)};
}
