/*
 * NetCheck — utilitario de diagnostico de rede propositalmente vulneravel
 * (fins didaticos)
 *
 * Vulnerabilidade intencional: OS command injection no endpoint de
 * diagnostico, causada por passar entrada do usuario direto para um shell
 * (linha marcada abaixo com "VULNERAVEL"). Nao corrija isso — e o proposito
 * do desafio.
 *
 * NAO USE EM PRODUCAO. NAO EXPONHA NA INTERNET.
 */

const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

// GROUP_ID individualiza o conteudo exposto por grupo.
const GROUP_ID = process.env.GROUP_ID || '0';

app.get('/', (req, res) => {
  res.type('text/plain').send(
    'NetCheck API - endpoint: POST /api/ping {"host": "<host ou ip>"}'
  );
});

// ---------------------------------------------------------------------
// VULNERAVEL (achado 2, independente do command injection abaixo):
// endpoint de diagnostico interno sem nenhum controle de autenticacao
// ou autorizacao, expondo informacao que deveria ser restrita a operadores
// (aqui, um identificador interno e uma nota de configuracao).
// ---------------------------------------------------------------------
app.get('/api/status', (req, res) => {
  return res.status(200).json({
    service: 'netcheck',
    internal_group_tag: `netcheck-internal-g${GROUP_ID}`,
    config_note: 'modo de diagnostico habilitado para todos os hosts da rede interna',
  });
});

// ---------------------------------------------------------------------
// VULNERAVEL: o valor de "host" e interpolado direto dentro de uma string
// de comando de shell, sem validacao nem uso de execFile/argumentos
// separados. Qualquer metacaractere de shell (; | & $() `` etc.) permite
// injetar comandos arbitrarios.
// ---------------------------------------------------------------------
app.post('/api/ping', (req, res) => {
  const { host } = req.body || {};

  if (typeof host !== 'string' || host.length === 0) {
    return res.status(400).json({ error: 'campo host e obrigatorio' });
  }

  const command = `ping -c 1 -W 2 ${host}`; // VULNERAVEL: interpolacao direta em shell

  exec(command, { timeout: 5000 }, (err, stdout, stderr) => {
    if (err && !stdout) {
      return res.status(200).json({
        ok: false,
        command,
        stdout,
        stderr,
        error: err.message,
      });
    }
    return res.status(200).json({
      ok: true,
      command,
      stdout,
      stderr,
    });
  });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`NetCheck rodando em http://localhost:${PORT}`);
});
