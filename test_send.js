const data = {
  nom: 'Automated Test',
  email: 'automated@test.example',
  telephone: '0661678643',
  sujet: 'Test POST',
  message: 'Ceci est un test d\'envoi via test_send.js'
};

fetch('http://localhost:3000/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}).then(async res => {
  const body = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', body);
}).catch(err => {
  console.error('Fetch error:', err);
});
