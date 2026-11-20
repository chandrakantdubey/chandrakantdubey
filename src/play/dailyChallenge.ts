/** Daily challenges are reproducible locally, not a global leaderboard. */
export function utcChallengeDay(now:Date=new Date()):string {
  return now.toISOString().slice(0,10);
}
export function challengeSeed(day:string):number {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||Number.isNaN(Date.parse(day+"T00:00:00.000Z")))
    throw Error("Invalid UTC challenge day.");
  let hash=2166136261;
  for(let i=0;i<day.length;i++){
    hash=Math.imul(hash^day.charCodeAt(i),16777619);
  }
  return hash>>>0;
}
export function resultShareText(day:string,score:number,delivered:number,integrity:number,won:boolean):string {
  const safeScore=Math.max(0,Math.floor(score));
  const safeDelivered=Math.max(0,Math.floor(delivered));
  const safeIntegrity=Math.max(0,Math.min(100,Math.floor(integrity)));
  return [
    "PACKET PANIC / DAILY "+day,
    (won?"NETWORK SURVIVED":"TOTAL OUTAGE")+" · "+safeScore.toLocaleString("en-US")+" PTS",
    safeDelivered+" delivered · "+safeIntegrity+"% integrity",
    "Think you can route better? https://chandrakantdubey.vercel.app/play/packet",
  ].join("\n");
}
