import { lazy, Suspense } from "react";

const Exhibition=lazy(()=>import("./exhibition/Exhibition"));
const StandalonePacket=lazy(()=>import("./play/StandalonePacket"));

/** Standalone arcade URLs should never load the entire exhibition. */
export default function App() {
  const standalone=/^\/play\/(?:packet|duel)(?:\/|$)/.test(window.location.pathname);
  return <Suspense fallback={<main className="route-loading" role="status">LOADING EXPERIENCE</main>}>
    {standalone?<StandalonePacket/>:<Exhibition/>}
  </Suspense>;
}
