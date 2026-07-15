"use client";

import { useEffect, useRef } from "react";

// Premium efekty: jemný svetelný "glow" kurzor + plávajúce častice v pozadí.
// Rešpektuje prefers-reduced-motion a vypína sa na dotykových zariadeniach.
export default function SiteFx() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || touch) return;

    const glow = glowRef.current;
    if (!glow) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const onDown = () => glow.classList.add("down");
    const onUp = () => glow.classList.remove("down");

    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      glow.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  const glyphs = ["</>", "{ }", "//", "()", "[]", "=>", "::", "🎮", "⚡", "</>", "{ }", "()"];

  return (
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden />
      <div className="fx-particles" aria-hidden>
        {glyphs.map((g, i) => (
          <span
            key={i}
            className="fx-particle"
            style={{
              left: `${(i * 8.3 + 4) % 100}%`,
              animationDelay: `${i * 1.7}s`,
              animationDuration: `${16 + (i % 5) * 4}s`,
              fontSize: `${12 + (i % 4) * 4}px`,
            }}
          >
            {g}
          </span>
        ))}
      </div>
    </>
  );
}
