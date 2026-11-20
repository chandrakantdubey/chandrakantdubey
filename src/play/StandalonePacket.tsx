import { ArrowLeft, ArrowUpRight } from "lucide-react";
import PacketPanic from "./PacketPanic";
import "./play.css";
import "./packet.css";
import "../exhibition/exhibition.css";

export default function StandalonePacket() {
  return <main className="packet-route">
    <nav className="packet-route-nav" aria-label="Game navigation">
      <a href="/#final-boss"><ArrowLeft size={17}/> BACK TO THE PORTFOLIO</a>
      <span>THE INTERNET WAS DOING FINE WITHOUT THIS. PROBABLY.</span>
      <a href="/#contact">CONTACT <ArrowUpRight size={16}/></a>
    </nav>
    <PacketPanic standalone/>
    <footer className="packet-route-footer">NO ACCOUNTS. JUST BAD ROUTING DECISIONS AND CONSEQUENCES.</footer>
  </main>;
}
