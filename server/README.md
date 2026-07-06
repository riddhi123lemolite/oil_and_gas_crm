# Sarvadesk AI proxy (optional)

The CRM assistant works out of the box with a **built-in grounded engine** — no
server, no key. This little service is only needed if you want to switch the
assistant to a **real LLM (Claude)** with fuller natural-language understanding.
The LLM stays grounded: it can only answer using the CRM's real data (via tools),
and it falls back to the built-in engine automatically if this service is off.

**Why a server?** A website cannot safely hold an API key — anyone could read it.
So the key lives here, on your VPS, and the website talks to this relay.

## Turn it on — plain steps (on the VPS)

1. **Copy the folder up.** Put this `server/` folder on the VPS, e.g. `/var/www/ai-proxy`.

2. **Add your key.** In `/var/www/ai-proxy`, copy `.env.example` to `.env` and paste your
   Anthropic key (from console.anthropic.com):
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ANTHROPIC_MODEL=claude-sonnet-5
   ALLOWED_ORIGIN=https://crm.sarvadesk.com
   ```
   Never upload `.env` to GitHub.

3. **Install & keep it running:**
   ```bash
   cd /var/www/ai-proxy
   npm install
   sudo npm i -g pm2
   pm2 start index.js --name ai-proxy
   pm2 save
   ```
   It listens only on `127.0.0.1:8787` (not exposed to the internet directly).

4. **Point nginx at it.** In your `crm.sarvadesk.com` site config, inside the `server { … }`
   block, add:
   ```nginx
   location /api/ai/ {
       proxy_pass http://127.0.0.1:8787;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
   }
   ```
   Then `sudo nginx -t && sudo systemctl reload nginx`.

5. **Switch the website to the LLM.** In the site's `.env`, set:
   ```
   VITE_LLM_ENABLED=true
   VITE_AI_PROXY_URL=/api/ai
   ```
   Rebuild and redeploy the frontend (`npm run build`, upload `dist/`).

6. **Test.** Open the assistant and ask *"how much diesel did we sell last year?"* — you
   should get a natural, grounded answer. Health check: `curl https://crm.sarvadesk.com/api/ai/health`.

## Turn it off / revert
Set `VITE_LLM_ENABLED=false` in the site `.env`, rebuild, redeploy. The built-in engine
takes over instantly. (You can also just `pm2 stop ai-proxy` — the site auto-falls-back.)

## Cost control
- Use a cheaper model: `ANTHROPIC_MODEL=claude-haiku-4-5-20251001`.
- `MAX_TOKENS` caps each reply; the per-IP rate limit and the 4-step tool loop bound usage.
