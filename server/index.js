const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'db.json');

fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({ users: {}, checkins: [], activities: [] }, null, 2));
}

const readDb = () => JSON.parse(fs.readFileSync(dbFile, 'utf8'));
const writeDb = (db) => fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));

app.use(cors());
app.use(express.json());

const questions = [
  { id: 1, category: 'Stress', text: 'How often have you felt overwhelmed by everyday responsibilities?' },
  { id: 2, category: 'Stress', text: 'How often have you found it difficult to relax or switch off?' },
  { id: 3, category: 'Stress', text: 'How often has worry made it hard to focus on your usual tasks?' },
  { id: 4, category: 'Mood', text: 'How often have you felt low, empty, or emotionally drained?' },
  { id: 5, category: 'Mood', text: 'How often have you lost interest in things you normally enjoy?' },
  { id: 6, category: 'Mood', text: 'How often have you felt tired or without your usual energy?' },
  { id: 7, category: 'Mood', text: 'How often have you been unusually hard on yourself?' },
  { id: 8, category: 'Difficult experiences', text: 'How often have difficult past experiences affected your sense of safety or calm?' },
  { id: 9, category: 'Difficult experiences', text: 'How often have reminders of difficult experiences made you uncomfortable?' },
  { id: 10, category: 'Difficult experiences', text: 'How often have you avoided situations because they bring up difficult feelings?' },
  { id: 11, category: 'Wellbeing', text: 'How often has your sleep or daily routine felt disrupted?' },
  { id: 12, category: 'Wellbeing', text: 'How often have you felt disconnected from people around you?' },
  { id: 13, category: 'Wellbeing', text: 'How often has it been difficult to keep up with normal activities?' },
  { id: 14, category: 'Wellbeing', text: 'How often have you felt that you need more support than usual?' },
  { id: 15, category: 'Wellbeing', text: 'How often have you felt unable to get back to your usual balance?' }
];

