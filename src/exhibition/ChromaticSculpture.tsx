import { useEffect, useRef } from "react";

/**
 * CHROMATIC / 001
 * Continuous metallic foil sculpture generated from a parametric closed curve.
 * WebGL1 with no remote models, textures or 3D framework dependency.
 */
const vertexSource = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat3 uRotation;
uniform mat4 uProjection;
uniform float uTime;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vLocal;
void main() {
  float micro = 0.007 * sin(aPosition.y * 7.0 + aPosition.x * 4.0 + uTime * 0.65);
  vec3 local = aPosition + aNormal * micro;
  vec3 p = uRotation * local;
  vWorld = p;
  vLocal = local;
  vNormal = normalize(uRotation * aNormal);
  gl_Position = uProjection * vec4(p.x, p.y, p.z - 5.6, 1.0);
}`;
const fragmentSource = `
precision highp float;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vLocal;
uniform float uTime;
uniform float uAccent;
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vec3(0.0, 0.0, 5.6) - vWorld);
  if (!gl_FrontFacing) n = -n;
  vec3 r = reflect(-v, n);
  float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.2);
  float band = sin(r.y * 13.0 + atan(r.x, r.z) * 3.8 + uAccent * 1.7);
  float soft = smoothstep(-0.48, 0.84, r.y);
  float strip = smoothstep(-0.25, 0.9, band);
  float streak = pow(max(0.0, cos(r.y * 19.0 + r.x * 6.0)), 12.0);
  vec3 chrome = mix(vec3(0.027, 0.036, 0.084),
                    vec3(0.85, 0.91, 0.97),
                    clamp(soft * 0.36 + strip * 0.64, 0.0, 1.0));
  float hueMix = 0.5 + 0.5 * sin(r.x * 6.0 - r.z * 4.0 + vWorld.y * 3.4 + uAccent * 0.4);
  vec3 iridescence = mix(vec3(1.0, 0.33, 0.26), vec3(0.26, 0.93, 0.98), hueMix);
  chrome = mix(chrome, iridescence, 0.16 + 0.42 * fresnel);
  vec3 light = normalize(vec3(-0.38, 0.65, 0.7));
  float spec = pow(max(dot(n, normalize(v + light)), 0.0), 76.0);
  float second = pow(max(dot(n, normalize(v + vec3(0.7, -0.4, 0.4))), 0.0), 100.0);
  chrome += vec3(1.0, 0.97, 0.93) * spec * 1.4;
  chrome += vec3(0.86, 0.72, 1.0) * second * 0.83;
  chrome += vec3(0.18, 0.34, 0.74) * streak * 0.2;
  chrome += fresnel * mix(vec3(0.31,0.24,0.95),vec3(0.91,0.94,1.0),hueMix) * 0.72;
  chrome *= 0.91 + 0.09 * sin(vLocal.x * 5.0 + uTime * 0.13);
  chrome = 1.0 - exp(-chrome * 1.2);
  gl_FragColor = vec4(pow(chrome, vec3(0.92)), 1.0);
}`;

type Vec3 = [number,number,number];
const add=(a:Vec3,b:Vec3):Vec3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const scale=(a:Vec3,m:number):Vec3=>[a[0]*m,a[1]*m,a[2]*m];
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const normal=(v:Vec3):Vec3=>{const d=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/d,v[1]/d,v[2]/d];};
function curve(t:number):Vec3 {
  const loop=1.07+0.43*Math.cos(3*t);
  return [loop*Math.cos(2*t),loop*Math.sin(2*t),0.49*Math.sin(3*t)];
}
function createFoilGeometry(segments=320,sides=16):{positions:Float32Array;indices:Uint16Array} {
  const ns=Math.max(36,Math.min(480,Math.floor(segments)));
  const nc=Math.max(8,Math.min(24,Math.floor(sides)));
  const values:number[]=[];
  const indices:number[]=[];
  for(let i=0;i<=ns;i++){
    const t=i/ns*Math.PI*2,p=curve(t),delta=0.0002;
    const tangent=normal(add(curve(t+delta),scale(curve(t-delta),-1)));
    const base=normal(cross(tangent,[0,0,1]));
    const up=normal(cross(tangent,base));
    const twist=t*1.5+Math.sin(3*t)*0.65;
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
function makeShader(gl:WebGLRenderingContext,type:number,source:string) {
  const shader=gl.createShader(type);
  if(!shader)throw Error("Shader allocation failed");
  gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
    const error=gl.getShaderInfoLog(shader);gl.deleteShader(shader);
    throw Error("Chromatic shader failed: "+error);
  }
  return shader;
}
function projection(aspect:number):Float32Array {
  const f=1/Math.tan(48*Math.PI/360),near=.1,far=40;
  return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);
}
function rotation(yaw:number,pitch:number):Float32Array {
  const sy=Math.sin(yaw),cy=Math.cos(yaw),sx=Math.sin(pitch),cx=Math.cos(pitch);
  return new Float32Array([cy,sy*sx,-sy*cx,0,cx,sx,sy,-cy*sx,cy*cx]);
}

export default function ChromaticSculpture() {
  const element=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=element.current;
    if(!canvas)return;
    const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
    const gl=canvas.getContext("webgl",{alpha:true,antialias:true,depth:true,powerPreference:"default",premultipliedAlpha:false});
    if(!gl){canvas.dataset.renderer="fallback";return;}
    let program:WebGLProgram|null=null,vertexBuffer:WebGLBuffer|null=null,indexBuffer:WebGLBuffer|null=null;
    let raf=0,alive=true,visible=true,mouseDown=false,wasDragged=false,reduced=preference.matches,lastTime=0;
    let yaw=-.45,pitch=.23,desiredYaw=-.45,desiredPitch=.23,activity=0;
    let downX=0,downY=0,oldX=0,oldY=0,accent=0,displayWidth=1,displayHeight=1;
    try{
      const vs=makeShader(gl,gl.VERTEX_SHADER,vertexSource),fs=makeShader(gl,gl.FRAGMENT_SHADER,fragmentSource);
      program=gl.createProgram();
      if(!program)throw Error("Program allocation failed");
      gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      gl.deleteShader(vs);gl.deleteShader(fs);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||"Program failed to link");
      const geometry=createFoilGeometry(window.innerWidth<620?200:360,window.innerWidth<620?12:18);
      vertexBuffer=gl.createBuffer();indexBuffer=gl.createBuffer();
      if(!vertexBuffer||!indexBuffer)throw Error("Geometry allocation failed");
      gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,geometry.positions,gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,geometry.indices,gl.STATIC_DRAW);
      gl.useProgram(program);
      const pos=gl.getAttribLocation(program,"aPosition"),norm=gl.getAttribLocation(program,"aNormal");
      gl.vertexAttribPointer(pos,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(norm,3,gl.FLOAT,false,24,12);gl.enableVertexAttribArray(norm);
      gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
      const rotLoc=gl.getUniformLocation(program,"uRotation"),projLoc=gl.getUniformLocation(program,"uProjection");
      const timeLoc=gl.getUniformLocation(program,"uTime"),accentLoc=gl.getUniformLocation(program,"uAccent");
      canvas.dataset.renderer="webgl";
      const draw=(now:number)=>{
        raf=0;
        if(!alive||!visible||document.hidden)return;
        const dt=lastTime?Math.min(.045,(now-lastTime)/1000):0;
        lastTime=now;
        if(!reduced){
          if(!mouseDown&&activity<.03)desiredYaw+=dt*.085;
          const factor=Math.min(1,dt*5.8);
          yaw+=(desiredYaw-yaw)*factor;pitch+=(desiredPitch-pitch)*factor;
          activity*=Math.exp(-dt*2.2);
        }
        gl.viewport(0,0,canvas.width,canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix3fv(rotLoc,false,rotation(yaw,pitch));
        gl.uniformMatrix4fv(projLoc,false,projection(Math.max(.45,displayWidth/displayHeight)));
        gl.uniform1f(timeLoc,now*.001);gl.uniform1f(accentLoc,accent);
        gl.drawElements(gl.TRIANGLES,geometry.indices.length,gl.UNSIGNED_SHORT,0);
        if(!reduced)schedule();
      };
      const schedule=()=>{
        if(!raf&&alive&&visible&&!document.hidden)raf=requestAnimationFrame(draw);
      };
      const stop=()=>{if(raf)cancelAnimationFrame(raf);raf=0;lastTime=0;};
      const resize=()=>{
        const rect=canvas.getBoundingClientRect();
        displayWidth=Math.max(1,Math.round(rect.width));displayHeight=Math.max(1,Math.round(rect.height));
        const dpr=Math.min(window.devicePixelRatio||1,window.innerWidth<620?1.35:1.7);
        canvas.width=Math.round(displayWidth*dpr);canvas.height=Math.round(displayHeight*dpr);
        stop();schedule();
      };
      const down=(e:PointerEvent)=>{
        if(e.pointerType==="mouse"&&e.button!==0)return;
        mouseDown=true;wasDragged=false;oldX=e.clientX;oldY=e.clientY;downX=oldX;downY=oldY;
        canvas.setPointerCapture(e.pointerId);
      };
      const move=(e:PointerEvent)=>{
        if(!mouseDown)return;
        const dx=e.clientX-oldX,dy=e.clientY-oldY;
        oldX=e.clientX;oldY=e.clientY;
        if(Math.hypot(e.clientX-downX,e.clientY-downY)>5)wasDragged=true;
        desiredYaw+=dx*.009;desiredPitch=Math.max(-1.05,Math.min(1.05,desiredPitch+dy*.006));
        activity=1;
        if(reduced){yaw=desiredYaw;pitch=desiredPitch;stop();schedule();}
      };
      const up=()=>{
        if(!mouseDown)return;
        mouseDown=false;
        if(!wasDragged){desiredYaw+=.55;accent+=.35;activity=1;if(reduced){yaw=desiredYaw;stop();schedule();}}
      };
      const visibility=()=>{if(document.hidden)stop();else schedule();};
      const motion=(e:MediaQueryListEvent)=>{reduced=e.matches;stop();schedule();};
      const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;if(visible)schedule();else stop();},{threshold:.01});
      const sizeObserver=new ResizeObserver(resize);
      observer.observe(canvas);sizeObserver.observe(canvas);
      canvas.addEventListener("pointerdown",down);
      canvas.addEventListener("pointermove",move);
      canvas.addEventListener("pointerup",up);
      canvas.addEventListener("pointercancel",up);
      canvas.addEventListener("lostpointercapture",up);
      document.addEventListener("visibilitychange",visibility);
      preference.addEventListener("change",motion);
      resize();
      return()=>{
        alive=false;stop();observer.disconnect();sizeObserver.disconnect();
        canvas.removeEventListener("pointerdown",down);
        canvas.removeEventListener("pointermove",move);
        canvas.removeEventListener("pointerup",up);
        canvas.removeEventListener("pointercancel",up);
        canvas.removeEventListener("lostpointercapture",up);
        document.removeEventListener("visibilitychange",visibility);
        preference.removeEventListener("change",motion);
        if(vertexBuffer)gl.deleteBuffer(vertexBuffer);
        if(indexBuffer)gl.deleteBuffer(indexBuffer);
        if(program)gl.deleteProgram(program);
      };
    }catch(error){
      canvas.dataset.renderer="fallback";
      console.warn("Chromatic sculpture using CSS fallback:",error);
      if(vertexBuffer)gl.deleteBuffer(vertexBuffer);
      if(indexBuffer)gl.deleteBuffer(indexBuffer);
      if(program)gl.deleteProgram(program);
    }
  },[]);
  return <div className="chromatic-art" aria-label="Interactive floating metallic sculpture. Drag or tap to rotate it.">
    <div className="chromatic-fallback" aria-hidden="true"><div className="fallback-ring fallback-a"/><div className="fallback-ring fallback-b"/><div className="fallback-core"/></div>
    <canvas ref={element} className="chromatic-canvas" role="img" aria-label="A metallic ribbon sculpture. Drag or tap to rotate it."/>
  </div>;
}
