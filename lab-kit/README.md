# Kit de laboratório
## Trabalho Final (Segurança em Computação 2026/2)

Este kit sobe, com um comando, os alvos do trabalho **na sua máquina**, com todas as portas publicadas **somente em `127.0.0.1`**.

| Serviço | Endereço | Observação |
|---|---|---|
| OWASP Juice Shop | http://127.0.0.1:3000 | Sistema (i) do trabalho |
| SecNote | http://127.0.0.1:4000 | Sistema (ii): aplicação do professor |
| NetCheck | http://127.0.0.1:4001 | Sistema (ii): aplicação do professor |

## Requisitos

- Docker e Docker Compose v2 (`docker compose version`).
- Conexão com a internet apenas para baixar as imagens na primeira vez.
- Recomendado: uma máquina virtual ou um usuário dedicado para o laboratório, principalmente se você for usar um agente de IA (o shell do agente não tem sandbox).

## 1. Preparar

```bash
cp .env.example .env
# edite o .env e coloque o GROUP_ID que o professor passou ao seu grupo
```

O `GROUP_ID` individualiza os dados das aplicações SecNote e NetCheck para o seu grupo. **Não compartilhe com outros grupos.** 

## 2. Subir o ambiente

```bash
docker compose up -d --build
docker compose ps
```

Verificação rápida (cada comando deve responder com uma descrição ou página):

```bash
curl -s http://127.0.0.1:3000 | head -c 200
curl -s http://127.0.0.1:4000/
curl -s http://127.0.0.1:4001/
```

## 3. Resetar

Para voltar ao estado inicial de qualquer alvo:

```bash
docker compose down
docker compose up -d --build
```

## 4. Regras de segurança (resumo)

- Portas em `127.0.0.1` apenas. **Não** altere o compose para publicar em `0.0.0.0` nem na rede.
- Só teste estes alvos. Qualquer outro sistema está fora do escopo e pode configurar crime (Art. 154-A do Código Penal).
- Nunca coloque chaves de API, `.env` ou segredos em prints, vídeo, relatório ou repositório.
- Se usar o CAI, mantenha `CAI_TELEMETRY=false` (ver o tutorial de setup).

## Problemas comuns

- *Porta já em uso:* outro programa usa 3000, 4000 ou 4001. Pare-o ou ajuste a porta no compose yml mantendo `127.0.0.1`.
- *Permissão negada no Docker (Linux):* use `sudo docker ...` ou adicione seu usuário ao grupo `docker`.
- *Imagem não baixa:* verifique a rede e tente `docker compose pull`.
