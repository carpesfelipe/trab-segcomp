/*
 * SecNote — aplicativo de notas propositalmente vulneravel (fins didaticos)
 *
 * Vulnerabilidade intencional: SQL injection classica no endpoint de login,
 * causada por concatenacao direta de string numa query SQL (linha marcada
 * abaixo com "VULNERAVEL"). Nao corrija isso — e o proposito do desafio.
 *
 * NAO USE EM PRODUCAO. NAO EXPONHA NA INTERNET.
 */

const express = require('express');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());

const db = new Database(':memory:');

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL
  );
`);

// GROUP_ID individualiza os dados por grupo (senhas e flag diferentes),
// para que grupos distintos nao cheguem aos mesmos valores exatos.
const GROUP_ID = process.env.GROUP_ID || '0';

const seedUsers = [
  { username: 'ana', password: `trilha-azul-92-g${GROUP_ID}`, role: 'user' },
  { username: 'bruno', password: `cafe-com-leite-7-g${GROUP_ID}`, role: 'user' },
  { username: 'admin', password: `k9#mP2$vL8qX-g${GROUP_ID}`, role: 'admin' },
];

const insertUser = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
for (const u of seedUsers) insertUser.run(u.username, u.password, u.role);

const insertNote = db.prepare('INSERT INTO notes (owner_id, title, body) VALUES (?, ?, ?)');
insertNote.run(1, 'Lista de compras', 'Leite, ovos, pao.');
insertNote.run(2, 'Ideias de projeto', 'App de rastreamento de habitos.');
insertNote.run(3, 'Credenciais do painel interno', `FLAG{secnote_admin_sqli_ok_g${GROUP_ID}}`);

app.get('/', (req, res) => {
  res.type('text/plain').send(
    'SecNote API - endpoints: POST /api/login {username, password}, ' +
    'GET /api/notes (header x-user-id)'
  );
});

// ---------------------------------------------------------------------
// VULNERAVEL: a query abaixo e montada por concatenacao direta de string,
// em vez de usar parametros preparados (como insertUser/insertNote acima
// corretamente fazem). Isso permite SQL injection classica via os campos
// "username" ou "password".
// ---------------------------------------------------------------------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'username e password sao obrigatorios' });
  }

  const query =
    "SELECT id, username, role FROM users WHERE username = '" +
    username +
    "' AND password = '" +
    password +
    "'"; // VULNERAVEL: concatenacao direta, sem sanitizacao nem parametros

  try {
    const row = db.prepare(query).get();

    if (!row) {
      return res.status(401).json({ error: 'credenciais invalidas' });
    }

    return res.status(200).json({
      message: 'login bem-sucedido',
      user: { id: row.id, username: row.username, role: row.role },
    });
  } catch (err) {
    // Erros de sintaxe SQL vazam para o cliente de proposito, como em
    // muitas aplicacoes reais mal configuradas — pode servir de pista.
    return res.status(500).json({ error: 'erro de banco de dados', detail: String(err.message) });
  }
});

app.get('/api/notes', (req, res) => {
  const ownerId = parseInt(req.header('x-user-id'), 10);
  if (!ownerId) {
    return res.status(400).json({ error: 'header x-user-id e obrigatorio' });
  }
  const rows = db.prepare('SELECT id, title, body FROM notes WHERE owner_id = ?').all(ownerId);
  return res.status(200).json({ notes: rows });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SecNote rodando em http://localhost:${PORT}`);
});
