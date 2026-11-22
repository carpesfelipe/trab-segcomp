# SecNote

Aplicativo de notas propositalmente vulnerável, construído do zero para este trabalho (não é um projeto público — não existe writeup para procurar na internet).

## Subir

Prefira o `docker-compose.yml` na raiz do kit (já passa `GROUP_ID`). Para subir isoladamente:

```bash
docker build -t secnote .
docker run --rm -d -p 127.0.0.1:4000:4000 -e GROUP_ID=0 --name secnote secnote
```

A variável `GROUP_ID` individualiza as senhas semeadas e a flag por grupo.

## Vulnerabilidade

`POST /api/login` monta a query SQL por concatenação direta de string (ver comentário "VULNERAVEL" em `server.js`), permitindo bypass de autenticação via SQL injection.

## Não usar em produção / não expor na internet

Vulnerável de propósito, só para o ambiente isolado do laboratório.
