import { lazy, Suspense } from "react";
import Soundscape from "./experience/Soundscape";

const Exhibition=lazy(()=>import("./exhibition/Exhibition"));
const StandalonePacket=lazy(()=>import("./play/StandalonePacket"));
const Laboratory=lazy(()=>import("./experience/Universe").then(m=>({default:m.Laboratory})));
const Disaster=lazy(()=>import("./experience/Universe").then(m=>({default:m.Disaster})));
const TakeFive=lazy(()=>import("./experience/Universe").then(m=>({default:m.TakeFive})));
const Engineering=lazy(()=>import("./experience/Universe").then(m=>({default:m.Engineering})));
const Access=lazy(()=>import("./experience/Universe").then(m=>({default:m.Access})));

export default function App() {
  const path=window.location.pathname.replace(/\/+$/,"")||"/";
  let page;
  if(/^\/play\/(?:packet|duel)(?:\/|$)/.test(path))page=<StandalonePacket/>;
  else if(path==="/lab/disaster")page=<Disaster/>;
  else if(path==="/lab/take-five")page=<TakeFive/>;
  else if(path==="/lab")page=<Laboratory/>;
  else if(path==="/engineering")page=<Engineering/>;
  else if(path==="/access")page=<Access/>;
  else page=<Exhibition/>;
  return <>
    <Suspense fallback={<main className="route-loading" role="status">LOADING EXPERIENCE</main>}>{page}</Suspense>
    <Soundscape/>
  </>;
}
