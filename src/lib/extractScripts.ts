import {
  type PluginScript,
  normalizeClass,
  normalizeTarget,
  sanitizeName,
} from "./pluginParse";

// Vytiahne skripty z markdown správy z web chatu.
// Primárne podľa značky "📍 KAM: type | target | name" pred code blokom.
// Fallback: ak značky nie sú, zoberie všetky ```lua bloky s rozumnými defaultmi.
export function extractScripts(markdown: string): PluginScript[] {
  const scripts: PluginScript[] = [];

  // 1) Značka + nasledujúci code blok
  const markerRegex =
    /📍\s*KAM:\s*([^\n]+)\n+\s*```(?:lua|luau)?\s*\n([\s\S]*?)```/gi;
  let m: RegExpExecArray | null;
  let usedFallback = true;
  while ((m = markerRegex.exec(markdown)) !== null) {
    usedFallback = false;
    const parts = m[1].split("|").map((p) => p.trim());
    const source = (m[2] ?? "").replace(/\s+$/, "");
    if (source.trim().length === 0) continue;
    scripts.push({
      className: normalizeClass(parts[0] ?? "Script"),
      target: normalizeTarget(parts[1] ?? "ServerScriptService"),
      name: sanitizeName(parts[2] ?? `Script${scripts.length + 1}`),
      source,
    });
  }

  if (!usedFallback) return scripts;

  // 2) Fallback — všetky ```lua bloky (bez značky)
  const codeRegex = /```(?:lua|luau)?\s*\n([\s\S]*?)```/gi;
  let c: RegExpExecArray | null;
  let i = 0;
  while ((c = codeRegex.exec(markdown)) !== null) {
    const source = (c[1] ?? "").replace(/\s+$/, "");
    if (source.trim().length === 0) continue;
    i++;
    scripts.push({
      className: "Script",
      target: "ServerScriptService",
      name: `XSkinnyScript${i}`,
      source,
    });
  }

  return scripts;
}
