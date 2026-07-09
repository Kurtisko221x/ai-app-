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

  return (
    <div className="code-wrap">
      <div className="code-head">
        <span className="code-lang">{lang}</span>
        <button className="copy-btn" onClick={copy} type="button">
          {copied ? "✓ Skopírované" : "Kopírovať"}
        </button>
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
