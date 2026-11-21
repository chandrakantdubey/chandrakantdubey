import { useEffect, useRef, useState } from "react";
import "./experience.css";
import { revealDiscovery } from "./discoveries";

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };
function getAudioContext(): AudioContext | null {
  const W = window as AudioWindow;
  const Factory = W.AudioContext ?? W.webkitAudioContext;
  return Factory ? new Factory() : null;
}
/** Sound is entirely opt-in. No remote files, autoplay, tracking, or endless oscillators. */
export default function Soundscape() {
  const [enabled, setEnabled] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => () => { void audio.current?.close(); }, []);
  useEffect(()=>{const onResult=()=>revealDiscovery("network");window.addEventListener("cd:packet-result",onResult);return()=>window.removeEventListener("cd:packet-result",onResult)},[]);
  useEffect(() => {
    if (!enabled) return;
    const play = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("button,a,[role='button']")) return;
      const ctx = audio.current;
      if (!ctx || ctx.state !== "running") return;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(380, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.032, ctx.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.11);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.12);
    };
    document.addEventListener("click", play);
    return () => document.removeEventListener("click", play);
  }, [enabled]);
  const toggle = async () => {
    if (enabled) { setEnabled(false); await audio.current?.suspend(); return; }
    if (!audio.current) audio.current = getAudioContext();
    if (!audio.current) return;
    try { await audio.current.resume(); setEnabled(true); } catch { setEnabled(false); }
  };
  return <button className="experience-sound" onClick={() => void toggle()} type="button"
    aria-label={enabled ? "Mute interface sound" : "Enable interface sound"}
    aria-pressed={enabled} title="Optional interface sound">
    <span aria-hidden="true">{enabled ? "♫" : "♪"}</span>
    <span>{enabled ? "SOUND ON" : "SOUND OFF"}</span>
  </button>;
}
