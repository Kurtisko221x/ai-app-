# 🎮 RoBlox AI

AI chat asistent, ktorý pomáha ľuďom písať a chápať **Roblox (Luau) skripty**.
Používateľ popíše čo chce a dostane hotový kód + vysvetlenie kam ho v Roblox Studio vložiť.

Postavené na **Next.js 16 + TypeScript**, model beží cez **OpenRouter**.

---

## 🚀 Ako to spustiť (lokálne)

1. **Získaj OpenRouter kľúč**
   - Choď na https://openrouter.ai/keys, prihlás sa, vytvor kľúč (`sk-or-v1-...`).
   - OpenRouter funguje na kredit — nabi si pár dolárov, lacné modely stoja centy.

2. **Vlož kľúč** do súboru `.env.local` (už existuje v projekte):
   ```
   OPENROUTER_API_KEY=sk-or-v1-tvoj-kluc-tu
   ```

3. **Spusti appku:**
   ```bash
   npm run dev
   ```
   Otvor http://localhost:3000

Hotovo — napíš do chatu čo chceš vyskriptovať. 🎉

---

## 🗺️ Stránky (routes)

| URL | Čo to je |
|-----|----------|
| `/` | Landing page (marketing — hero, funkcie, ceny, FAQ). |
| `/signup`, `/login` | Registrácia / prihlásenie. |
| `/chat` | Samotná AI appka (zamknuté za prihlásením). |
| `/ucet` | Účet používateľa — zostatok kreditov. |
| `/cennik` | Cenník / balíky kreditov. |

## 🧠 Kde čo je

| Súbor | Čo robí |
|-------|---------|
| `src/lib/prompt.ts` | "Mozog" — inštrukcie pre AI (ako sa správa, Roblox pravidlá). |
| `src/lib/models.ts` | Zoznam ponúkaných AI modelov. |
| `src/lib/plans.ts` | Cenník + koľko kreditov stojí správa (`CREDITS_PER_MESSAGE`) a koľko dostane nový účet (`FREE_CREDITS`). |
| `src/lib/auth.ts` | Prihlasovanie — heslá (bcrypt) + session (JWT cookie). |
| `src/lib/db.ts` | Prisma klient (databáza). |
| `prisma/schema.prisma` | Štruktúra databázy (User, Chat, Message). |
| `src/app/api/chat/route.ts` | Backend chatu — auth + odpočítanie kreditov + streaming z OpenRouter. |
| `src/app/api/auth/*` | Registrácia / prihlásenie / odhlásenie. |
| `src/components/Chat.tsx` | Chat UI. |
| `src/components/marketing/*` | Časti landing page (nav, hero editor, ceny, footer). |
| `src/app/marketing.css` | Vzhľad landing / auth / účtu. |

---

## 🚀 Nasadenie (hosting)

Appka je pripravená na **Railway** (appka + PostgreSQL). Presný návod krok po kroku:
👉 **[DEPLOY.md](DEPLOY.md)**

## 🗄️ Databáza (Prisma)

Po zmene `schema.prisma` spusti:
```bash
npx prisma db push      # zosynchronizuje databázu
npx prisma studio       # (nepovinné) vizuálny prehliadač dát
```

---

## 🗺️ Roadmap (ďalšie fázy)

- [x] **Fáza 1 — Jadro:** chat + OpenRouter streaming, výber modelu, kopírovanie kódu.
- [x] **Fáza 2 — Účty + Landing:** registrácia/prihlásenie, databáza, kreditový systém, marketing homepage, cenník, účet.
- [ ] **Fáza 3 — Platby:** Stripe (reálny nákup kreditov / predplatné), história chatov v UI, admin.

---

## ⚠️ Poznámky

- `.env.local` **NIKDY** nedávaj do gitu / verejne — je tam tvoj platený kľúč.
- Modely v `models.ts` sú príklady; over si aktuálne ID a ceny na https://openrouter.ai/models.
