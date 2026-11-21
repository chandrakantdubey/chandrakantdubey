import { useEffect, useState, type FormEvent } from 'react';
import { readDiscoveries } from './discoveries';
import {
  ARTIFACTS, VALID_CORRELATIONS, archiveInventory, archivePhase,
  executeArchive, newArchive, sanitizeArchive,
  type ArchiveArtifact, type ArchiveResult, type ArchiveState, type PrimaryArtifact,
} from './rootNarrativeEngine';
import './root-archive.css';

const STORE = 'cd:root-archive-story:v2';
const IDS = Object.keys(ARTIFACTS) as ArchiveArtifact[];
const HINTS = [
  { command: 'map', label: 'SCAN ARCHIVE' },
  { command: 'link anomaly architecture', label: 'LINK: THE FIRST ECHO / THE LIMIT' },
  { command: 'link recovery network', label: 'LINK: RESPONSE / CROSSING' },
  { command: 'link mechanism entropy', label: 'LINK: MACHINE / GARDEN' },
  { command: 'link architecture recovery', label: 'LINK: THE LIMIT / RESPONSE' },
  { command: 'decode', label: 'DECODE UNKNOWN SIGNAL' },
  { command: 'link cipher network', label: 'LINK: GHOST KEY / NETWORK' },
  { command: 'link cipher anomaly', label: 'LINK: GHOST KEY / ANOMALY' },
  { command: 'resolve contain', label: 'ENDING: CONTAIN' },
  { command: 'resolve understand', label: 'ENDING: UNDERSTAND' },
  { command: 'resolve erase', label: 'ENDING: ERASE' },
];
type ConsoleLine = { id: number; input: string; output: string; kind: ArchiveResult['type'] };
function readLocalArchive(): ArchiveState {
  try { return sanitizeArchive(JSON.parse(localStorage.getItem(STORE) || 'null')); }
  catch { return newArchive(); }
}
function getPrimaryArtifacts(): PrimaryArtifact[] { return readDiscoveries() as PrimaryArtifact[]; }
function beep(kind: ArchiveResult['type']) {
  if (kind === 'info') return;
  window.dispatchEvent(new CustomEvent('cd:sound-cue', { detail: { type: kind === 'success' ? 'discovery' : 'warning' } }));
}
/** Interactive investigation, but no real authentication, permissions, or code execution. */
export default function RootArchive() {
  const [state, setState] = useState<ArchiveState>(readLocalArchive);
  const [discovered, setDiscovered] = useState<PrimaryArtifact[]>(getPrimaryArtifacts);
  const [command, setCommand] = useState('');
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([
    { id: 0, input: 'CD / THE UNDERWORLD — ARCHIVE TERMINAL', output: 'The archive is fictional. Your decisions are real only inside this local narrative. Type HELP or select a suggested correlation.', kind: 'info' },
  ]);
  const [showJournal, setShowJournal] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [activeArtifact, setActiveArtifact] = useState<ArchiveArtifact | null>(null);
  const phase = archivePhase(discovered, state);
  const inventory = archiveInventory(discovered, state);
  const unlocked = new Set<ArchiveArtifact>(inventory);
  const progress = state.ending ? 100 : Math.round((inventory.length / IDS.length * .60 + state.correlations.length / VALID_CORRELATIONS.length * .4) * 100);
  useEffect(() => {
    const update = () => setDiscovered(getPrimaryArtifacts());
    window.addEventListener('cd:discovery', update);
    return () => window.removeEventListener('cd:discovery', update);
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify(state)); }
    catch { /* Optional fictional progress must not block the site. */ }
  }, [state]);
  const execute = (input: string) => {
    const result = executeArchive(state, input, discovered);
    if (result.state !== state) setState(result.state);
    setConsoleLines(lines => [...lines, { id: (lines.at(-1)?.id ?? 0) + 1, input, output: result.output, kind: result.type }].slice(-30));
    beep(result.type);
    if (input === 'journal') setShowJournal(true);
  };
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); if (!command.trim()) return; execute(command.trim()); setCommand(''); };
  const chooseArtifact = (id: ArchiveArtifact) => {
    setActiveArtifact(id);
    execute('inspect ' + id);
  };
  const resetStory = () => {
    execute('reset');
    setShowJournal(false); setActiveArtifact(null);
  };
  return <section className="root-story" aria-label="The Underworld fictional investigation">
    <div className="root-story-intro">
      <div><div className="root-story-kicker">AN EIGHT-PART STORY HIDDEN ACROSS SIX EXPERIENCES</div>
        <h2>THE SYSTEM REMEMBERS.</h2>
        <p>Six fragments are buried across the exhibit. Recover them, establish the relationships, decrypt the final transmission, and decide what the archive becomes.</p></div>
      <div className="root-story-progress">
        <span>CORRELATION PROTOCOL</span><strong>{phase}</strong>
        <div className="root-story-progress-meter"><i style={{ width: progress + '%' }}/></div>
        <small>{inventory.length}/8 ARTIFACTS · {state.correlations.length}/6 CORRELATIONS</small>
      </div>
    </div>
    <div className="root-story-layout">
      <div className="root-story-left">
        <div className="root-story-panel-top"><strong>EVIDENCE MATRIX</strong><span>SELECT AN ARTIFACT TO INSPECT</span></div>
        <div className="root-story-grid">
          {IDS.map((id, index) => {
            const data = ARTIFACTS[id], has = unlocked.has(id);
            return <button className={'root-story-artifact' + (has ? ' root-story-discovered' : '') + (activeArtifact === id ? ' root-story-selected' : '')}
              type="button" key={id} onClick={() => chooseArtifact(id)} aria-pressed={activeArtifact === id}>
              <span className="root-story-artifact-id">ARTIFACT {String(index).padStart(2, '0')}</span>
              <span aria-hidden="true" className="root-story-symbol">{has ? (index >= 6 ? '◈' : '⟡') : '⊘'}</span>
              <strong>{has ? data.title : 'SIGNAL NOT FOUND'}</strong>
              <span className="root-story-artifact-state">{has ? id.toUpperCase() + ' / RECOVERED' : id.toUpperCase() + ' / LOCKED'}</span>
            </button>;
          })}
        </div>
        <div className="root-story-panel-top"><strong>CORRELATION LINKS</strong><span>NO FALSE POSITIVES</span></div>
        <div className="root-story-edges">
          {VALID_CORRELATIONS.map(edge => <div key={edge} className={state.correlations.includes(edge) ? 'root-story-edge-done' : ''}>
            <span>{edge.replace('|', ' ⇄ ').toUpperCase()}</span><strong>{state.correlations.includes(edge) ? 'LINKED ◉' : 'UNLINKED ○'}</strong>
          </div>)}
        </div>
        {state.ending && <div className="root-story-ending">
          <span>YOUR CHOSEN ENDING / {state.ending.toUpperCase()}</span>
          <p>{executeArchive(state, 'resolve ' + state.ending, discovered).output}</p>
        </div>}
        <div className="root-story-source-links">
          <h3>WHERE TO LOOK</h3>
          <p>Every fragment is found through a real interaction, not by guessing a password.</p>
          <div>{[...new Set(IDS.filter(id => !unlocked.has(id) && ARTIFACTS[id].route !== '/access').map(id => ARTIFACTS[id].route))].map(route =>
            <a key={route} href={route}>{route} ↗</a>)}</div>
        </div>
      </div>
      <aside className="root-story-right">
        <div className="root-story-panel-top"><strong>FICTIONAL COMMAND INTERPRETER</strong><span>ALLOWLISTED / BROWSER ONLY</span></div>
        <div className="root-story-console" role="log" aria-label="Terminal investigation history" aria-live="polite">
          {consoleLines.map(line => <div className={'root-story-line root-story-' + line.kind} key={line.id}>
            <strong>{line.id ? '> ' + line.input : line.input}</strong>
            <pre>{line.output}</pre>
          </div>)}
        </div>
        <form className="root-story-input" onSubmit={submit}>
          <label htmlFor="archive-command">archive@simulation:~$</label>
          <input id="archive-command" type="text" autoCapitalize="off" autoComplete="off" spellCheck={false}
            value={command} maxLength={120} onChange={e => setCommand(e.target.value)} placeholder="help / map / link..."/>
          <button type="submit">EXECUTE ↵</button>
        </form>
        <div className="root-story-actions">
          <button type="button" onClick={() => setShowGuide(v => !v)} aria-expanded={showGuide}>{showGuide ? 'HIDE' : 'SHOW'} INVESTIGATIVE ACTIONS</button>
          <button type="button" onClick={() => setShowJournal(v => !v)} aria-expanded={showJournal}>{showJournal ? 'CLOSE' : 'OPEN'} CHRONICLE</button>
        </div>
        {showGuide && <div className="root-story-hints" aria-label="Suggested allowed investigation commands">
          <p>The interpreter is a constrained narrative grammar. Every action below runs through the same allowlisted command engine.</p>
          {HINTS.map(hint => <button key={hint.command} type="button" onClick={() => execute(hint.command)}>
            <span>{hint.label}</span><small>{hint.command}</small>
          </button>)}
        </div>}
        {showJournal && <div className="root-story-journal">
          <h3>THE CHRONICLE</h3>
          {state.journal.length ? state.journal.map((entry, i) => <div key={i}>
            <span>{String(entry.step).padStart(2, '0')} / {entry.kind.toUpperCase()}</span><p>{entry.description}</p>
          </div>) : <p>No correlations recorded. Find two related artifacts and link them.</p>}
        </div>}
        <div className="root-story-safety">
          <strong>THIS IS NOT A SHELL.</strong>
          <p>No privilege escalation, login tokens, execution, network inspection, or real host access exists here. Progress is local, optional, and resettable without changing the rest of the portfolio.</p>
          <button type="button" onClick={resetStory}>RESET FICTIONAL INVESTIGATION</button>
        </div>
      </aside>
    </div>
  </section>;
}
