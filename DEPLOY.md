# 🚂 Nasadenie XSkinny AI scripter na Railway

Návod krok po kroku. Všetky príkazy spúšťaj v priečinku **`roblox-ai`**.

> 💡 Railway = appka aj databáza na jednom mieste, žiadne timeouty na streaming.
> Má štartovací free kredit, potom ~5 €/mesiac.

---

## Krok 0 — Príprava (1 min)

1. Ulož svoj Roblox avatar sem: **`roblox-ai/public/xskinny-avatar.png`** (nepovinné, ale nech je značka kompletná).
2. Vytvor si účet na **https://railway.com** (prihlás sa cez GitHub alebo email).

---

## Krok 1 — Nainštaluj Railway CLI a prihlás sa

```bash
npm i -g @railway/cli
railway login
```
(otvorí sa prehliadač, potvrď prihlásenie)

---

## Krok 2 — Vytvor projekt a databázu

```bash
railway init            # vytvor nový projekt (zadaj názov, napr. xskinny-ai)
```

Potom pridaj **PostgreSQL databázu**:
- Otvor projekt v prehliadači: `railway open`
- Klikni **+ New** → **Database** → **Add PostgreSQL**

---

## Krok 3 — Nastav premenné prostredia (env)

V Railway dashboarde klikni na svoju **appku** (nie databázu) → záložka **Variables** → pridaj:

| Názov | Hodnota |
|-------|---------|
| `OPENROUTER_API_KEY` | tvoj kľúč z openrouter.ai |
| `AUTH_SECRET` | *(vygeneruj — viď nižšie)* |
| `ADMIN_EMAILS` | tvoj admin email (napr. `kurtegrell@gmail.com`) |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` *(referencia na DB — Railway ju doplní)* |
| `APP_URL` | zatiaľ nechaj prázdne, doplníš v kroku 5 |

**Ako vygenerovať `AUTH_SECRET`** (spusti lokálne, výsledok vlož do Railway):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
> ⚠️ `AUTH_SECRET` je tajný — nikdy ho nedávaj do gitu ani nikomu neposielaj.

---

## Krok 4 — Nasaď appku

```bash
railway up
```
Railway nahrá kód, spraví build a spustí to. Pri štarte sa **automaticky vytvoria
tabuľky v databáze** (cez `prisma db push` — je to v `railway.json`).

---

## Krok 5 — Vytvor doménu (URL tvojej stránky)

V dashboarde: appka → **Settings** → **Networking** → **Generate Domain**.
Dostaneš adresu ako `https://xskinny-ai.up.railway.app`.

1. Skopíruj ju a nastav ju ako premennú **`APP_URL`** (Variables) → appka sa sama redeployne.
2. Otvor tú adresu — stránka beží! 🎉

---

## Krok 6 — Sprav sa adminom

1. Na svojej novej stránke klikni **Začať zadarmo** a zaregistruj sa emailom
   **kurtegrell@gmail.com** (ten je v `ADMIN_EMAILS`).
2. Automaticky budeš mať prístup do **/admin**. Hotovo. 👑

---

## 🖥️ (Nepovinné) Lokálny vývoj proti tej istej databáze

Ak chceš appku aj naďalej spúšťať u seba (`npm run dev`), potrebuješ pripojenie
na Postgres — použi tú istú Railway databázu:

1. Railway → klikni na **Postgres** → záložka **Variables** → skopíruj
   **`DATABASE_PUBLIC_URL`** (verejná adresa, nie internú).
2. Vlož ju do lokálneho súboru **`.env`** ako `DATABASE_URL="..."`.
3. Spusti:
   ```bash
   npx prisma db push     # vytvorí tabuľky
   npm run dev
   ```

> Takto máš lokálne aj na produkcii **rovnakú databázu** — žiadne prekvapenia.

---

## 🔄 Ako nahrať zmeny neskôr

Keď niečo upravíš v kóde, len znova spusti:
```bash
railway up
```

---

## ⚠️ Poznámky

- **Nikdy necommituj/nezdieľaj** `.env` ani `.env.local` — sú tam kľúče.
- Databáza je teraz **PostgreSQL** (nie SQLite) — trvalá, nič sa nestratí pri redeployi.
- `prisma db push` pri štarte je pohodlné pre betu. Pre „ostrú" verziu neskôr
  prejdeme na Prisma **migrácie** (bezpečnejšie pri zmenách schémy).
- Ak by build padal na pamäti, v Railway zvýš plán alebo skús `railway up` znova.
