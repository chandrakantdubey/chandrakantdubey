/**
 * SIGNAL / SHIFT: responsive arcade mechanics with a fixed-size virtual arena.
 * Deliberately unrelated to any portfolio repository / Blackout Protocol.
 */
export const WIDTH=960,HEIGHT=540;
export type FluxPhase="idle"|"playing"|"paused"|"over";
export interface FluxObject {
  x:number;y:number;vx:number;vy:number;r:number;
  kind:"hazard"|"spark";life:number;phase:number;
}
export interface FluxState {
  phase:FluxPhase;seed:number;tick:number;time:number;
  score:number;streak:number;health:number;wave:number;
  x:number;y:number;vx:number;vy:number;invulnerable:number;
  objects:FluxObject[];spawnTime:number;
}
export interface FluxControls {x:number;y:number;up:boolean;down:boolean;left:boolean;right:boolean;aiming:boolean;}
export function random(seed:number):[number,number] {
  let n=(seed+0x6D2B79F5)>>>0;
  n=Math.imul(n^(n>>>15),n|1);
  n^=n+Math.imul(n^(n>>>7),n|61);
  return [((n^(n>>>14))>>>0)/4294967296,(seed+0x6D2B79F5)>>>0];
}
export function newFluxGame(seed=2026):FluxState {
  return {phase:"idle",seed,tick:0,time:0,score:0,streak:0,health:3,wave:1,
    x:WIDTH/2,y:HEIGHT/2,vx:0,vy:0,invulnerable:0,objects:[],spawnTime:0};
}
export function startFlux(s:FluxState):FluxState {
  return {...s,phase:"playing"};
}
export function updateFlux(s:FluxState,input:FluxControls,dt:number):FluxState {
  if(s.phase!=="playing"||!Number.isFinite(dt))return s;
  const step=Math.max(0,Math.min(dt,.04));
  if(!step)return s;
  let seed=s.seed;
  const rand=()=>{const r=random(seed);seed=r[1];return r[0];};
  let {x,y,vx,vy,health,score,streak,invulnerable}=s;
  let ax=(Number(input.right)-Number(input.left))*1500;
  let ay=(Number(input.down)-Number(input.up))*1500;
  if(input.aiming&&Number.isFinite(input.x)&&Number.isFinite(input.y)){
    ax+=Math.max(-1400,Math.min(1400,(input.x-x)*7.2));
    ay+=Math.max(-1400,Math.min(1400,(input.y-y)*7.2));
  }
  const damping=Math.exp(-4.35*step);
  vx=(vx+ax*step)*damping;vy=(vy+ay*step)*damping;
  const speed=Math.hypot(vx,vy);
  if(speed>400){vx=vx/speed*400;vy=vy/speed*400;}
  x=Math.min(WIDTH-27,Math.max(27,x+vx*step));
  y=Math.min(HEIGHT-27,Math.max(27,y+vy*step));
  invulnerable=Math.max(0,invulnerable-step);
  const time=s.time+step;
  let objects:FluxObject[]=[];
  for(const item of s.objects){
    const obj={...item,x:item.x+item.vx*step,y:item.y+item.vy*step,life:item.life-step};
    if(obj.kind==="hazard"){
      obj.x+=Math.sin(time*1.9+obj.phase)*11*step;
      obj.y+=Math.cos(time*2.1+obj.phase)*13*step;
    }
    if(obj.life<=0||obj.x< -50||obj.x>WIDTH+50||obj.y< -50||obj.y>HEIGHT+50)continue;
    const d=Math.hypot(obj.x-x,obj.y-y);
    if(d<obj.r+14){
      if(obj.kind==="spark"){
        score+=Math.min(50,10+streak*2);streak++;
        continue;
      }
      if(invulnerable<=0){
        health--;streak=0;invulnerable=1.6;
        continue;
      }
    }
    objects.push(obj);
  }
  const wave=1+Math.floor(time/21);
  let spawnTime=s.spawnTime+step;
  const spawnEvery=Math.max(.26,.86-wave*.045);
  if(spawnTime>=spawnEvery){
    spawnTime-=spawnEvery;
    const kind=rand()<.31?"spark":"hazard";
    const edge=Math.floor(rand()*4);
    const at=rand();
    const sx=edge===0? -20:edge===1?WIDTH+20:at*WIDTH;
    const sy=edge===2? -20:edge===3?HEIGHT+20:at*HEIGHT;
    const targetX=WIDTH*(.27+rand()*.46);
    const targetY=HEIGHT*(.2+rand()*.6);
    const distance=Math.hypot(targetX-sx,targetY-sy)||1;
    const speed=(kind==="hazard"?115+wave*13:72+wave*4)+rand()*65;
    objects.push({
      kind,x:sx,y:sy,vx:(targetX-sx)/distance*speed,vy:(targetY-sy)/distance*speed,
      r:kind==="hazard"?12+rand()*11:10,
      life:kind==="hazard"?8:11,phase:rand()*Math.PI*2,
    });
  }
  // Hard limit keeps the broad-phase O(N) bounded.
  if(objects.length>90)objects=objects.slice(-90);
  return {...s,phase:health<=0?"over":"playing",seed,
    tick:s.tick+1,time,score,streak,health,wave,x,y,vx,vy,invulnerable,
    objects,spawnTime};
}
export const NO_INPUT:FluxControls={x:WIDTH/2,y:HEIGHT/2,up:false,down:false,left:false,right:false,aiming:false};
