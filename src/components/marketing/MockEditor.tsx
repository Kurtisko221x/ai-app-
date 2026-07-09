// Čisto vizuálna ukážka "editora" pre hero sekciu. Napodobňuje Roblox Studio:
// vľavo strom Explorer (kam kód patrí), vpravo vygenerovaný Luau kód.
import type { ReactNode } from "react";

// malé pomocníky na farbenie syntaxe (musia byť s veľkým písmenom = React komponenty)
const K = (p: { children: ReactNode }) => <span className="t-k">{p.children}</span>;
const F = (p: { children: ReactNode }) => <span className="t-f">{p.children}</span>;
const S = (p: { children: ReactNode }) => <span className="t-s">{p.children}</span>;
const C = (p: { children: ReactNode }) => <span className="t-c">{p.children}</span>;
const N = (p: { children: ReactNode }) => <span className="t-n">{p.children}</span>;
const B = (p: { children: ReactNode }) => <span className="t-b">{p.children}</span>;

function Line({ n, children }: { n: number; children: ReactNode }) {
  return (
    <span className="cl">
      <span className="ln">{n}</span>
      <span className="lc">{children}</span>
    </span>
  );
}

export default function MockEditor() {
  return (
    <div className="editor">
      <div className="editor-titlebar">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="editor-title">MojaHra.rbxl — XSkinny AI scripter</span>
      </div>

      <div className="editor-body">
        {/* Explorer strom — kam skript patrí */}
        <aside className="editor-explorer">
          <div className="explorer-head">EXPLORER</div>
          <ul className="tree">
            <li className="tree-svc">🎮 game</li>
            <li className="tree-child hl">
              📁 ServerScriptService
              <ul>
                <li className="tree-file active">📜 DvereScript</li>
              </ul>
            </li>
            <li className="tree-child">📁 ReplicatedStorage</li>
            <li className="tree-child">📁 StarterGui</li>
            <li className="tree-child">📁 Workspace</li>
          </ul>
          <div className="explorer-tip">
            👆 AI ti povie presne <b>sem</b> to vlož
          </div>
        </aside>

        {/* Kód */}
        <div className="editor-code">
          <div className="code-tabs">
            <span className="tab active">📜 DvereScript.lua</span>
            <span className="place-badge">Server Script</span>
          </div>
          <pre className="lua">
            <code>
              <Line n={1}>
                <K>local</K> dvere = script.Parent
              </Line>
              <Line n={2}>
                <K>local</K> otvorene = <B>false</B>
              </Line>
              <Line n={3}> </Line>
              <Line n={4}>
                <C>-- Otvorí / zavrie dvere po kliknutí</C>
              </Line>
              <Line n={5}>
                <K>local</K> klik = <F>Instance.new</F>(
                <S>&quot;ClickDetector&quot;</S>)
              </Line>
              <Line n={6}>klik.Parent = dvere</Line>
              <Line n={7}> </Line>
              <Line n={8}>
                klik.MouseClick:<F>Connect</F>(<K>function</K>()
              </Line>
              <Line n={9}>
                {"  "}otvorene = <K>not</K> otvorene
              </Line>
              <Line n={10}>
                {"  "}dvere.CanCollide = <K>not</K> otvorene
              </Line>
              <Line n={11}>
                {"  "}dvere.Transparency = otvorene <K>and</K> <N>0.7</N>{" "}
                <K>or</K> <N>0</N>
              </Line>
              <Line n={12}>
                <K>end</K>)
              </Line>
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
