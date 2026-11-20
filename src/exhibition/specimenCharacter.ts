/**
 * Character copy is editorial content, not generated at runtime.
 * Quiet, contextual sarcasm: no catchphrases, no insults directed at visitors,
 * no repetitive quips during gameplay.
 */
export const specimenLines={
  awakened:[
    "Change control would have preferred a ticket.",
    "So much for the sealed environment.",
    "That was the one setting nobody needed to touch.",
  ],
  restored:[
    "A rare victory for restraint.",
    "Order restored. Temporarily.",
    "The incident report will be admirably brief.",
  ],
  victory:[
    "Good. I was running out of excuses for the outage.",
    "Well handled. Don't make a habit of surprising me.",
  ],
  defeat:[
    "The postmortem should make interesting reading.",
    "A surprisingly efficient outage.",
  ],
} as const;

export type SpecimenMoment=keyof typeof specimenLines;

/** Always choose a different line from the previous one of the same kind. */
export function specimenLine(moment:SpecimenMoment,step:number):string {
  const lines=specimenLines[moment];
  const index=((Math.trunc(step)%lines.length)+lines.length)%lines.length;
  return lines[index];
}

/** A silence budget protects the visitor from being narrated at. */
export const SPECIMEN_COMMENT_COOLDOWN_MS=20_000;
export function shouldComment(lastAt:number,now:number):boolean {
  return now-lastAt>=SPECIMEN_COMMENT_COOLDOWN_MS;
}
