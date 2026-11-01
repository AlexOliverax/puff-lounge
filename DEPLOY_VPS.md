# Deploy VPS — Puff & Lounge (`pufflounge.app.br`)

Aplicação Web App / PWA (Expo Router + Metro Single-Page Export) pronta para instalação na tela inicial do **iPhone (Safari iOS)** e **Android**.

## 1. Apontamento DNS no Registro.br
No painel do **Registro.br** (`pufflounge.app.br` → DNS → Editar Zona):
- Tipo `A` | Nome: *(em branco / raiz)* → IP público da VPS
- Tipo `A` | Nome: `www` → IP público da VPS *(opcional, redirecionar para `pufflounge.app.br`)*

> **Importante:** O domínio `.app.br` exige **HTTPS (SSL válido via Let's Encrypt / Caddy / Traefik / Certbot)** obrigatoriamente nos navegadores (HSTS preload) e para liberar GPS (`expo-location`) e modo PWA no iPhone.

---

## 2. Opção A — Deploy via Docker / Painel (Coolify, Easypanel, Traefik, Docker Compose)
O repositório já inclui `Dockerfile` multi-stage (`node:22-alpine` → `nginx:1.27-alpine`) e `nginx.conf` com fallback SPA:

```bash
docker build -t puff-lounge:latest .
docker run -d --name puff-lounge -p 8085:80 --restart unless-stopped puff-lounge:latest
```
Depois, aponte o proxy reverso HTTPS de `https://pufflounge.app.br` para `http://127.0.0.1:8085` (ou porta `80` interna do container).

---

## 3. Opção B — Deploy Estático Direto no Nginx/Caddy da VPS (Sem Docker)
```bash
npm install --legacy-peer-deps
npm run export:web
```
- O comando `npm run export:web` já executa automaticamente `preexport:web` (copiando `assets/icon.png` para `public/apple-touch-icon.png` e `public/icon-512.png`) e gera a pasta estática final em **`dist/`**.
- Sirva a pasta `dist/` com fallback SPA (`try_files $uri $uri/ /index.html;` — veja modelo completo em `nginx.conf`).

