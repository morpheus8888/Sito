const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const app = express();
const db = new Low(new JSONFile(path.join(__dirname, 'db.json')));

async function initDb() {
  await db.read();
  db.data ||= { users: [], entries: [] };
  await db.write();
}

initDb();

app.use(bodyParser.json());
app.use(session({
  secret: 'diarioSegreto',
  resave: false,
  saveUninitialized: false
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  next();
}

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing data' });
  await db.read();
  if (db.data.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User exists' });
  }
  const id = Date.now().toString();
  db.data.users.push({ id, email, password });
  await db.write();
  req.session.userId = id;
  res.json({ success: true });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.userId = user.id;
  res.json({ success: true });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get('/api/entries', requireAuth, async (req, res) => {
  await db.read();
  const entries = db.data.entries.filter(e => e.userId === req.session.userId);
  res.json(entries);
});

app.post('/api/entries', requireAuth, async (req, res) => {
  const { date, text } = req.body;
  if (!date) return res.status(400).json({ error: 'Missing date' });
  await db.read();
  const today = new Date().toISOString().slice(0,10);
  let entry = db.data.entries.find(e => e.userId === req.session.userId && e.date === date);
  if (date !== today) {
    if (entry) {
      return res.status(403).json({ error: 'Past entries cannot be edited' });
    }
    return res.status(403).json({ error: 'Can only create today\'s entry' });
  }
  if (entry) {
    entry.text = text;
  } else {
    db.data.entries.push({ userId: req.session.userId, date, text });
  }
  await db.write();
  res.json({ success: true });
});

// Serve static files
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
