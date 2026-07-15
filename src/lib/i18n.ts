import { cookies } from "next/headers";

export type Lang = "en" | "sk";
export const LANGS: Lang[] = ["en", "sk"];
export const DEFAULT_LANG: Lang = "en";

// Zistí jazyk z cookie (default = angličtina).
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get("lang")?.value === "sk" ? "sk" : "en";
}

type Plan = {
  name: string;
  price: string;
  period: string;
  credits: string;
  features: string[];
  highlight?: boolean;
  cta: string;
};

type Dict = {
  nav: Record<string, string>;
  hero: {
    badge: string;
    titleA: string;
    titleGrad: string;
    sub1: string;
    subBold: string;
    sub2: string;
    ctaIn: string;
    ctaOut: string;
    ctaSecondary: string;
    trust: string;
  };
  how: { eyebrow: string; title: string; steps: { title: string; text: string }[] };
  feat: { eyebrow: string; title: string; sub: string; items: { icon: string; title: string; text: string }[] };
  who: { eyebrow: string; title: string; list: string[]; chatYou: string; chatAi: string };
  pricing: { eyebrow: string; title: string; sub: string; note: string; soon: string; popular: string; plans: Plan[] };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  cta: { title: string; sub: string };
  discord: { title: string; sub: string; button: string };
  footer: {
    desc: string;
    owner: string;
    product: string;
    account: string;
    community: string;
    l_features: string;
    l_how: string;
    l_pricing: string;
    l_signup: string;
    l_login: string;
    l_app: string;
    l_faq: string;
    l_discord: string;
    l_templates: string;
    disclaimer: string;
  };
};

