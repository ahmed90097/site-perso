const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || null;

// Configure transporter from environment variables
// Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, TO_EMAIL
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post('/send', async (req, res) => {
  const { nom, email, telephone, sujet, message } = req.body || {};
  if (!nom || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Champs manquants (nom, email, message requis).' });
  }

  const to = process.env.TO_EMAIL || process.env.SMTP_USER;
  const mailOptions = {
    from: `${nom} <${email}>`,
    to,
    subject: sujet ? `Contact: ${sujet}` : 'Nouveau message depuis le site Mangach Travaux',
    text: `Nom: ${nom}\nEmail: ${email}\nTelephone: ${telephone || '-'}\nSujet: ${sujet || '-'}\n\nMessage:\n${message}`,
    html: `<p><strong>Nom:</strong> ${nom}</p><p><strong>Email:</strong> ${email}</p><p><strong>Telephone:</strong> ${telephone || '-'}</p><p><strong>Sujet:</strong> ${sujet || '-'}</p><hr><p>${message.replace(/\n/g, '<br>')}</p>`
  };

  // Prepare entry and save immediately (so messages are kept even if mail fails)
  const entry = {
    timestamp: new Date().toISOString(),
    nom: nom,
    email: email,
    telephone: telephone || '',
    sujet: sujet || '',
    message: message
  };

  try {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const ndjsonPath = path.join(dataDir, 'messages.ndjson');
    fs.appendFileSync(ndjsonPath, JSON.stringify(entry) + '\n', { encoding: 'utf8' });

    const csvPath = path.join(dataDir, 'messages.csv');
    const csvHeader = 'timestamp,nom,email,telephone,sujet,message\n';
    if (!fs.existsSync(csvPath)) {
      fs.writeFileSync(csvPath, csvHeader, { encoding: 'utf8' });
    }
    function escCSV(v) {
      if (v === null || v === undefined) return '';
      const s = String(v).replace(/"/g, '""');
      return '"' + s + '"';
    }
    const csvLine = [entry.timestamp, entry.nom, entry.email, entry.telephone, entry.sujet, entry.message].map(escCSV).join(',') + '\n';
    fs.appendFileSync(csvPath, csvLine, { encoding: 'utf8' });

    const jsonPath = path.join(dataDir, 'messages.json');
    let arr = [];
    if (fs.existsSync(jsonPath)) {
      try { arr = JSON.parse(fs.readFileSync(jsonPath, 'utf8') || '[]'); } catch (e) { arr = []; }
    }
    arr.push(entry);
    fs.writeFileSync(jsonPath, JSON.stringify(arr, null, 2), 'utf8');
  } catch (fsErr) {
    console.error('Erreur en sauvegardant le message:', fsErr);
  }

  // Try to send email (best-effort)
  try {
    await transporter.sendMail(mailOptions);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(200).json({ ok: false, error: 'Erreur lors de l envoi du mail. Le message a toutefois ete enregistre.' });
  }
});

// --- Admin: list and download saved message files ---
app.get('/admin', (req, res) => {
  if (ADMIN_KEY && req.query.key !== ADMIN_KEY) {
    return res.status(401).send('Unauthorized');
  }

  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    return res.send('<h3>No messages yet</h3>');
  }

  const allowed = ['messages.csv', 'messages.json', 'messages.ndjson'];
  const files = allowed.filter(f => fs.existsSync(path.join(dataDir, f))).map(f => {
    const stat = fs.statSync(path.join(dataDir, f));
    return { name: f, size: stat.size };
  });

  let html = '<!doctype html><html><head><meta charset="utf-8"><title>Admin - Messages</title></head><body style="font-family:Arial,Helvetica,sans-serif;padding:20px">';
  html += '<h2>Messages saved</h2>';
  if (files.length === 0) html += '<p>Aucun fichier de messages disponible.</p>';
  else {
    html += '<ul>';
    files.forEach(f => {
      html += `<li>${f.name} (${f.size} bytes) - <a href="/admin/download?file=${encodeURIComponent(f.name)}${ADMIN_KEY ? '&key=' + ADMIN_KEY : ''}">Télécharger</a></li>`;
    });
    html += '</ul>';
  }
  html += '<p>Note: set environment variable ADMIN_KEY to protect this page (optional).</p>';
  html += '</body></html>';
  res.send(html);
});

app.get('/admin/download', (req, res) => {
  const file = req.query.file;
  if (!file) return res.status(400).send('Missing file');
  if (ADMIN_KEY && req.query.key !== ADMIN_KEY) return res.status(401).send('Unauthorized');

  const safeFiles = ['messages.csv', 'messages.json', 'messages.ndjson'];
  if (!safeFiles.includes(file)) return res.status(404).send('Not found');

  const filePath = path.join(__dirname, 'data', file);
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');

  res.download(filePath, file);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
