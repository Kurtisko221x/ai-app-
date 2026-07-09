// Cenník a kreditové balíky. Reálne platby prídu vo Fáze 3 (Stripe).
// Zatiaľ slúžia na zobrazenie na landing page a pri registrácii.

export const FREE_CREDITS = 30; // koľko dostane nový účet zadarmo
export const CREDITS_PER_MESSAGE = 1; // koľko stojí jedna odpoveď AI

export type Plan = {
  id: string;
  name: string;
  price: string; // zobrazená cena
  period: string;
  credits: string;
  features: string[];
  highlight?: boolean;
  cta: string;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "0 €",
    period: "navždy",
    credits: `${FREE_CREDITS} kreditov na štart`,
    features: [
      "Vyskúšaj bez záväzkov",
      "Prístup k lacnejším modelom",
      "Kopírovanie kódu + zvýraznenie",
    ],
    cta: "Začať zadarmo",
  },
  {
    id: "hobby",
    name: "Hobby",
    price: "5 €",
    period: "/ mesiac",
    credits: "1 000 kreditov / mesiac",
    features: [
      "Všetky modely vrátane Claude",
      "História konverzácií",
      "Prioritná rýchlosť",
      "Ideálne pre jednu hru",
    ],
    highlight: true,
    cta: "Vybrať Hobby",
  },
  {
    id: "pro",
    name: "Pro",
    price: "15 €",
    period: "/ mesiac",
    credits: "5 000 kreditov / mesiac",
    features: [
      "Všetko z Hobby",
      "Najvyššia priorita",
      "Dlhší kontext (väčšie skripty)",
      "Pre serióznych tvorcov hier",
    ],
    cta: "Vybrať Pro",
  },
];
