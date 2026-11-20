/**
 * Specimen's optional discovery trail.
 *
 * Only a tiny set of non-sensitive IDs is persisted. No hidden content is
 * required to view projects, play games, or contact the developer.
 */
export const SIGNAL_IDS=["archive","lab","arcade"] as const;
export type SignalId=typeof SIGNAL_IDS[number];
export type SignalProgress=readonly SignalId[];

export const SIGNAL_REPORT={
  archive:{
    label:"ARCHIVE",
    title:"Engineering decisions",
    summary:"Six source-linked projects expose their implementation boundaries and the questions worth asking of each design.",
  },
  lab:{
    label:"LAB",
    title:"Evidence before action",
    summary:"Of a 2,102 ms request, 1,957 ms is connection acquisition. The SQL work itself takes 21 ms. The pool and concurrency mismatch is the stronger lead.",
  },
  arcade:{
    label:"ARCADE",
    title:"Authority and consistency",
    summary:"A deterministic 520 ms simulation runs locally or server-authoritatively. Two-player rooms use versioned Blob compare-and-swap and polling, not WebSockets.",
  },
} as const satisfies Record<SignalId,{label:string;title:string;summary:string}>;

export const PROJECT_QUESTIONS:Record<string,string>={
  blackout:"How do authoritative rooms validate concurrent tile actions, and how does a reconnect avoid a second session?",
  timesheet:"Which service owns employee state, and where are access rules enforced when the HRMS boundary is crossed?",
  stylescape:"How are editor scenes serialized so exported SVG, CSS, and PNG represent the same visual state?",
  pokedex:"Which layer settles battle outcomes and inventory changes when multiple client requests arrive?",
  fitstream:"How do workout records and route tracking stay consistent when connectivity is unreliable?",
  farmpulse:"What backs the time-series ingestion path, and how would delayed sensor readings be handled?",
};

export function isSignalId(value:unknown):value is SignalId {
  return typeof value==="string"&&(SIGNAL_IDS as readonly string[]).includes(value);
}

export function parseSignalProgress(value:unknown):SignalProgress {
  if(!Array.isArray(value))return [];
  return SIGNAL_IDS.filter(id=>value.includes(id));
}

export function recordSignal(previous:SignalProgress,id:SignalId):SignalProgress {
  if(previous.includes(id))return previous;
  return SIGNAL_IDS.filter(item=>previous.includes(item)||item===id);
}

export function signalReport(progress:SignalProgress):string[] {
  return [
    "SIGNAL INDEX  "+progress.length+"/"+SIGNAL_IDS.length+" RECOVERED",
    ...SIGNAL_IDS.map(id=>
      (progress.includes(id)?"[READ] ":"[----] ")+SIGNAL_REPORT[id].label+
      " / "+SIGNAL_REPORT[id].title),
    ...(progress.length===SIGNAL_IDS.length
      ?["All three traces correlate. Read: cat /signals/report"]
      :["Each note is optional. There are no locked pages."]),
  ];
}

export function signalFile(id:SignalId,progress:SignalProgress):string[] {
  if(!progress.includes(id))return [
    "No note recovered for "+SIGNAL_REPORT[id].label+".",
    "Open the corresponding engineering note in the portfolio.",
  ];
  const note=SIGNAL_REPORT[id];
  return [note.label+" / "+note.title,note.summary];
}

export function combinedSignalReport(progress:SignalProgress):string[] {
  if(progress.length!==SIGNAL_IDS.length)return [
    "Report incomplete. "+progress.length+"/"+SIGNAL_IDS.length+" notes recovered.",
    "Type signals to see what's missing.",
  ];
  return [
    "ARCHIVE / LAB / ARCADE",
    "The same design principle appears in all three systems:",
    "Explicit state ownership, observable failure, and recovery.",
    "No hidden access was granted. Just better evidence.",
  ];
}
