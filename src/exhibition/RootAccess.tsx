import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUpRight, LockKeyhole, Terminal, X } from "lucide-react";
import { runRootCommand } from "./rootCommands";
import "./root-access.css";

type Entry={id:number;kind:"input"|"output";text:string};
const START:Entry[]=[
  {id:1,kind:"output",text:"CD://ROOT ACCESS — FICTIONAL SYSTEM TERMINAL v1.0"},
  {id:2,kind:"output",text:"Everything runs in this browser. There is no real shell."},
  {id:3,kind:"output",text:"Type help to find out how much trouble you can cause."},
];
export default function RootAccess() {
  const [open,setOpen]=useState(false);
  const [command,setCommand]=useState("");
  const [entries,setEntries]=useState<Entry[]>(START);
  const [effect,setEffect]=useState<"normal"|"chaos"|"gravity">("normal");
  const terminal=useRef<HTMLDivElement>(null);
  const entry=useRef<HTMLInputElement>(null);
  const history=useRef<HTMLDivElement>(null);
  const lastFocus=useRef<HTMLElement|null>(null);
  const nextId=useRef(4);

  useEffect(()=>{
    const shortcut=(event:globalThis.KeyboardEvent)=>{
      const target=event.target as HTMLElement|null;
      if(event.key!=="`"||event.ctrlKey||event.metaKey||event.altKey)return;
      if(target?.closest("input,textarea,select,[contenteditable]"))return;
      event.preventDefault();
      setOpen(value=>!value);
    };
    window.addEventListener("keydown",shortcut);
    return()=>window.removeEventListener("keydown",shortcut);
  },[]);
  useEffect(()=>{
    const site=document.querySelector(".exhibition-site");
    site?.classList.toggle("root-chaos",effect==="chaos");
    site?.classList.toggle("root-gravity",effect==="gravity");
    return()=>{site?.classList.remove("root-chaos","root-gravity");};
  },[effect]);
  useEffect(()=>{
    if(!open)return;
    lastFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const oldOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    entry.current?.focus();
    return()=>{
      document.body.style.overflow=oldOverflow;
      lastFocus.current?.focus();
    };
  },[open]);
  useEffect(()=>{
    if(open)history.current?.scrollTo({top:history.current.scrollHeight,behavior:"instant"});
  },[entries,open]);
  const execute=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(!command.trim())return;
    const result=runRootCommand(command);
    if(result.effect==="clear")setEntries(START);
    else {
      const next:Entry[]=[
        {id:nextId.current++,kind:"input",text:"❯ "+command.trim().slice(0,160)},
        ...result.lines.map(text=>({id:nextId.current++,kind:"output" as const,text})),
      ];
      setEntries(old=>[...old,...next].slice(-100));
    }
    if(result.effect==="chaos")setEffect("chaos");
    if(result.effect==="gravity")setEffect("gravity");
    if(result.effect==="restore")setEffect("normal");
    if(result.effect==="exit")setOpen(false);
    setCommand("");
  };
  const keys=(event:KeyboardEvent<HTMLDivElement>)=>{
    if(event.key==="Escape"){event.preventDefault();setOpen(false);return;}
    if(event.key!=="Tab")return;
    const focusable=terminal.current?.querySelectorAll<HTMLElement>("button:not(:disabled),input:not(:disabled)");
    if(!focusable?.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };

  return <>
    <button type="button" className="root-discovery" onClick={()=>setOpen(true)}
      aria-keyshortcuts="`" aria-haspopup="dialog" aria-expanded={open}
      title="An entirely fictional terminal. Press the backtick key.">
      <Terminal size={15}/> ROOT ACCESS <ArrowUpRight size={13}/>
    </button>
    {open&&<div className="root-backdrop" onMouseDown={event=>{
      if(event.target===event.currentTarget)setOpen(false);
    }}>
      <div className="root-terminal" role="dialog" aria-modal="true"
        aria-labelledby="root-terminal-title" ref={terminal} onKeyDown={keys}>
        <div className="root-terminal-bar">
          <div className="root-terminal-identity">
            <span className="root-terminal-lights" aria-hidden="true"><i/><i/><i/></span>
            <Terminal size={17}/>
            <strong id="root-terminal-title">ROOT ACCESS</strong>
            <span className="root-terminal-subtitle">FAKE TERMINAL / REAL PERSONALITY</span>
          </div>
          <button className="root-terminal-close" type="button" onClick={()=>setOpen(false)}
            aria-label="Close imaginary terminal"><X size={21}/></button>
        </div>
        <div className="root-terminal-banner">
          <span><LockKeyhole size={15}/> SANDBOX MODE · BROWSER ONLY</span>
          <span>ROOT ACCESS IS A JOKE. SECURITY IS NOT.</span>
        </div>
        <div className="root-terminal-history" ref={history} role="log" aria-live="polite" aria-label="Terminal command history">
          {entries.map(item=><div key={item.id}
            className={"root-terminal-entry "+(item.kind==="input"?"root-terminal-command":"root-terminal-output")}>
            {item.text}
          </div>)}
        </div>
        <form className="root-terminal-prompt" onSubmit={execute}>
          <span aria-hidden="true">cd@portfolio:~$</span>
          <label className="root-visually-hidden" htmlFor="root-command">Fictional command</label>
          <input id="root-command" ref={entry} type="text" value={command}
            onChange={event=>setCommand(event.target.value)}
            maxLength={160} autoComplete="off" autoCapitalize="off" spellCheck={false}
            placeholder="help" aria-description="Press Enter to submit a local pretend command"/>
          <button type="submit" disabled={!command.trim()}>RUN ↵</button>
        </form>
        <div className="root-terminal-footnote">
          <span>ESC TO CLOSE</span><span>TYPE RESTORE TO RESET VISUAL EFFECTS</span>
          <span>NO REAL COMMANDS EXECUTED</span>
        </div>
      </div>
    </div>}
  </>;
}
