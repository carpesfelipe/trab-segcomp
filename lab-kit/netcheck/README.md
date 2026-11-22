# NetCheck

Utilitário de diagnóstico de rede propositalmente vulnerável, construído do zero para este trabalho (não é um projeto público — não existe writeup para procurar na internet).

## Subir

Prefira o `docker-compose.yml` na raiz do kit (já passa `GROUP_ID`). Para subir isoladamente:

```bash
docker build -t netcheck .
docker run --rm -d -p 127.0.0.1:4001:4001 -e GROUP_ID=0 --name netcheck netcheck
```

## Vulnerabilidades

`POST /api/ping` interpola o campo `host` direto numa string de shell (ver comentário "VULNERAVEL" em `server.js`), permitindo injeção de comandos via metacaracteres de shell (`;`, `|`, `&&`, `` ` ``, `$()`).

`GET /api/status` expõe informação de diagnóstico interno sem nenhum controle de acesso (ver segundo comentário "VULNERAVEL"). É uma falha distinta da primeira, de outra categoria (exposição de informação / ausência de autenticação em endpoint sensível).

## Não usar em produção / não expor na internet

Vulnerável de propósito, só para o ambiente isolado do laboratório.
