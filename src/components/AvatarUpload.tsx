"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "./UserAvatar";

// Upload profilovej fotky — obrázok sa zmenší priamo v prehliadači (128px JPEG),
// takže netreba žiadne externé úložisko.
export default function AvatarUpload({
  name,
  avatar,
}: {
  name: string;
  avatar: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState<string | null>(avatar);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function resizeToDataUrl(file: File): Promise<string> {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Neviem načítať obrázok"));
      img.src = url;
    });
    const SIZE = 128;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d")!;
    // orez na štvorec (cover)
    const s = Math.min(img.width, img.height);
    const sx = (img.width - s) / 2;
    const sy = (img.height - s) / 2;
    ctx.drawImage(img, sx, sy, s, s, 0, 0, SIZE, SIZE);
    URL.revokeObjectURL(url);
    return canvas.toDataURL("image/jpeg", 0.85);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const dataUrl = await resizeToDataUrl(file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: dataUrl }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Upload zlyhal");
      }
      setCurrent(dataUrl);
      setMsg("✅ Fotka uložená!");
      router.refresh();
    } catch (e) {
      setMsg("⚠️ " + (e instanceof Error ? e.message : "Chyba"));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    await fetch("/api/profile/avatar", { method: "DELETE" });
    setCurrent(null);
    setMsg(null);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="avatar-upload">
      <button
        type="button"
        className="avatar-upload-btn"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        title="Zmeniť fotku"
      >
        <UserAvatar name={name} avatar={current} size={72} />
        <span className="avatar-upload-overlay">📷</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <div className="avatar-upload-side">
        <button
          className="btn btn-outline sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          type="button"
        >
          {busy ? "..." : current ? "Zmeniť fotku" : "Nahrať fotku"}
        </button>
        {current && (
          <button
            className="btn btn-ghost sm"
            onClick={remove}
            disabled={busy}
            type="button"
          >
            Odstrániť
          </button>
        )}
        {msg && <div className="td-sub">{msg}</div>}
      </div>
    </div>
  );
}
