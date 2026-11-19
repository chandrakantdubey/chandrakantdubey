import Exhibition from "./exhibition/Exhibition";
import StandaloneDuel from "./play/StandaloneDuel";

export default function App() {
  return window.location.pathname.startsWith("/play/duel") ? <StandaloneDuel /> : <Exhibition />;
}
