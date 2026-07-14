"use client";

import { useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { ComponentProps } from "react";

function CodeBlock({ className, children }: ComponentProps<"code">) {
  const [copied, setCopied] = useState(false);
  const text = String(children ?? "");
  const isInline = !className;

  if (isInline) {
    return <code className="inline-code">{children}</code>;
  }

  const lang = /language-(\w+)/.exec(className ?? "")?.[1] ?? "code";

  async function copy() {
    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function download() {
    const isLua = /lua|luau/i.test(lang);
    const ext = isLua ? "lua" : lang === "code" ? "txt" : lang;
    const blob = new Blob([text.replace(/\n$/, "")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xskinny-script.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="code-wrap">
      <div className="code-head">
        <span className="code-lang">{lang}</span>
        <div className="code-actions">
          <button
            className="copy-btn"
            onClick={download}
            type="button"
            title="Stiahnuť do PC"
          >
            ⬇ Stiahnuť
          </button>
          <button className="copy-btn" onClick={copy} type="button">
            {copied ? "✓ Skopírované" : "Kopírovať"}
          </button>
        </div>
      </div>
      <pre>
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

function MarkdownImpl({ content }: { content: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          code: CodeBlock,
          // pre už renderujeme vo vnútri CodeBlock, tu ho len prepustíme
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const Markdown = memo(MarkdownImpl);
