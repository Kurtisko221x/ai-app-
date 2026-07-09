// Rozparsuje odpoveď modelu (formát @@SCRIPT@@ ... @@END@@) na štruktúrované dáta,
// ktoré plugin použije na vloženie skriptov do Roblox Studia.

export type PluginScript = {
  name: string;
  className: "Script" | "LocalScript" | "ModuleScript";
  target: string; // služba kam skript patrí
  source: string; // Luau kód
};

export type PluginResult = {
  explanation: string;
  scripts: PluginScript[];
};

const VALID_CLASSES = ["Script", "LocalScript", "ModuleScript"] as const;
const VALID_TARGETS = [
  "ServerScriptService",
  "StarterPlayerScripts",
  "StarterCharacterScripts",
  "StarterGui",
  "ReplicatedStorage",
  "ServerStorage",
  "Workspace",
];

export function normalizeClass(raw: string): PluginScript["className"] {
  const t = raw.trim().toLowerCase();
  if (t.includes("localscript")) return "LocalScript";
  if (t.includes("modulescript")) return "ModuleScript";
  return "Script";
}

export function normalizeTarget(raw: string): string {
  const t = raw.trim().toLowerCase();
  const match = VALID_TARGETS.find((v) => v.toLowerCase() === t);
  if (match) return match;
  // skús nájsť čiastočnú zhodu
  const partial = VALID_TARGETS.find((v) => t.includes(v.toLowerCase()));
  return partial ?? "ServerScriptService";
}

export function sanitizeName(raw: string): string {
  const cleaned = raw.trim().replace(/[^\w]/g, "").slice(0, 40);
  return cleaned || "XSkinnyScript";
}

export function parsePluginResponse(text: string): PluginResult {
  const blockRegex = /@@SCRIPT@@([\s\S]*?)@@END@@/g;
  const scripts: PluginScript[] = [];

  let firstBlockIndex = text.length;
  let m: RegExpExecArray | null;
  while ((m = blockRegex.exec(text)) !== null) {
    if (m.index < firstBlockIndex) firstBlockIndex = m.index;
    const body = m[1];

    const name = /name:\s*(.+)/i.exec(body)?.[1] ?? "XSkinnyScript";
    const type = /type:\s*(.+)/i.exec(body)?.[1] ?? "Script";
    const target = /target:\s*(.+)/i.exec(body)?.[1] ?? "ServerScriptService";

    // kód v ```lua ... ``` (alebo obyčajné ```)
    const codeMatch = /```(?:lua)?\s*\n?([\s\S]*?)```/i.exec(body);
    const source = (codeMatch?.[1] ?? "").replace(/\s+$/, "");

    if (source.trim().length > 0) {
      scripts.push({
        name: sanitizeName(name),
        className: normalizeClass(type),
        target: normalizeTarget(target),
        source,
      });
    }
  }

  const explanation =
    scripts.length > 0
      ? text.slice(0, firstBlockIndex).trim()
      : text.trim();

  return { explanation, scripts };
}
