/**
 * TRACE / HEX. A two-player connection game on a real axial hex graph.
 * Player 1 links the WEST and EAST borders; player 2 links NORTH and SOUTH.
 * The graph search is shared by browser practice and the server-authoritative API.
 */
export const SIZE=7;
export const CELL_COUNT=SIZE*SIZE;
export type Side=1|2;
export type Cell=0|Side;
export type DuelBoard=Cell[];
export type DuelStatus="waiting"|"active"|"finished";
export interface DuelSnapshot {
  board:DuelBoard;
  turn:Side;
  version:number;
  moves:number;
  status:DuelStatus;
  winner:Side|null;
  path:number[];
  players:number;
  lastMove:number|null;
}
export interface DuelMove extends DuelSnapshot {
  valid:boolean;
  reason?:string;
}
const ADJACENT:readonly [number,number][]=[
  [-1,0],[1,0],[0,-1],[0,1],[-1,1],[1,-1],
];
export function neighbors(index:number):number[]{
  if(!Number.isInteger(index)||index<0||index>=CELL_COUNT)return [];
  const q=index%SIZE,r=Math.floor(index/SIZE);
  const items:number[]=[];
  for(const [dq,dr] of ADJACENT){
    const x=q+dq,y=r+dr;
    if(x>=0&&x<SIZE&&y>=0&&y<SIZE)items.push(y*SIZE+x);
  }
  return items;
}
export function findConnection(board:readonly Cell[],side:Side):number[] {
  if(board.length!==CELL_COUNT)return [];
  const previous=new Int16Array(CELL_COUNT).fill(-2);
  const queue:number[]=[];
  for(let i=0;i<CELL_COUNT;i++){
    const edge=side===1?i%SIZE===0:Math.floor(i/SIZE)===0;
    if(edge&&board[i]===side){previous[i]=-1;queue.push(i);}
  }
  for(let head=0;head<queue.length;head++){
    const current=queue[head];
    const done=side===1?current%SIZE===SIZE-1:Math.floor(current/SIZE)===SIZE-1;
    if(done){
      const path:number[]=[];
      let cell=current;
      while(cell!==-1){path.push(cell);cell=previous[cell];}
      return path.reverse();
    }
    for(const next of neighbors(current)){
      if(board[next]===side&&previous[next]===-2){
        previous[next]=current;
        queue.push(next);
      }
    }
  }
  return [];
}
export function freshGame(players=1):DuelSnapshot {
  return {
    board:Array(CELL_COUNT).fill(0) as DuelBoard,turn:1,
    version:0,moves:0,status:players===2?"active":"waiting",
    winner:null,path:[],players,lastMove:null,
  };
}
export function place(snapshot:DuelSnapshot,side:Side,index:number):DuelMove {
  const fail=(reason:string):DuelMove=>({...snapshot,valid:false,reason});
  if(snapshot.status!=="active")return fail("The match is not active.");
  if(snapshot.turn!==side)return fail("Wait for your turn.");
  if(!Number.isInteger(index)||index<0||index>=CELL_COUNT)return fail("Outside the board.");
  if(snapshot.board[index]!==0)return fail("That node is already occupied.");
  const board=[...snapshot.board] as DuelBoard;
  board[index]=side;
  const path=findConnection(board,side);
  const moves=snapshot.moves+1;
  const winner=path.length?side:null;
  return {
    ...snapshot,board,turn:side===1?2:1,moves,
    version:snapshot.version+1,
    winner,path,lastMove:index,
    status:winner?"finished":"active",valid:true,
  };
}
export function toSnapshot(move:DuelMove):DuelSnapshot {
  const {valid:_,reason:__,...data}=move;
  return data;
}

/** Small evaluation for local practice. The API never uses a CPU opponent. */
function targetDistance(board:readonly Cell[],side:Side,source:number):number {
  const visited=new Set<number>([source]);
  const frontier=[source];
  for(let distance=0;frontier.length&&distance<4;distance++){
    const count=frontier.length;
    for(let i=0;i<count;i++){
      const cell=frontier.shift()!;
      const edge=side===1?cell%SIZE===SIZE-1:Math.floor(cell/SIZE)===SIZE-1;
      if(edge)return distance;
      for(const next of neighbors(cell)){
        if(!visited.has(next)&&board[next]!== (side===1?2:1)){
          visited.add(next);frontier.push(next);
        }
      }
    }
  }
  return 5;
}
export function choosePracticeMove(snapshot:DuelSnapshot):number {
  if(snapshot.status!=="active")return -1;
  const available=snapshot.board.flatMap((cell,i)=>cell===0?[i]:[]);
  if(!available.length)return -1;
  const cpu:Side=2,opponent:Side=1;
  for(const i of available){
    if(findConnection(place({...snapshot,turn:cpu},cpu,i).board,cpu).length)return i;
  }
  for(const i of available){
    if(findConnection(place({...snapshot,turn:opponent},opponent,i).board,opponent).length)return i;
  }
  let best=available[0],score=-Infinity;
  for(const i of available){
    const own=neighbors(i).filter(j=>snapshot.board[j]===cpu).length;
    const other=neighbors(i).filter(j=>snapshot.board[j]===opponent).length;
    const centrality=3.5-Math.abs(i%SIZE-3)*.55-Math.abs(Math.floor(i/SIZE)-3)*.4;
    const lane=targetDistance(snapshot.board,cpu,i);
    const value=own*4.5+other*1.1+centrality-lane*.4+((i*151+snapshot.version*13)%11)*.018;
    if(value>score){score=value;best=i;}
  }
  return best;
}
