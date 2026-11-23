const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'jobs.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initial sample data
const defaultJobs = [
  { id: 1, company: 'TCS Digital', role: 'Full-Stack Developer', status: 'Interview', ctc: '7.5 LPA', date: '2026-11-20' },
  { id: 2, company: 'Zomato', role: 'Backend Engineer (Node.js)', status: 'Applied', ctc: '12 LPA', date: '2026-11-22' },
  { id: 3, company: 'Infosys', role: 'Software Engineer', status: 'Offer', ctc: '6.5 LPA', date: '2026-11-15' }
];

function readJobs() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultJobs, null, 2));
    return defaultJobs;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeJobs(jobs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2));
}

// GET all jobs
app.get('/api/jobs', (req, res) => {
  res.json(readJobs());
});

// POST new job
app.post('/api/jobs', (req, res) => {
  const { company, role, status, ctc } = req.body;
  if (!company || !role) {
    return res.status(400).json({ error: 'Company aur Role zaroori hai' });
  }
  const jobs = readJobs();
  const newJob = {
    id: Date.now(),
    company,
    role,
    status: status || 'Applied',
    ctc: ctc || 'Not Disclosed',
    date: new Date().toISOString().split('T')[0]
  };
  jobs.unshift(newJob);
  writeJobs(jobs);
  res.status(201).json(newJob);
});

// PATCH update job status
app.patch('/api/jobs/:id', (req, res) => {
  const jobs = readJobs();
  const job = jobs.find(j => j.id === Number(req.params.id));
  if (!job) return res.status(404).json({ error: 'Job not found' });

  job.status = req.body.status || job.status;
  writeJobs(jobs);
  res.json(job);
});

// DELETE job
app.delete('/api/jobs/:id', (req, res) => {
  let jobs = readJobs();
  jobs = jobs.filter(j => j.id !== Number(req.params.id));
  writeJobs(jobs);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});