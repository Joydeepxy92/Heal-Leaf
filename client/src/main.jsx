import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, BarChart3, Check, ChevronLeft, ClipboardCheck, Clock3, HeartHandshake, Home, Info, Leaf, LogOut, Pause, Play, RotateCcw, ShieldCheck, Sparkles, X } from 'lucide-react';
import './styles.css';

const API = '/api';
const ANSWERS = [
  ['Never', 'Not at all', 0],
  ['Sometimes', 'A little', 1],
  ['Often', 'Quite a bit', 2],
  ['Always', 'A lot', 3]
];
const TEAM = ['Mrinmoy Jyoti Borah', 'Joydeep Das', 'Bikash Borah', 'Pratim Pran Boruah', 'Shristi Chauhan', 'Rohit Bora'];
const activityMap = { yoga: { icon: '🧘', name: 'Yoga' }, sports: { icon: '🏃', name: 'Sports & Movement' }, music: { icon: '🎨', name: 'Music & Arts' }, mentorship: { icon: '🤝', name: 'Mentorship & Support' } };

const FALLBACK_ACTIVITIES = {
  yoga: { name: 'Yoga', icon: '🧘', level: 'Moderate', items: [
    ['Breathing & shoulder release', 5], ['Cat-Cow stretch', 6], ['Child’s pose reset', 5], ['Standing stretch flow', 8], ['Gentle full-body flow', 10]
  ]},
  sports: { name: 'Sports & Movement', icon: '🏃', level: 'Moderate–High', items: [
    ['Brisk walk', 10], ['Marching reset', 8], ['Light mobility circuit', 10], ['Badminton practice', 15], ['Outdoor movement break', 20]
  ]},
  music: { name: 'Music & Arts', icon: '🎨', level: 'Low–Moderate', items: [
    ['Calm music break', 5], ['Doodle reset', 8], ['Colouring session', 10], ['Free writing', 7], ['Music + sketch', 12]
  ]},
  mentorship: { name: 'Mentorship & Support', icon: '🤝', level: 'High–Critical', items: [
    ['Talk to a trusted person', 10], ['Prepare a support message', 8], ['Mentor conversation plan', 12], ['Professional support plan', 10], ['Support circle check-in', 15]
  ]}
};

function Logo({ className = '' }) {
  const sources = ['/logo.jpeg', '/logo.jpg', '/HealLeaf.jpg', '/HealLeaf.jpeg', '/HealLeaf.png'];
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState(false);
  if (broken) return <span className={'logoFallback ' + className}><Leaf /></span>;
  return <img className={className} src={sources[index]} onError={() => { if (index < sources.length - 1) setIndex(index + 1); else setBroken(true); }} alt="Heal Leaf logo" />;
}

function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('heal_leaf_user')); } catch { return null; } });
  const [page, setPage] = useState('home');
  const [questions, setQuestions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [history, setHistory] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [last, setLast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(API + '/questions').then((r) => r.json()),
      fetch(API + '/activities').then((r) => r.json())
    ]).then(([q, a]) => { setQuestions(q); setActivities(a); setLoading(false); }).catch(() => { setLoading(false); setToast('Could not connect to the app server.'); });
  }, []);
  useEffect(() => { if (user) refreshData(user.id); }, [user]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2800); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { const fn = () => user && refreshData(user.id); window.addEventListener('heal-leaf-activity-recorded', fn); return () => window.removeEventListener('heal-leaf-activity-recorded', fn); }, [user]);

  async function refreshData(id) {
    try {
      const [h, a] = await Promise.all([fetch(API + '/history/' + id).then(r => r.json()), fetch(API + '/activity-history/' + id).then(r => r.json())]);
      setHistory(h); setActivityHistory(a);
      if (h.length) setLast(h[h.length - 1]);
    } catch { setToast('Could not refresh your progress.'); }
  }
  function enter(u) { localStorage.setItem('heal_leaf_user', JSON.stringify(u)); setUser(u); setPage('home'); }
  function logout() { localStorage.removeItem('heal_leaf_user'); setUser(null); setHistory([]); setActivityHistory([]); setLast(null); }

  if (!user) return <Auth onEnter={enter} />;
  if (loading) return <div className="loadingScreen"><div className="loadingLogo"><Logo /></div><p>Preparing Heal Leaf…</p></div>;

  const result = last || history[history.length - 1];
  return <>
    <header className="topbar">
      <button className="brand" onClick={() => setPage('home')}><Logo /><span>Heal Leaf</span></button>
      <nav>{navItems.map(([id, title, Icon]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}><Icon size={16} />{title}</button>)}</nav>
      <div className="profile"><span>{user.name.split(' ')[0]}</span><button onClick={logout} title="Log out"><LogOut size={17} /></button></div>
    </header>
    <main>
      {page === 'home' && <HomePage user={user} latest={result} go={setPage} />}
      {page === 'checkin' && <Checkin user={user} questions={questions} onDone={(r) => { setLast(r); refreshData(user.id); setPage('result'); }} />}
      {page === 'result' && <Result result={result} go={setPage} />}
      {page === 'recommendations' && <Recommendations result={result} level={result?.level || 'LOW'} activities={activities} activityHistory={activityHistory} go={setPage} />}
      {page === 'dashboard' && <Dashboard history={history} activityHistory={activityHistory} />}
      {page === 'about' && <About />}
    </main>
    <MobileNav active={page} go={setPage} />
    {toast && <div className="toast">{toast}</div>}
    <footer><span>Heal Leaf · wellbeing support prototype</span><span>Non-diagnostic self-check</span></footer>
  </>;
}

