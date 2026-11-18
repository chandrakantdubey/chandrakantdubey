import { clamp, randomFromSeed, type Pointer, type Pulse } from "./engine.ts";

export interface TypeSample {
  x: number;
  y: number;
  tone: 0 | 1;
}
export interface TypeParticle {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tone: 0 | 1;
  phase: number;
  mass: number;
}
export interface TypeFrame {
  dt: number;
  time: number;
  pointer: Pointer;
  pulses: readonly Pulse[];
}

/** The rasterizer supplies targets; this engine is pure, testable and renderer-agnostic. */
export function createTypeParticles(samples: readonly TypeSample[], seed: number): TypeParticle[] {
  const random = randomFromSeed(seed);
  const limit = 2400;
  const stride = Math.max(1, Math.ceil(samples.length / limit));
  const particles: TypeParticle[] = [];
  for (let i=0; i<samples.length; i+=stride) {
    const source = samples[i];
    const phase = random() * Math.PI * 2;
    const spread = (random() - .5) * 30;
    particles.push({
      homeX:source.x,homeY:source.y,x:source.x + Math.cos(phase)*spread,
      y:source.y + Math.sin(phase)*spread,
      vx:0,vy:0,tone:source.tone,phase,mass:.75+random()*.5,
    });
  }
  return particles;
}

/**
 * Bounded O(N × P) spring simulation where P <= 6 active impulse waves.
 * Particles follow glyph coordinates rather than arbitrary decorative objects.
 */
export function advanceTypeParticles(particles: TypeParticle[], frame: TypeFrame): void {
  const dt=clamp(frame.dt,0,.034);
  if(!dt)return;
  const time=Number.isFinite(frame.time)?frame.time:0;
  const damping=Math.exp(-7.4*dt);
  const pointerRadius=135;
  const radiusSq=pointerRadius*pointerRadius;
  for(const p of particles){
    const homeX=p.homeX+Math.sin(time*.72+p.phase)*.82;
    const homeY=p.homeY+Math.cos(time*.54+p.phase)*.82;
    let fx=(homeX-p.x)*44;
    let fy=(homeY-p.y)*44;
    if(frame.pointer.active){
      const dx=p.x-frame.pointer.x,dy=p.y-frame.pointer.y;
      const distSq=dx*dx+dy*dy;
      if(distSq>.01 && distSq<radiusSq){
        const dist=Math.sqrt(distSq);
        const weight=Math.pow(1-dist/pointerRadius,2);
        fx+=(dx/dist)*weight*5100;
        fy+=(dy/dist)*weight*5100;
      }
    }
    for(const wave of frame.pulses){
      const age=time-wave.born;
      if(age<0||age>1.55)continue;
      const dx=p.x-wave.x,dy=p.y-wave.y;
      const dist=Math.hypot(dx,dy);
      if(dist<.5)continue;
      const front=age*360;
      const phase=(dist-front)/45;
      const strength=Math.exp(-phase*phase)*(1-age/1.55)*8900;
      fx+=(dx/dist)*strength;
      fy+=(dy/dist)*strength;
    }
    p.vx=(p.vx+(fx/p.mass)*dt)*damping;
    p.vy=(p.vy+(fy/p.mass)*dt)*damping;
    p.x+=p.vx*dt;
    p.y+=p.vy*dt;
  }
}

export function typeDisplacement(particles: readonly TypeParticle[]): number {
  if(!particles.length)return 0;
  let total=0;
  for(const p of particles)total+=Math.hypot(p.x-p.homeX,p.y-p.homeY);
  return total/particles.length;
}
