export const INCIDENT_METRICS=[
  {time:"00:00",latency:118,errors:0.2},
  {time:"00:10",latency:127,errors:0.2},
  {time:"00:20",latency:142,errors:0.3},
  {time:"00:30",latency:184,errors:0.4},
  {time:"00:35",latency:760,errors:4.9},
  {time:"00:40",latency:1360,errors:12.8},
  {time:"00:45",latency:1940,errors:21.4},
  {time:"00:50",latency:2110,errors:24.3},
] as const;

export type EvidenceKind="traces"|"logs"|"deploy";
export const EVIDENCE:Record<EvidenceKind,{label:string;heading:string;lines:string[];insight:string}>={
  traces:{
    label:"01 / TRACES",
    heading:"Where the request is really waiting",
    lines:[
      "GET /api/checkout                2,102 ms",
      "  auth.validate                   12 ms",
      "  orders.create                 2,061 ms",
      "    db.connection.acquire       1,957 ms  ←",
      "    INSERT INTO orders            21 ms",
    ],
    insight:"The SQL query is fast. Acquiring a database connection is not. Increasing database capacity without confirming saturation could waste money.",
  },
  logs:{
    label:"02 / LOGS",
    heading:"A queue that stopped being a queue",
    lines:[
      "14:32:11 WARN pool acquire timeout after 2000ms",
      "14:32:12 WARN waiting_clients=186 active=20 idle=0",
      "14:32:13 ERROR checkout failed: database busy",
      "14:32:13 INFO retries=3 request_id=8e1c…",
      "14:32:14 WARN retry storm increasing concurrency",
    ],
    insight:"Retries amplified the shortage. Unbounded retries would make recovery slower, not faster.",
  },
  deploy:{
    label:"03 / CHANGE",
    heading:"The last deploy changed one expensive number",
    lines:[
      "commit 72abf1  ·  checkout gateway",
      "− DB_POOL_MAX=100",
      "+ DB_POOL_MAX=20",
      "+ CHECKOUT_CONCURRENCY=240",
      "deploy completed at 14:31:58",
    ],
    insight:"The connection pool shrank while allowed request concurrency increased. The timing fits the onset of the incident.",
  },
};

export type Remediation="scale"|"restart"|"rollback";
export const REMEDIATIONS:ReadonlyArray<{
  id:Remediation;title:string;caption:string;consequence:string;correct:boolean
}>=[
  {id:"scale",title:"Scale the API to 20 pods",caption:"More compute, more connections?",
    consequence:"Wrong first move: more replicas amplify connection pressure and cost. Measure pool saturation before horizontal scaling.",correct:false},
  {id:"restart",title:"Restart the database",caption:"Every incident's least useful reflex.",
    consequence:"Wrong first move: the database is healthy and connections are scarce in the application process. Restarting raises downtime.",correct:false},
  {id:"rollback",title:"Rollback the last gateway deploy",caption:"Reverse the regression, then investigate.",
    consequence:"Correct: restore previous pool/concurrency settings, watch p95 and 5xx fall, then fix retry limits before redeploying.",correct:true},
];
export function evaluateRemediation(choice:Remediation){
  return REMEDIATIONS.find(x=>x.id===choice)!;
}
