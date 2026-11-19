import { ArrowLeft, ArrowUpRight } from "lucide-react";
import DuelGame from "./DuelGame";
import "./play.css";
import "../exhibition/exhibition.css";

export default function StandaloneDuel() {
  return <main className="duel-route">
    <header className="duel-route-nav">
      <a href="/#play"><ArrowLeft size={18}/> BACK TO THE MAIN EVENT</a>
      <span>YES, THE ARGUMENT HAS ITS OWN URL</span>
      <a href="/#contact">CONTACT <ArrowUpRight size={15}/></a>
    </header>
    <h1>HEX <em>HAPPENS.</em></h1>
    <div className="duel-route-intro">
      <p>Forty-nine hexes. One suspiciously confident opponent. Connect your sides before theirs.</p>
      <p>Invite a friend. Or don’t. The bot has nowhere else to be.</p>
    </div>
    <DuelGame standalone/>
  </main>;
}
