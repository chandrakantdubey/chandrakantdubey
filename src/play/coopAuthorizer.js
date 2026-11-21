/**
 * Pure co-op command authorization policy. The HTTP endpoint authenticates
 * a hashed player token first, then passes the server-derived 1/2 role here.
 * Client-sent role/credits/state are NEVER trusted.
 */
export function validateCoopAction(action, player, game, index){
  if(action!=='pair'&&action!=='shield')return 'Unsupported cooperative action.';
  if(game?.phase!=='playing'||game?.players!==2||!game.coop)return 'No active asymmetric room.';
  if(action==='pair'){
    if(player!==1)return 'Only the Route Architect can pair-rotate.';
    if(!Number.isInteger(index)||index<0||index>=35||index%7>=3)
      return 'Pair rotations require an ingress router in columns 1–3.';
    if(game.coop.pairCharges<=0)return 'No pair-rotation charges remain.';
    return null;
  }
  if(player!==2)return 'Only the Systems Operator can shield faults.';
  if(game.coop.shieldCharges<=0)return 'No fault shields remain.';
  if(game.coop.pendingShields>=2)return 'The defense queue is already full.';
  return null;
}