const activities = [
  {
    id: 'yoga', name: 'Yoga', type: 'Movement', level: 'Moderate', icon: '🧘',
    desc: 'Choose a short, gentle routine and move only within a comfortable range.',
    items: [
      { name: 'Breathing & shoulder release', duration: 5, steps: ['Sit comfortably.', 'Take slow breaths for one minute.', 'Roll shoulders gently forward and back.', 'Finish with three relaxed breaths.'] },
      { name: 'Cat-Cow stretch', duration: 6, steps: ['Come to a comfortable hands-and-knees position.', 'Move slowly between a rounded and relaxed back.', 'Keep the movement gentle.', 'Rest for a few breaths.'] },
      { name: 'Child’s pose reset', duration: 5, steps: ['Kneel or use a comfortable seated version.', 'Lean forward only as far as comfortable.', 'Breathe slowly.', 'Return to sitting gradually.'] },
      { name: 'Standing stretch flow', duration: 8, steps: ['Stand with feet comfortable apart.', 'Reach arms up gently.', 'Stretch side to side without forcing.', 'Finish with slow breathing.'] },
      { name: 'Gentle full-body flow', duration: 10, steps: ['Start with easy shoulder and neck movement.', 'Add gentle standing stretches.', 'Pause whenever needed.', 'Finish with slow breathing and a short rest.'] }
    ]
  },
  {
    id: 'sports', name: 'Sports & Movement', type: 'Movement', level: 'Moderate–High', icon: '🏃',
    desc: 'A simple movement session to reset energy and attention.',
    items: [
      { name: 'Brisk walk', duration: 10, steps: ['Walk at an easy pace for two minutes.', 'Increase to a comfortable brisk pace.', 'Keep breathing comfortably.', 'Slow down for the final two minutes.'] },
      { name: 'Marching reset', duration: 8, steps: ['March gently in place.', 'Keep shoulders relaxed.', 'Continue at a comfortable pace.', 'Slow down and rest.'] },
      { name: 'Light mobility circuit', duration: 10, steps: ['Walk in place.', 'Add gentle arm circles.', 'Try comfortable bodyweight movements.', 'Take a short recovery walk.'] },
      { name: 'Badminton practice', duration: 15, steps: ['Warm up with easy movement.', 'Practice light rallies or footwork.', 'Keep intensity comfortable.', 'Finish with slow walking and water.'] },
      { name: 'Outdoor movement break', duration: 20, steps: ['Start with an easy walk.', 'Add a few minutes of your preferred sport.', 'Take breaks whenever needed.', 'Cool down with a slow walk.'] }
    ]
  },
  {
    id: 'music', name: 'Music & Arts', type: 'Creative reset', level: 'Low–Moderate', icon: '🎨',
    desc: 'Use sound or creativity as a low-pressure reset.',
    items: [
      { name: 'Calm music break', duration: 5, steps: ['Choose a calm song.', 'Put away distractions.', 'Listen and notice the sounds.', 'Take one slow breath before ending.'] },
      { name: 'Doodle reset', duration: 8, steps: ['Take paper or a drawing app.', 'Draw lines, shapes, or patterns freely.', 'Do not judge the result.', 'Pause and notice how you feel.'] },
      { name: 'Colouring session', duration: 10, steps: ['Choose a simple colouring page or shapes.', 'Work slowly and comfortably.', 'Focus on the colours and movement.', 'Stop when the timer ends.'] },
      { name: 'Free writing', duration: 7, steps: ['Write whatever is on your mind.', 'Do not worry about grammar.', 'Continue until the timer ends.', 'Finish with one positive or neutral observation.'] },
      { name: 'Music + sketch', duration: 12, steps: ['Play a calm track.', 'Sketch anything inspired by the sound.', 'Keep the activity pressure-free.', 'Finish by saving or closing the page.'] }
    ]
  },
  {
    id: 'mentorship', name: 'Mentorship & Support', type: 'Support', level: 'High–Critical', icon: '🤝',
    desc: 'A structured guide for reaching out to someone you trust or a qualified professional.',
    items: [
      { name: 'Talk to a trusted person', duration: 10, steps: ['Choose someone you trust.', 'Say that you would like to talk.', 'Share only what you are comfortable sharing.', 'Ask what support could help next.'] },
      { name: 'Prepare a support message', duration: 8, steps: ['Write the name of the person you want to contact.', 'Write one sentence about what has been difficult.', 'Write what kind of support you want.', 'Send it when you feel ready.'] },
      { name: 'Mentor conversation plan', duration: 12, steps: ['List one thing that is bothering you.', 'List one thing you want to improve.', 'Choose one question to ask your mentor.', 'Write down the next step you agree on.'] },
      { name: 'Professional support plan', duration: 10, steps: ['Identify a qualified counsellor or mental-health professional available to you.', 'Write down what you want help with.', 'Prepare two questions for the first conversation.', 'Choose a practical next step.'] },
      { name: 'Support circle check-in', duration: 15, steps: ['Think of two or three trusted people.', 'Choose one person to contact first.', 'Share how you have been doing.', 'Decide what support or follow-up would be useful.'] }
    ]
  }
];

const activityMap = Object.fromEntries(activities.map((a) => [a.id, a]));
const scoreLevel = (score) => score <= 20 ? 'LOW' : score <= 40 ? 'MODERATE' : score <= 60 ? 'HIGH' : 'CRITICAL';
const recommendations = (level) => ({
  LOW: ['music'],
  MODERATE: ['yoga', 'music', 'sports'],
  HIGH: ['sports', 'mentorship'],
  CRITICAL: ['mentorship']
}[level]);

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.get('/api/questions', (_, res) => res.json(questions));
app.get('/api/activities', (_, res) => res.json(activities));

app.get('/api/profile/:email', (req, res) => {
  const db = readDb();
  const u = db.users[String(req.params.email).toLowerCase()];
  if (!u) return res.status(404).json({ error: 'Profile not found' });
  res.json(u);
});

