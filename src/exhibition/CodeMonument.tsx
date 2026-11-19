import { useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { CODE_VERTEX_STRIDE, createCodeMonument } from "./codeGeometry.ts";

/**
 * A developer's signature, literally compiled into a 3D object:
 * glyph bitmaps → GPU module geometry → staggered assembly animation.
 * No pre-rendered video, remote model, network call, or inspection overlay.
 */
const vertexShader = `
attribute vec3 aLocal;
attribute vec3 aNormal;
attribute vec3 aHome;
attribute vec3 aScatter;
attribute vec2 aFaceUv;
attribute float aPhase;
attribute float aMaterial;

uniform mat3 uRotation;
uniform mat4 uProjection;
uniform float uBuild;
uniform float uTime;
uniform float uScale;

varying vec3 vNormal;
varying vec3 vEye;
varying vec2 vUv;
varying float vMaterial;
varying float vArrived;

void main() {
  float arrived = smoothstep(0.0, 1.0, (uBuild - aPhase * 0.62) * 2.4);
  vec3 center = mix(aScatter, aHome, arrived);
  center.y += sin(uTime * 0.55 + aHome.x * 1.8 + aHome.y) * 0.024 * arrived;
  vec3 p = uRotation * ((center + aLocal * (0.55 + 0.45 * arrived)) * uScale);

  vNormal = normalize(uRotation * aNormal);
  vEye = vec3(0.0, 0.0, 10.0) - p;
  vUv = aFaceUv;
  vMaterial = aMaterial;
  vArrived = arrived;

  gl_Position = uProjection * vec4(p.xy, p.z - 10.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;
varying vec3 vNormal;
varying vec3 vEye;
varying vec2 vUv;
varying float vMaterial;
varying float vArrived;

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vEye);
  vec3 key = normalize(vec3(-0.48, 0.77, 1.0));
  vec3 fill = normalize(vec3(0.71, -0.22, 0.65));

  float diffuse = max(dot(n, key), 0.0);
  float bounced = max(dot(n, fill), 0.0);
  float spec = pow(max(dot(n, normalize(v + key)), 0.0), 75.0);
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);

  vec3 metal = vec3(0.70, 0.82, 0.99);
  vec3 acid = vec3(0.91, 1.00, 0.34);
  vec3 coral = vec3(1.00, 0.39, 0.28);
  vec3 base = vMaterial < 0.5 ? metal : (vMaterial < 1.5 ? acid : coral);

  // Each module is deliberately faceted: bright top edge, deep side face,
  // Fresnel highlights and a thin embedded circuit-like contact.
  vec3 c = base * (0.31 + diffuse * 0.65 + bounced * 0.16);
  c += spec * vec3(1.0, 0.98, 0.91) * 0.93;
  c += rim * mix(vec3(0.36, 0.50, 1.0), vec3(1.0, 0.93, 0.71), vMaterial / 2.0) * 0.60;

  float edge = min(min(vUv.x, 1.0-vUv.x), min(vUv.y, 1.0-vUv.y));
  float outline = 1.0-smoothstep(0.012, 0.095, edge);
  c = mix(c, base * 1.25 + vec3(0.25,0.22,0.28), outline * 0.50);

  // Geometric signal traces within each block, not meaningless UI metrics.
  float trace = (1.0-smoothstep(0.0, 0.02, abs(vUv.y-0.50))) *
                smoothstep(0.16, 0.22, vUv.x) *
                (1.0-smoothstep(0.80, 0.86, vUv.x));
  c += trace * vec3(0.30, 0.25, 0.28) * 0.26 * vArrived;
  gl_FragColor = vec4(min(c,vec3(1.0)), 1.0);
}
`;

function shader(gl:WebGLRenderingContext,type:number,source:string):WebGLShader {
  const item=gl.createShader(type);
  if(!item)throw Error("Unable to create shader");
  gl.shaderSource(item,source);
  gl.compileShader(item);
  if(!gl.getShaderParameter(item,gl.COMPILE_STATUS)){
    const message=gl.getShaderInfoLog(item);
    gl.deleteShader(item);
    throw Error(message || "Shader did not compile");
  }
  return item;
}
function rotation(yaw:number,pitch:number):Float32Array {
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
  return new Float32Array([cy,sy*sx,-sy*cx,0,cx,sx,sy,-cy*sx,cy*cx]);
}
function projection(aspect:number):Float32Array {
  const f=1/Math.tan(43*Math.PI/360),near=.1,far=70;
  return new Float32Array([
    f/aspect,0,0,0,0,f,0,0,
    0,0,(far+near)/(near-far),-1,
    0,0,2*far*near/(near-far),0,
  ]);
}
function smooth(t:number):number {
  const clamped=Math.max(0,Math.min(1,t));
  return clamped*clamped*(3-2*clamped);
}

export default function CodeMonument() {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const hostRef=useRef<HTMLDivElement>(null);
  const rebuildRef=useRef<(()=>void)|null>(null);

  useEffect(()=>{
    const canvas=canvasRef.current;
    const host=hostRef.current;
    if(!canvas||!host)return;
    const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
    const gl=canvas.getContext("webgl",{
      alpha:true,antialias:true,depth:true,powerPreference:"default",premultipliedAlpha:false,
    });
    if(!gl){
      canvas.dataset.renderer="fallback";
      rebuildRef.current=()=>{host.classList.remove("code-pulse");void host.offsetWidth;host.classList.add("code-pulse");};
      return()=>{rebuildRef.current=null;};
    }

    let program:WebGLProgram|null=null,vertexBuffer:WebGLBuffer|null=null,indexBuffer:WebGLBuffer|null=null;
    let alive=true,visible=true,lost=false,reduced=preference.matches,frame=0,previousTime=0;
    let dragging=false,dragged=false,startX=0,startY=0,oldX=0,oldY=0;
    let yaw=-0.23,pitch=-0.19,targetYaw=-0.23,targetPitch=-0.19;
    let width=1,height=1,buildStarted=performance.now()+200,cycle=0;
    let geometry=createCodeMonument(2026);
    canvas.dataset.modules=String(geometry.modules);

    try{
      const vs=shader(gl,gl.VERTEX_SHADER,vertexShader);
      const fs=shader(gl,gl.FRAGMENT_SHADER,fragmentShader);
      program=gl.createProgram();
      if(!program)throw Error("Unable to allocate shader program");
      gl.attachShader(program,vs);gl.attachShader(program,fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);gl.deleteShader(fs);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
        throw Error(gl.getProgramInfoLog(program) || "Shader link failed");
      }
      vertexBuffer=gl.createBuffer();indexBuffer=gl.createBuffer();
      if(!vertexBuffer||!indexBuffer)throw Error("Unable to allocate GPU buffers");
      gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,geometry.vertices,gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,geometry.indices,gl.STATIC_DRAW);
      gl.useProgram(program);
      const stride=CODE_VERTEX_STRIDE*4;
      const attributes=[
        ["aLocal",3,0],["aNormal",3,3],["aHome",3,6],
        ["aScatter",3,9],["aFaceUv",2,12],["aPhase",1,14],["aMaterial",1,15],
      ] as const;
      for(const [name,size,offset] of attributes){
        const location=gl.getAttribLocation(program,name);
        if(location<0)throw Error("Missing shader attribute: "+name);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location,size,gl.FLOAT,false,stride,offset*4);
      }
      const uniforms={
        rotation:gl.getUniformLocation(program,"uRotation"),
        projection:gl.getUniformLocation(program,"uProjection"),
        build:gl.getUniformLocation(program,"uBuild"),
        time:gl.getUniformLocation(program,"uTime"),
        scale:gl.getUniformLocation(program,"uScale"),
      };
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.clearColor(0,0,0,0);
      canvas.dataset.renderer="webgl";
      host.classList.add("code-render-ready");

      const stop=()=>{
        if(frame)cancelAnimationFrame(frame);
        frame=0;previousTime=0;
      };
      const schedule=()=>{
        if(alive&&!lost&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);
      };
      const draw=(now:number)=>{
        frame=0;
        if(!alive||lost||!visible||document.hidden)return;
        const dt=previousTime?Math.min(.05,(now-previousTime)/1000):0;
        previousTime=now;
        if(!reduced){
          if(!dragging)targetYaw+=dt*.085;
          const inertia=1-Math.exp(-5.8*dt);
          yaw+=(targetYaw-yaw)*inertia;
          pitch+=(targetPitch-pitch)*inertia;
        }
        const built=reduced?1:smooth((now-buildStarted)/2050);
        canvas.dataset.assembly=built>.995?"assembled":"assembling";
        gl.viewport(0,0,canvas.width,canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix3fv(uniforms.rotation,false,rotation(yaw,pitch));
        gl.uniformMatrix4fv(uniforms.projection,false,projection(width/height));
        gl.uniform1f(uniforms.scale,width<750?Math.min(.75,Math.max(.52,width/height*.88)):Math.min(1.29,Math.max(.85,width/height*1.02)));
        gl.uniform1f(uniforms.build,built);
        gl.uniform1f(uniforms.time,now*.001);
        gl.drawElements(gl.TRIANGLES,geometry.indices.length,gl.UNSIGNED_SHORT,0);
        if(!reduced)schedule();
      };
      const resize=()=>{
        const rect=canvas.getBoundingClientRect();
        width=Math.max(1,Math.round(rect.width));height=Math.max(1,Math.round(rect.height));
        const dpr=Math.min(window.devicePixelRatio||1,window.innerWidth<650?1.3:1.7);
        canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
        stop();schedule();
      };
      const rebuild=()=>{
        if(!alive||lost)return;
        cycle++;
        geometry=createCodeMonument(2026+cycle);
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,geometry.vertices,gl.DYNAMIC_DRAW);
        canvas.dataset.rebuilds=String(cycle);
        buildStarted=performance.now()+80;
        canvas.dataset.assembly="assembling";
        targetYaw+=0.15;
        stop();schedule();
      };
      rebuildRef.current=rebuild;
      const down=(event:PointerEvent)=>{
        if(event.pointerType==="mouse"&&event.button!==0)return;
        dragging=true;dragged=false;
        startX=oldX=event.clientX;startY=oldY=event.clientY;
        try{canvas.setPointerCapture(event.pointerId);}catch{/* allowed if captured elsewhere */}
      };
      const move=(event:PointerEvent)=>{
        if(!dragging)return;
        const dx=event.clientX-oldX,dy=event.clientY-oldY;
        oldX=event.clientX;oldY=event.clientY;
        if(Math.hypot(event.clientX-startX,event.clientY-startY)>6)dragged=true;
        targetYaw+=dx*.009;
        targetPitch=Math.max(-.78,Math.min(.78,targetPitch+dy*.006));
        if(reduced){yaw=targetYaw;pitch=targetPitch;stop();schedule();}
      };
      const up=()=>{
        if(!dragging)return;
        dragging=false;
        if(!dragged)rebuild();
      };
      const motion=(e:MediaQueryListEvent)=>{
        reduced=e.matches;
        if(reduced){yaw=targetYaw;pitch=targetPitch;}
        stop();schedule();
      };
      const onVisibility=()=>{if(document.hidden)stop();else schedule();};
      const onLost=(e:Event)=>{
        e.preventDefault();
        lost=true;stop();canvas.dataset.renderer="fallback";host.classList.remove("code-render-ready");
        rebuildRef.current=()=>{host.classList.remove("code-pulse");void host.offsetWidth;host.classList.add("code-pulse");};
      };
      const intersection=new IntersectionObserver(entries=>{
        visible=Boolean(entries[0]?.isIntersecting);
        if(visible)schedule();else stop();
      },{threshold:.01});
      const observer=new ResizeObserver(resize);
      intersection.observe(canvas);observer.observe(canvas);
      canvas.addEventListener("pointerdown",down);
      canvas.addEventListener("pointermove",move);
      canvas.addEventListener("pointerup",up);
      canvas.addEventListener("pointercancel",up);
      canvas.addEventListener("lostpointercapture",up);
      canvas.addEventListener("webglcontextlost",onLost);
      document.addEventListener("visibilitychange",onVisibility);
      preference.addEventListener("change",motion);
      resize();
      return()=>{
        alive=false;stop();rebuildRef.current=null;
        intersection.disconnect();observer.disconnect();
        canvas.removeEventListener("pointerdown",down);
        canvas.removeEventListener("pointermove",move);
        canvas.removeEventListener("pointerup",up);
        canvas.removeEventListener("pointercancel",up);
        canvas.removeEventListener("lostpointercapture",up);
        canvas.removeEventListener("webglcontextlost",onLost);
        document.removeEventListener("visibilitychange",onVisibility);
        preference.removeEventListener("change",motion);
        host.classList.remove("code-render-ready");
        if(vertexBuffer)gl.deleteBuffer(vertexBuffer);
        if(indexBuffer)gl.deleteBuffer(indexBuffer);
        if(program)gl.deleteProgram(program);
      };
    }catch(error){
      console.warn("Code monument using visual fallback:",error);
      canvas.dataset.renderer="fallback";
      host.classList.remove("code-render-ready");
      rebuildRef.current=()=>{host.classList.remove("code-pulse");void host.offsetWidth;host.classList.add("code-pulse");};
      if(vertexBuffer)gl.deleteBuffer(vertexBuffer);
      if(indexBuffer)gl.deleteBuffer(indexBuffer);
      if(program)gl.deleteProgram(program);
      return()=>{rebuildRef.current=null;};
    }
  },[]);

  return <div className="code-monument" ref={hostRef}>
    <div className="code-monument-fallback" aria-hidden="true"><span>C</span><span>D</span></div>
    <canvas ref={canvasRef} className="code-monument-canvas" role="img" tabIndex={0}
      aria-label="A three-dimensional CD monogram assembled from real generated code modules. Drag to rotate, tap or press Enter to rebuild."
      onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();rebuildRef.current?.();}}}/>
    <div className="monument-source" aria-hidden="true">
      <span className="monument-file">codeGeometry.ts <span>●</span></span>
      <code><i>const</i> CD <b>=</b> <em>createCodeMonument</em>();</code>
      <small>source → modules → geometry</small>
    </div>
    <button className="monument-rebuild" type="button" onClick={()=>rebuildRef.current?.()} aria-label="Recompile the 3D CD monogram">
      <RefreshCw size={15}/> RECOMPILE <span>↗</span>
    </button>
  </div>;
}
