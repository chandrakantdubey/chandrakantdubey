import { ArrowLeft, ArrowUpRight } from "lucide-react";
import DuelGame from "./DuelGame";
import "./play.css";
import "../exhibition/exhibition.css";

export default function StandaloneDuel() {
  return <main className="duel-route">
    <header className="duel-route-nav">
      <a href="/#play"><ArrowLeft size={18}/> CD / EXHIBITION</a>
      <span>TRACE / HEX — TWO-PLAYER ARENA</span>
      <a href="/#contact">CONTACT <ArrowUpRight size={15}/></a>
    </header>
    <h1>TRACE <em>DUEL.</em></h1>
    <div className="duel-route-intro">
      <p>Two players. Forty-nine nodes. No downloaded games, no separate game server. Claim a continuous circuit before your opponent.</p>
      <p>Share a room link to play on another device. Each turn is verified and stored on Vercel.</p>
    </div>
    <DuelGame standalone/>
  </main>;
}