app.post('/api/register', (req, res) => {
  const { name, email, dob } = req.body || {};
  if (!name || !email || !dob) return res.status(400).json({ error: 'Name, email and date of birth are required' });
  const key = String(email).trim().toLowerCase();
  const db = readDb();
  if (db.users[key]) return res.status(409).json({ error: 'An account with this email already exists' });
  const user = { id: 'u_' + Date.now(), name: String(name).trim(), email: key, dob: String(dob), createdAt: new Date().toISOString() };
  db.users[key] = user;
  writeDb(db);
  res.json(user);
});

app.post('/api/submit', (req, res) => {
  const { userId, email, answers } = req.body || {};
  if (!userId || !email || !Array.isArray(answers) || answers.length !== questions.length) {
    return res.status(400).json({ error: 'Please complete all 15 questions.' });
  }
  const safe = answers.map(Number);
  if (safe.some((n) => !Number.isFinite(n) || n < 0 || n > 3)) return res.status(400).json({ error: 'Invalid answer values.' });
  const raw = safe.reduce((a, b) => a + b, 0);
  const score = Math.round((raw / (questions.length * 3)) * 100);
  const level = scoreLevel(score);
  const categoryTotals = {};
  questions.forEach((q, idx) => {
    categoryTotals[q.category] = (categoryTotals[q.category] || 0) + safe[idx];
  });
  const categoryScores = {};
  for (const [cat, total] of Object.entries(categoryTotals)) {
    const count = questions.filter((q) => q.category === cat).length;
    categoryScores[cat] = Math.round((total / (count * 3)) * 100);
  }
  const db = readDb();
  const testNumber = db.checkins.filter((x) => x.userId === userId).length + 1;
  const item = {
    id: 'c_' + Date.now(), userId, email: String(email).toLowerCase(), score, raw, level, testNumber,
    recommendations: recommendations(level), categoryScores, answers: safe, createdAt: new Date().toISOString()
  };
  db.checkins.push(item);
  writeDb(db);
  res.json(item);
});

app.get('/api/history/:userId', (req, res) => {
  const db = readDb();
  res.json(db.checkins.filter((x) => x.userId === req.params.userId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
});

app.get('/api/activity-history/:userId', (req, res) => {
  const db = readDb();
  const rows = db.activities.filter((x) => x.userId === req.params.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(rows.map((x) => ({ ...x, testNumber: db.checkins.find((c) => c.id === x.checkinId)?.testNumber || null, activityName: activityMap[x.activityId]?.name || x.activityId })));
});

app.post('/api/activity-complete', (req, res) => {
  const { userId, checkinId, activityId, itemId, duration } = req.body || {};
  if (!userId || !checkinId || !activityMap[activityId]) return res.status(400).json({ error: 'Missing activity data' });
  const db = readDb();
  const checkin = db.checkins.find((x) => x.id === checkinId && x.userId === userId);
  if (!checkin) return res.status(400).json({ error: 'Check-in not found. Please complete a new check-in.' });
  const alreadyDone = db.activities.some((x) => x.userId === userId && x.checkinId === checkinId && x.activityId === activityId && x.itemId === itemId);
  if (alreadyDone) return res.status(409).json({ error: 'This routine is already completed for this check-in. Complete a new check-in to use it again.' });
  const item = activityMap[activityId].items.find((x) => x.name === itemId) || activityMap[activityId].items[0];
  db.activities.push({
    id: 'a_' + Date.now(), userId, checkinId, activityId, itemId: item.name,
    activityName: activityMap[activityId].name, duration: Math.max(0, Number(duration) || 0),
    plannedDuration: item.duration * 60, completedAt: new Date().toISOString()
  });
  writeDb(db);
  res.json({ ok: true });
});

const dist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(dist));
app.get('*', (_, res) => res.sendFile(path.join(dist, 'index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`Heal Leaf running on port ${PORT}`));