const navItems = [['home', 'Home', Home], ['checkin', 'Check-in', ClipboardCheck], ['recommendations', 'Activities', HeartHandshake], ['dashboard', 'Dashboard', BarChart3], ['about', 'About', Info]];
function MobileNav({ active, go }) { return <div className="mobileNav">{navItems.map(([id, title, Icon]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => go(id)}><Icon size={19} /><small>{title === 'Dashboard' ? 'Progress' : title}</small></button>)}</div>; }



function Auth({ onEnter }) {
  const [mode, setMode] = useState('welcome');
  const [form, setForm] = useState({ name: '', email: '', dob: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      if (mode === 'register') {
        if (!form.name || !form.email || !form.dob) throw Error('Please fill in your name, email and date of birth.');
        const r = await fetch(API + '/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const d = await r.json(); if (!r.ok) throw Error(d.error); onEnter(d);
      } else {
        if (!form.email) throw Error('Enter the email used for your account.');
        const r = await fetch(API + '/profile/' + encodeURIComponent(form.email.trim())); const d = await r.json();
        if (!r.ok) throw Error(d.error || 'Account not found.'); onEnter(d);
      }
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <div className="auth"><div className="authOrb"><div className="authGlow" /><Logo /></div><div className="authCard"><div className="miniBrand"><Logo /><b>Heal Leaf</b></div>{mode === 'welcome' ? <><span className="eyebrow">A gentler place to check in</span><h1>How are you <em>really</em> doing?</h1><p>Take a short wellbeing check-in, understand your current level, and choose a small next step.</p><div className="privacy"><ShieldCheck size={18} /><span>Your check-in is a wellbeing screen, not a diagnosis.</span></div><button className="primary wide" onClick={() => setMode('register')}>Create account <ArrowRight size={17} /></button><button className="secondary wide" onClick={() => setMode('login')}>I already have an account</button></> : <><button className="back" onClick={() => setMode('welcome')}><ChevronLeft size={16} /> Back</button><span className="eyebrow">{mode === 'register' ? 'New account' : 'Welcome back'}</span><h2>{mode === 'register' ? 'Start your Heal Leaf journey' : 'Sign in to continue'}</h2><form onSubmit={submit}>{mode === 'register' && <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>}<label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>{mode === 'register' && <label>Date of birth<input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></label>}<label className="checkline"><input type="checkbox" required /><span>I understand this is a non-diagnostic wellbeing check-in.</span></label>{error && <div className="error">{error}</div>}<button className="primary wide" disabled={busy}>{busy ? 'Please wait…' : mode === 'register' ? 'Create my account' : 'Sign in'} <ArrowRight size={17} /></button></form></>}</div></div>;
}

function HomePage({ user, latest, go }) { return <section className="home"><div className="hero"><div><span className="eyebrow"><Sparkles size={15} /> WELCOME BACK, {user.name.split(' ')[0].toUpperCase()}</span><h1>A small step can change how your day <em>feels.</em></h1><p>Check in, see a broad wellbeing level, choose an activity, and track what you do over time.</p><div className="heroBtns"><button className="primary" onClick={() => go('checkin')}>{latest ? 'Take another check-in' : 'Start your first check-in'} <ArrowRight size={18} /></button>{latest && <button className="secondary" onClick={() => go('dashboard')}>View progress</button>}</div><div className="trust"><span>✓ 15-question check-in</span><span>✓ Personal progress</span><span>✓ Timed activities</span></div></div><div className="heroVisual"><div className="orb"><Logo /></div><div className="float f1">🧘</div><div className="float f2">🎨</div><div className="float f3">🤝</div></div></div><div className="three"><div><b>01</b><h3>Check in</h3><p>Answer 15 simple questions about stress, mood, difficult experiences and wellbeing.</p></div><div><b>02</b><h3>Understand</h3><p>See LOW, MODERATE, HIGH or CRITICAL as a broad screening level.</p></div><div><b>03</b><h3>Take a step</h3><p>Open a suggested activity, choose a routine and track your time.</p></div></div></section>; }

function Checkin({ user, questions, onDone }) {
  const [i, setI] = useState(0); const [answers, setAnswers] = useState([]); const [busy, setBusy] = useState(false);
  if (!questions.length) return <div className="center"><div className="spinner" /></div>;
  const q = questions[i];
  async function answer(value) {
    const next = [...answers, value];
    if (i < questions.length - 1) { setAnswers(next); setI(i + 1); return; }
    setBusy(true);
    try { const r = await fetch(API + '/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, email: user.email, answers: next }) }); const d = await r.json(); if (!r.ok) throw Error(d.error); onDone(d); }
    catch (e) { alert(e.message); } finally { setBusy(false); }
  }
  return <section className="checkWrap"><div className="checkHead"><div><button className="back" onClick={() => i ? setI(i - 1) : null}><ChevronLeft size={16} /> {i ? 'Previous' : 'Check-in'}</button><span className="eyebrow">WELLBEING CHECK-IN</span><h1>Let's take this <em>one question</em> at a time.</h1></div><div className="count">{i + 1}<small> / {questions.length}</small></div></div><div className="progress"><i style={{ width: `${((i + 1) / questions.length) * 100}%` }} /></div><div className="questionCard"><span className="qnum">QUESTION {String(i + 1).padStart(2, '0')} · {q.category}</span><h2>{q.text}</h2><div className="answers">{ANSWERS.map(([a, b, v]) => <button key={a} onClick={() => answer(v)} disabled={busy}><span>{a}</span><small>{b}</small></button>)}</div><p className="note">There are no right or wrong answers. Choose what feels closest to your recent experience.</p></div></section>;
}

function Result({ result, go }) {
  if (!result) return <div className="empty"><div>🌱</div><h2>No result yet</h2><button className="primary" onClick={() => go('checkin')}>Start check-in</button></div>;
  return <section><div className="resultHero"><div className="scoreOrb"><strong>{result.score}</strong><span>screening score</span></div><div><span className="eyebrow">YOUR CHECK-IN REPORT</span><h1>Your current level is <em>{result.level}</em></h1><p>This is a broad wellbeing screening result, not a diagnosis. It is designed to help you notice patterns and choose a practical next step.</p><div className="resultActions"><button className="primary" onClick={() => go('recommendations')}>See recommended activities <ArrowRight size={17} /></button><button className="secondary" onClick={() => go('dashboard')}>View dashboard</button></div></div></div><div className="reportGrid"><div className="panel"><h3>Area breakdown</h3>{Object.entries(result.categoryScores || {}).map(([name, score]) => <div className="categoryRow" key={name}><div><span>{name}</span><b>{score}</b></div><div className="miniBar"><i style={{ width: `${score}%` }} /></div></div>)}</div><div className="panel"><h3>What happens next?</h3><p>Based on this level, Heal Leaf suggests:</p><div className="suggestions">{(result.recommendations || []).map(id => <span key={id}>{id === 'yoga' ? '🧘 Yoga' : id === 'sports' ? '🏃 Sports & Movement' : id === 'music' ? '🎨 Music & Arts' : '🤝 Mentorship & Support'}</span>)}</div><p className="muted">If the result feels concerning or does not match how you feel, talk to a trusted person or qualified professional rather than relying on the score alone.</p></div></div></section>;
}

function Recommendations({ result, level, activities, activityHistory, go }) {
  const list = useMemo(() => level === 'LOW' ? ['music'] : level === 'MODERATE' ? ['yoga', 'music', 'sports'] : level === 'HIGH' ? ['sports', 'mentorship'] : ['mentorship'], [level]);
  const byId = Object.fromEntries((activities.length ? activities : Object.entries(FALLBACK_ACTIVITIES).map(([id, a]) => ({ id, ...a }))).map(a => [a.id, a]));
  if (!result) return <section><div className="empty"><div>🌱</div><h3>Complete a check-in first</h3><p>Your recommendations will appear here after all 15 questions are completed.</p><button className="primary" onClick={() => go('checkin')}>Start check-in <ArrowRight size={16} /></button></div></section>;
  return <section><div className="sectionTitle"><span>RECOMMENDED FOR TEST {result.testNumber || '—'}</span><h2>Activities for your <em>{level.toLowerCase()}</em> level.</h2><p>These are available for this check-in. A completed routine is locked until you take another check-in.</p></div><div className="activityGrid">{list.map(id => <ActivityCard key={id} activity={byId[id]} checkinId={result.id} activityHistory={activityHistory} />)}</div><div className="allActivities"><h3>How access works</h3><p>Finish a routine once for this test and it becomes locked. A new 15-question test gives you a fresh set of available routines.</p></div><button className="secondary" onClick={() => go('dashboard')}>See this test in dashboard <ArrowRight size={16} /></button></section>;
}

function ActivityCard({ activity, checkinId, activityHistory }) {
  const [open, setOpen] = useState(false);
  if (!activity) return null;
  const completed = activityHistory.filter(a => a.checkinId === checkinId && a.activityId === activity.id);
  const doneCount = completed.length;
  return <><button className={'activityCard ' + (doneCount >= (activity.items?.length || 5) ? 'locked' : '')} onClick={() => setOpen(true)}><div className="actIcon">{activity.icon}</div><div><span>{activity.level}</span><h3>{activity.name}</h3><p>{activity.desc}</p><small>{activity.items?.length || 5} routines · {doneCount} completed for this test</small></div>{doneCount >= (activity.items?.length || 5) ? <Check size={18} /> : <ArrowRight size={18} />}</button>{open && <ActivityModal activity={activity} checkinId={checkinId} activityHistory={activityHistory} close={() => setOpen(false)} />}</>;
}

function ActivityModal({ activity, checkinId, activityHistory, close }) {
  const items = activity.items || FALLBACK_ACTIVITIES[activity.id]?.items.map(([name, duration]) => ({ name, duration, steps: ['Start gently and stay within a comfortable range.', 'Follow the activity at your own pace.', 'Pause if you need a break.', 'Finish with a slow recovery.'] })) || [];
  const completedNames = new Set(activityHistory.filter(a => a.checkinId === checkinId && a.activityId === activity.id).map(a => a.itemId));
  const firstAvailable = Math.max(0, items.findIndex(x => !completedNames.has(x.name)));
  const [selected, setSelected] = useState(firstAvailable >= 0 ? firstAvailable : 0); const routine = items[selected];
  const [seconds, setSeconds] = useState(routine.duration * 60); const [running, setRunning] = useState(false); const [done, setDone] = useState(completedNames.has(routine.name)); const [saving, setSaving] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (running && seconds > 0) ref.current = setInterval(() => setSeconds(s => s - 1), 1000); if (seconds === 0) setRunning(false); return () => clearInterval(ref.current); }, [running, seconds]);
  useEffect(() => { setRunning(false); setDone(completedNames.has(routine.name)); setSeconds(routine.duration * 60); }, [selected]);
  async function finish() {
    if (done || saving) return; setSaving(true); setRunning(false);
    const user = JSON.parse(localStorage.getItem('heal_leaf_user') || 'null');
    try { const r = await fetch(API + '/activity-complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user?.id, checkinId, activityId: activity.id, itemId: routine.name, duration: routine.duration * 60 - seconds }) }); const d = await r.json(); if (!r.ok) throw Error(d.error); setDone(true); window.dispatchEvent(new CustomEvent('heal-leaf-activity-recorded')); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0'); const ss = String(seconds % 60).padStart(2, '0');
  return <div className="modalBack" onMouseDown={e => e.target === e.currentTarget && close()}><div className="modal"><button className="close" onClick={close}><X size={19} /></button><div className="modalIcon">{activity.icon}</div><span className="eyebrow">{activity.level} · {items.length} ROUTINES</span><h2>{activity.name}</h2><p>{activity.desc}</p><label className="routineSelect">Choose a routine<select value={selected} onChange={e => setSelected(Number(e.target.value))}>{items.map((x, idx) => <option value={idx} key={x.name} disabled={completedNames.has(x.name)}>{x.name} · {x.duration} min {completedNames.has(x.name) ? '· completed' : ''}</option>)}</select></label><div className="routineHeader"><div><b>{routine.name}</b><span>{routine.duration} minute routine {done ? '· completed for this test' : ''}</span></div><Clock3 size={20} /></div><div className="timer"><span>Focus timer</span><strong>{mm}:{ss}</strong><button disabled={done} onClick={() => setRunning(!running)}>{running ? <Pause size={17} /> : <Play size={17} />}</button><button disabled={done} onClick={() => { setRunning(false); setSeconds(routine.duration * 60); }}><RotateCcw size={17} /></button></div><ol>{routine.steps.map((step, idx) => <li key={idx}>{step}</li>)}</ol>{done ? <div className="doneWrap"><div className="done"><Check size={17} /> You already completed this routine for this test.</div><button className="secondary wide" onClick={() => alert('You already completed it for this test. Do another test to use it again.')}>Finish again</button></div> : <button className="primary wide" onClick={finish}>{saving ? 'Saving…' : 'Finish & record activity'} <Check size={17} /></button>}</div></div>;
}

function Dashboard({ history, activityHistory }) {
  const [selectedTest, setSelectedTest] = useState(null);
  const [openActivity, setOpenActivity] = useState(null);
  const latest = history[history.length - 1]; const prev = history[history.length - 2];
  const avg = history.length ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0;
  const change = latest && prev ? latest.score - prev.score : null;
  const totalMinutes = Math.round(activityHistory.reduce((sum, a) => sum + (Number(a.duration) || 0), 0) / 60);
  const selectedActivities = selectedTest ? activityHistory.filter(a => a.checkinId === selectedTest.id) : [];
  const selectedGroups = Object.values(selectedActivities.reduce((acc, a) => {
    const key = a.activityId || a.activityName;
    if (!acc[key]) acc[key] = { id: key, name: a.activityName, icon: activityMap[key]?.icon || '🌱', rows: [] };
    acc[key].rows.push(a); return acc;
  }, {}));
  const testLabel = (h) => h.testNumber || history.findIndex(x => x.id === h.id) + 1;
  return <section><div className="dashTop"><div className="sectionTitle"><span>YOUR PROGRESS</span><h2>Your check-ins and <em>activity progress.</em></h2><p>Select a test to see exactly what you did for that check-in.</p></div>{latest && <span className={'levelPill ' + latest.level.toLowerCase()}>{latest.level}</span>}</div><div className="stats"><div><span>Latest score</span><strong>{latest?.score ?? '—'}</strong><small>{latest?.level || 'No check-in yet'}</small></div><div><span>Average score</span><strong>{avg || '—'}</strong><small>Across {history.length} check-in{history.length === 1 ? '' : 's'}</small></div><div><span>Activities done</span><strong>{activityHistory.length}</strong><small>{totalMinutes} minute{totalMinutes === 1 ? '' : 's'} recorded</small></div><div><span>Check-ins</span><strong>{history.length}</strong><small>{change === null ? 'Complete another to compare' : `${change > 0 ? '+' : ''}${change} vs previous`}</small></div></div>{!history.length ? <div className="empty"><div>🌱</div><h3>Your progress starts here</h3><p>Complete your first 15-question check-in to create your report.</p></div> : <><div className="dashGrid"><div className="panel"><h3>Score trend</h3><p className="muted">Lower scores mean fewer reported difficulties on this screening scale.</p><div className="trend">{history.slice(-10).map(h => <div className="barWrap" key={h.id}><div className="bar" style={{ height: `${Math.max(8, h.score)}%` }}><b>{h.score}</b></div><small>Test {testLabel(h)}<br />{new Date(h.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</small></div>)}</div></div><div className="panel"><h3>Latest report</h3><div className="bigLevel">{latest.level}</div><p>{(latest.recommendations || []).map(id => id === 'yoga' ? 'Yoga' : id === 'sports' ? 'Sports & Movement' : id === 'music' ? 'Music & Arts' : 'Mentorship & Support').join(' · ')}</p><hr /><h4>Test date</h4><p className="muted">{new Date(latest.createdAt).toLocaleString()}</p></div></div><div className="history"><h3>Check-in history</h3>{history.slice().reverse().map(h => <button className={'historyRow testRow ' + (selectedTest?.id === h.id ? 'selected' : '')} key={h.id} onClick={() => { setSelectedTest(h); setOpenActivity(null); }}><div><b>Test {testLabel(h)}</b><small>{new Date(h.createdAt).toLocaleDateString()} · {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></div><span className={h.level.toLowerCase()}>{h.level}</span><strong>{h.score}</strong><ArrowRight size={17} /></button>)}</div>{selectedTest && <div className="history selectedTest"><div className="selectedHead"><div><h3>Test {testLabel(selectedTest)}</h3><p className="muted">{new Date(selectedTest.createdAt).toLocaleString()} · {selectedTest.level} · Score {selectedTest.score}</p></div><button className="closeMini" onClick={() => { setSelectedTest(null); setOpenActivity(null); }}><X size={17} /></button></div><div className="testActivityGroups">{selectedGroups.length ? selectedGroups.map(group => <div className={'testActivityCard ' + (openActivity === group.id ? 'open' : '')} key={group.id}><button className="testActivityButton" onClick={() => setOpenActivity(openActivity === group.id ? null : group.id)}><span className="testActivityIcon">{group.icon}</span><span><b>{group.name}</b><small>{group.rows.length} activit{group.rows.length === 1 ? 'y' : 'ies'} recorded</small></span><strong>{openActivity === group.id ? '−' : '+'}</strong></button>{openActivity === group.id && <div className="testActivityRows">{group.rows.map(a => <div className="activityHistoryRow" key={a.id}><div><b>{a.itemId || 'Routine'}</b><small>Completed activity</small></div><span>{new Date(a.completedAt).toLocaleDateString()} · {new Date(a.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><strong>{Math.max(0, Math.round((Number(a.duration) || 0) / 60))} min</strong></div>)}</div>}</div>) : <div className="empty compact"><div>🌱</div><h4>No activity recorded for this test</h4><p>Complete a recommended activity from this test to see it here.</p></div>}</div></div>}</>}</section>;
}

function About() { return <section className="about"><div className="sectionTitle"><span>ABOUT HEAL LEAF</span><h2>A calmer way to <em>check in.</em></h2><p>Heal Leaf is a wellbeing-support prototype that turns a 15-question self-check into a broad level, practical activity suggestions and a simple progress record.</p></div><div className="aboutGrid"><div className="panel"><h3>How it works</h3><ol><li>Answer all 15 questions.</li><li>Receive LOW, MODERATE, HIGH or CRITICAL.</li><li>Open recommended activities with 4–5 routine choices and timers.</li><li>Completed routines are recorded in the dashboard.</li></ol></div><div className="panel"><h3>Support mapping</h3><div className="supportRow"><b>LOW</b><span>Music / Arts</span></div><div className="supportRow"><b>MODERATE</b><span>Yoga · Music / Arts · Sports</span></div><div className="supportRow"><b>HIGH</b><span>Sports · Mentorship</span></div><div className="supportRow"><b>CRITICAL</b><span>Mentorship · professional support nudge</span></div></div></div><div className="team"><div className="sectionTitle"><span>THE TEAM</span><h2>Built by <em>students.</em></h2></div><div className="teamGrid">{TEAM.map((n, i) => <div className="member" key={n}><div>{String(i + 1).padStart(2, '0')}</div><b>{n}</b><span>Heal Leaf Team</span></div>)}</div></div><div className="disclaimer"><ShieldCheck size={20} /><p><b>Important:</b> Heal Leaf is a non-diagnostic wellbeing screening and support prototype. A score cannot confirm depression, trauma or another mental-health condition. Activities are general wellbeing options, not medical treatment. If someone is struggling significantly, encourage support from a trusted person or qualified professional.</p></div></section>; }

createRoot(document.getElementById('root')).render(<App />);
