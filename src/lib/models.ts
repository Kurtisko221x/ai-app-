// Modely pre XSkinny AI scripter.
// Používateľ si NEVYBERÁ model — backend automaticky skúša tento zoznam od hora dole
// a použije prvý ktorý práve funguje (free modely bývajú rate-limited, tak striedame).
// Všetko sú modely ZADARMO (:free) — fungujú aj s nulovým zostatkom na OpenRouter.
// Free model IDs sa časom menia — over aktuálne: GET https://openrouter.ai/api/v1/models
// a filtruj pricing.prompt==0 && pricing.completion==0.

export const AUTO_MODELS: string[] = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-120b:free",
  "qwen/qwen3-coder:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "openai/gpt-oss-20b:free",
  "google/gemma-4-31b-it:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
];