const en: Dict = {
  nav: {
    features: "Features",
    templates: "Templates",
    plugin: "Plugin 🎮",
    pricing: "Pricing",
    discord: "Discord",
    login: "Log in",
    signupFree: "Start free",
    toApp: "Open app",
    admin: "Admin",
  },
  hero: {
    badge: "XSkinny AI scripter · beta",
    titleA: "Build Roblox scripts",
    titleGrad: "without coding",
    sub1: "Describe what you want in your game — XSkinny AI writes the full Luau code and tells you ",
    subBold: "exactly where to put it in Roblox Studio",
    sub2: ". Even if you're a total beginner.",
    ctaIn: "Open app",
    ctaOut: "Start free",
    ctaSecondary: "How it works",
    trust: "⚡ Free credits to start · 🌍 Multiple languages · 🔒 No install",
  },
  how: {
    eyebrow: "How it works",
    title: "From idea to code in 3 steps",
    steps: [
      { title: "Describe what you want", text: "„Make a leaderboard with kills.“ Plain words are enough." },
      { title: "Get working code", text: "The AI writes the Luau script and tells you exactly where to put it in Studio." },
      { title: "Paste and play", text: "Copy it, paste into Roblox Studio, hit Play. Done. 🎉" },
    ],
  },
  feat: {
    eyebrow: "Features",
    title: "Not just any AI — a buddy that knows Roblox",
    sub: "Regular chatbots give you code that doesn't work or that you can't place. XSkinny AI is different.",
    items: [
      { icon: "🧠", title: "Understands Roblox", text: "Knows Luau, services, RemoteEvents and the server/client split. Not a generic chatbot." },
      { icon: "📍", title: "Tells you WHERE it goes", text: "Every script comes with the exact place in Roblox Studio — ServerScriptService, StarterGui, ModuleScript..." },
      { icon: "💬", title: "Say it your way", text: "No jargon needed. Type „a door that opens when touched“ and get finished code." },
      { icon: "🎮", title: "Code right in Studio", text: "Not tied to the website. Our plugin sends the script straight into Roblox Studio — placed for you." },
      { icon: "⬇️", title: "Copy or download", text: "Highlighted syntax, Copy and Download (.lua) buttons. Whatever suits you." },
      { icon: "🛡️", title: "Safe code", text: "The AI makes sure the client can't be trusted — protecting your game from exploits." },
    ],
  },
  who: {
    eyebrow: "Who it's for",
    title: "For everyone who wants to make Roblox games",
    list: [
      "🌱 **Beginners** — can't code? No problem, say it your way.",
      "🚀 **Game creators** — speed up your work, stop googling.",
      "🧩 **Stuck?** — got an error? Paste the code and the AI fixes it.",
      "📚 **Students** — learn Luau on real examples.",
    ],
    chatYou: "„I want the player to get +10 coins when picking up a coin“",
    chatAi: "🤖 XSkinny AI: Sure! This is a Server Script, put it in the coin. Here's the code... ✅",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Simple pricing. No surprises.",
    sub: "Start free. Pay only when you actually use it — credits are spent only on AI answers.",
    note: "💳 Payments (Stripe) coming soon. For now try everything free on your starter credits.",
    soon: "Coming soon 🔜",
    popular: "Most popular",
    plans: [
      { name: "Free", price: "€0", period: "forever", credits: "30 credits to start", features: ["Try with no commitment", "Generate Roblox scripts", "Copy & download code"], cta: "Start free" },
      { name: "Hobby", price: "€5", period: "/ month", credits: "1,000 credits / month", features: ["Top-tier AI quality", "Code right in Roblox Studio", "Chat history", "Priority speed"], highlight: true, cta: "Choose Hobby" },
      { name: "Pro", price: "€15", period: "/ month", credits: "5,000 credits / month", features: ["Everything in Hobby", "Highest priority", "Longer context (bigger scripts)", "For serious game creators"], cta: "Choose Pro" },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    items: [
      { q: "Do I need to know how to code?", a: "No. That's exactly why XSkinny AI exists — you write in plain words and get finished code with instructions on where to put it. You learn along the way." },
      { q: "Does it really write working Roblox code?", a: "Yes. The AI is tuned specifically for Roblox and Luau — it knows services, scripts, RemoteEvents and common patterns from Roblox games." },
      { q: "How do credits work?", a: "Every AI answer costs credits. After signing up you get free credits to try. When you run out, you top up a pack." },
      { q: "Is it free?", a: "To try, yes — a new account gets starter credits. Heavier use is via cheap monthly packs." },
      { q: "Is this an official Roblox tool?", a: "No, we're an independent tool. We're not affiliated with Roblox Corporation." },
    ],
  },
  cta: { title: "Ready to build your game?", sub: "Sign up and write your first script in 30 seconds." },
  discord: {
    title: "Join our Discord community",
    sub: "Thousands of Roblox creators, script help, news, giveaways and a direct AI chat. See you there! 🎮",
    button: "Join Discord →",
  },
  footer: {
    desc: "Your AI buddy for making Roblox games. From idea to code in seconds.",
    owner: "Owner: **XSkinny** · beta",
    product: "Product",
    account: "Account",
    community: "Community",
    l_features: "Features",
    l_how: "How it works",
    l_pricing: "Pricing",
    l_signup: "Sign up",
    l_login: "Log in",
    l_app: "App",
    l_faq: "FAQ",
    l_discord: "Discord server",
    l_templates: "Templates",
    disclaimer: "Not affiliated with Roblox Corporation. „Roblox“ is a trademark of its owner.",
  },
};

const sk: Dict = {
  nav: {
    features: "Funkcie",
    templates: "Templaty",
    plugin: "Plugin 🎮",
    pricing: "Ceny",
    discord: "Discord",
    login: "Prihlásiť",
    signupFree: "Začať zadarmo",
    toApp: "Do aplikácie",
    admin: "Admin",
  },
  hero: {
    badge: "XSkinny AI scripter · beta",
    titleA: "Vytvor Roblox skript",
    titleGrad: "bez programovania",
    sub1: "Popíš čo chceš v hre — XSkinny AI ti napíše hotový Luau kód a povie presne ",
    subBold: "kam ho v Roblox Studio vložiť",
    sub2: ". Aj keď si úplný začiatočník.",
    ctaIn: "Otvoriť aplikáciu",
    ctaOut: "Začať zadarmo",
    ctaSecondary: "Ako to funguje",
    trust: "⚡ Kredity zadarmo na štart · 🌍 Viac jazykov · 🔒 Bez inštalácie",
  },
  how: {
    eyebrow: "Ako to funguje",
    title: "Od nápadu ku kódu za 3 kroky",
    steps: [
      { title: "Popíš čo chceš", text: "„Sprav leaderboard s bodmi za zabitia.“ Stačí normálna reč." },
      { title: "Dostaneš hotový kód", text: "AI napíše Luau skript a povie ti presne kam ho v Studiu vložiť." },
      { title: "Vlož a hraj", text: "Skopíruješ, prilepíš do Roblox Studia, stlačíš Play. Hotovo. 🎉" },
    ],
  },
  feat: {
    eyebrow: "Funkcie",
    title: "Nie hocijaká AI — parťák čo pozná Roblox",
    sub: "Bežné chatboty ti dajú kód ktorý nefunguje alebo nevieš kam ho dať. XSkinny AI je iné.",
    items: [
      { icon: "🧠", title: "Rozumie Robloxu", text: "Pozná Luau, služby, RemoteEvents aj rozdiel medzi serverom a klientom. Nie je to obyčajný chatbot." },
      { icon: "📍", title: "Povie ti KAM to dať", text: "Ku každému skriptu dostaneš presné miesto v Roblox Studio — ServerScriptService, StarterGui, ModuleScript..." },
      { icon: "💬", title: "Píšeš po svojom", text: "Žiadne odborné termíny netreba. Napíš „chcem dvere čo sa otvoria po dotyku“ a máš hotový kód." },
      { icon: "🎮", title: "Kóduj priamo v Studiu", text: "Nie si viazaný len na web. Cez náš plugin pošleš skript rovno do Roblox Studia — vloží sa sám." },
      { icon: "⬇️", title: "Kopíruj alebo stiahni", text: "Zvýraznená syntax, tlačidlo Kopírovať aj Stiahnuť (.lua). Ako sa ti hodí." },
      { icon: "🛡️", title: "Bezpečný kód", text: "AI dbá na to aby sa hráčovi (klientovi) nedalo veriť — chráni tvoju hru pred exploitmi." },
    ],
  },
  who: {
    eyebrow: "Pre koho",
    title: "Pre každého kto chce robiť Roblox hry",
    list: [
      "🌱 **Začiatočníci** — nevieš kód? Nevadí, píšeš po svojom.",
      "🚀 **Tvorcovia hier** — zrýchli prácu, prestaň googliť.",
      "🧩 **Zaseknutí** — máš chybu? Vlož kód a AI ju nájde.",
      "📚 **Študenti** — uč sa Luau na reálnych príkladoch.",
    ],
    chatYou: "„Chcem aby hráč dostal +10 coinov keď zoberie mincu“",
    chatAi: "🤖 XSkinny AI: Jasné! Toto je Server Script, daj ho do mince. Tu je kód... ✅",
  },
  pricing: {
    eyebrow: "Cenník",
    title: "Jednoduché ceny. Žiadne prekvapenia.",
    sub: "Začni zadarmo. Plať len keď to naozaj používaš — kredity míňaš len za odpovede AI.",
    note: "💳 Platby (Stripe) pripravujeme. Zatiaľ si vyskúšaj všetko zadarmo na štartovacích kreditoch.",
    soon: "Čoskoro 🔜",
    popular: "Najobľúbenejší",
    plans: [
      { name: "Free", price: "0 €", period: "navždy", credits: "30 kreditov na štart", features: ["Vyskúšaj bez záväzkov", "Generovanie Roblox skriptov", "Kopírovanie a sťahovanie kódu"], cta: "Začať zadarmo" },
      { name: "Hobby", price: "5 €", period: "/ mesiac", credits: "1 000 kreditov / mesiac", features: ["Špičková AI kvalita", "Priame kódovanie v Roblox Studio", "História konverzácií", "Prioritná rýchlosť"], highlight: true, cta: "Vybrať Hobby" },
      { name: "Pro", price: "15 €", period: "/ mesiac", credits: "5 000 kreditov / mesiac", features: ["Všetko z Hobby", "Najvyššia priorita", "Dlhší kontext (väčšie skripty)", "Pre serióznych tvorcov hier"], cta: "Vybrať Pro" },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Časté otázky",
    items: [
      { q: "Musím vedieť programovať?", a: "Nie. Práve preto XSkinny AI vznikol — píšeš vlastnými slovami a dostaneš hotový kód aj s návodom kam ho dať. Popri tom sa učíš." },
      { q: "Naozaj to napíše funkčný Roblox kód?", a: "Áno. AI je vyladené špeciálne na Roblox a jazyk Luau — pozná služby, skripty, RemoteEvents aj bežné vzory z Roblox hier." },
      { q: "Ako fungujú kredity?", a: "Každá odpoveď AI stojí kredity. Po registrácii dostaneš kredity zadarmo na vyskúšanie. Keď minieš, doplníš si balík." },
      { q: "Je to zadarmo?", a: "Na vyskúšanie áno — nový účet dostane štartovacie kredity. Väčšie používanie je cez lacné mesačné balíky." },
      { q: "Je to oficiálny nástroj od Robloxu?", a: "Nie, sme nezávislý nástroj. Nie sme spojení so spoločnosťou Roblox Corporation." },
    ],
  },
  cta: { title: "Pripravený vytvoriť svoju hru?", sub: "Zaregistruj sa a napíš svoj prvý skript o 30 sekúnd." },
  discord: {
    title: "Pridaj sa do našej Discord komunity",
    sub: "Tisíce Roblox tvorcov, pomoc so skriptami, novinky, giveaways a priamy AI chat. Uvidíme sa tam! 🎮",
    button: "Pripojiť sa na Discord →",
  },
  footer: {
    desc: "Tvoj AI parťák na tvorbu Roblox hier. Od nápadu ku kódu za sekundy.",
    owner: "Owner: **XSkinny** · beta verzia",
    product: "Produkt",
    account: "Účet",
    community: "Komunita",
    l_features: "Funkcie",
    l_how: "Ako to funguje",
    l_pricing: "Ceny",
    l_signup: "Registrácia",
    l_login: "Prihlásenie",
    l_app: "Aplikácia",
    l_faq: "FAQ",
    l_discord: "Discord server",
    l_templates: "Templaty",
    disclaimer: "Nie sme spojení so spoločnosťou Roblox Corporation. „Roblox“ je ochranná známka jej vlastníka.",
  },
};

const DICTS: Record<Lang, Dict> = { en, sk };

export async function getDict(): Promise<{ lang: Lang; t: Dict }> {
  const lang = await getLang();
  return { lang, t: DICTS[lang] };
}
