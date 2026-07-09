// Modely pre XSkinny AI scripter.
// Backend skúša tento zoznam ZHORA DOLE a použije prvý ktorý funguje.
//
// Poradie je zámerne: NAJPRV najkvalitnejšie (platené) modely — ak máš na
// OpenRouter kredit, dostaneš špičkovú kvalitu (Claude). Keď kredit nemáš,
// tieto vrátia 402 a backend automaticky spadne na FREE modely (fungujú aj s 0$).
//
// 👉 Pre najlepšie skripty si na https://openrouter.ai/settings/credits dobi ~5$.
// Model IDs a ceny: https://openrouter.ai/models

export const AUTO_MODELS: string[] = [
  // --- ŠPIČKA (platené, potrebujú OpenRouter kredit) ---
  "anthropic/claude-sonnet-4.5", // najlepší na Roblox/Luau kód
  "openai/gpt-4o", // silná záloha
  "google/gemini-2.0-flash-001", // lacnejšie, stále dobré

  // --- ZADARMO (fungujú aj s nulovým zostatkom, ale slabšie) ---
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-120b:free",
  "qwen/qwen3-coder:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
];
