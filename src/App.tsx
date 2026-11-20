import Exhibition from "./exhibition/Exhibition";
import StandalonePacket from "./play/StandalonePacket";

export default function App() {
  return /^\/play\/(?:packet|duel)(?:\/|$)/.test(window.location.pathname) ? <StandalonePacket /> : <Exhibition />;
}
