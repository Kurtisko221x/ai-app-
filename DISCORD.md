# 🤖 XSkinny AI — Discord bot + server (návod)

Bot generuje celý server, ukazuje kredity, live status, tickety, level systém a welcome.
Prihlásenie na web ide aj cez Discord.

---

## Krok 1 — Vytvor Discord aplikáciu (bot)

1. Choď na **https://discord.com/developers/applications** → **New Application** → daj názov „XSkinny AI".
2. Ľavé menu **Bot** → **Reset Token** → skopíruj **TOKEN** (to je `DISCORD_TOKEN`, nikomu ho nedávaj!).
3. Na tej istej stránke zapni **Privileged Gateway Intents → Server Members Intent** (ZAPNI!) a ulož.
4. Ľavé menu **OAuth2** → skopíruj **Client ID** (`DISCORD_CLIENT_ID`) a **Client Secret** (`DISCORD_CLIENT_SECRET`).

### Redirect pre prihlásenie cez Discord
V **OAuth2 → Redirects** pridaj presne:
```
https://ai-app-production-d99c.up.railway.app/api/auth/discord/callback
```

---

## Krok 2 — Pozvi bota na svoj server

1. **OAuth2 → URL Generator** → zaškrtni scopes: **`bot`** a **`applications.commands`**.
2. V **Bot Permissions** zaškrtni **Administrator** (bot potrebuje práva na tvorbu rolí/kanálov).
3. Skopíruj vygenerovanú URL dole, otvor ju, vyber svoj server → **Authorize**.

---

## Krok 3 — Nastav premenné na Railway

### A) WEB služba (`ai-app-`) → Variables — pridaj:
| Názov | Hodnota |
|-------|---------|
| `DISCORD_CLIENT_ID` | Client ID z Kroku 1 |
| `DISCORD_CLIENT_SECRET` | Client Secret z Kroku 1 |

### B) Vytvor BOT službu:
1. V Railway projekte **+ New** → **GitHub Repo** → vyber **`ai-app-`** (áno, to isté repo).
2. Na novej službe **Settings**:
   - **Start Command:** `npm run bot`
3. Na novej službe **Variables** — pridaj:
   | Názov | Hodnota |
   |-------|---------|
   | `DISCORD_TOKEN` | token bota z Kroku 1 |
   | `DISCORD_CLIENT_ID` | Client ID |
   | `DISCORD_GUILD_ID` | ID tvojho servera *(nepovinné — príkazy naskočia hneď; ako zistiť ID nižšie)* |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (referencia na tú istú DB) |
   | `APP_URL` | `https://ai-app-production-d99c.up.railway.app` |
4. Deploy prebehne sám. V **Deploy logs** máš vidieť `🤖 Prihlásený ako ...`.

> **ID servera:** v Discorde zapni Developer Mode (User Settings → Advanced), potom pravý klik na server → **Copy Server ID**.

---

## Krok 4 — Vygeneruj server 🎉

Na svojom Discord serveri napíš (ako admin):
```
/setup-server
```
Bot vytvorí role, kategórie, kanály, permissie, pošle pravidlá, cenník aj ticket panel.

---

## Príkazy bota

| Príkaz | Čo robí |
|--------|---------|
| `/setup-server` | (admin) vygeneruje celý server |
| `/status` | live stav web appky (online/offline + odozva) |
| `/kredity` | zostatok kreditov (treba prepojený účet) |
| `/prepojit` | prepojí Discord účet s webom |
| `/cennik`, `/pravidla` | zobrazí embed |
| `/rank`, `/leaderboard` | level systém |

Plus automaticky: 👋 welcome + auto-rola, 🎫 tickety (tlačidlo), 📊 XP za správy.

---

## 🖥️ Lokálne spustenie bota (nepovinné)

Do `.env` / `.env.local` daj `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, `APP_URL`, `DATABASE_URL`, potom:
```bash
npm run bot
```

---

## ⚠️ Časté problémy
- **Bot je offline** → skontroluj `DISCORD_TOKEN` a či máš zapnutý **Server Members Intent**.
- **`/setup-server` hlási chýbajúce práva** → bot musí mať rolu s **Administrator** a byť **nad** ostatnými rolami (Server Settings → Roles → presuň bota vyššie).
- **Prihlásenie cez Discord nefunguje** → over redirect URL a `DISCORD_CLIENT_SECRET` na web službe.
