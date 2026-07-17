"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type FormEvent,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Markdown } from "./Markdown";
import { Avatar, AiAvatar, BrandName } from "./Brand";
import UserAvatar from "./UserAvatar";

type Message = { role: "user" | "assistant"; content: string };
type ChatItem = { id: string; title: string; updatedAt: string };
type OnlineUser = { id: string; name: string; avatar: string | null; me: boolean };

// UI texty chatu (EN/SK)
const CHAT_T = {
  en: {
    suggestions: [
      "Make a door script that opens on touch",
      "How do I make a kills leaderboard?",
      "Create a kill-brick that kills the player on touch",
      "Make a shop GUI where players buy a sword with coins",
    ],
    newChat: "✦ New chat",
    history: "History",
    online: "Online",
    noChats: "No chats yet",
    credits: "credits",
    getMore: "+ Get more",
    account: "Account",
    admin: "🛠️ Admin",
    logout: "↪ Log out",
    welcomeTitle: (n: string) => `Hey ${n}! What are we scripting?`,
    welcomeSub:
      "Describe your game or script in plain words — I'll write the full Luau code and tell you where to put it in Roblox Studio.",
    placeholder: "Describe what you want to script... (Enter = send)",
    outOfCredits: "⚡ You're out of credits!",
    getCredits: "Get credits",
    sendToStudio: "📤 Send to Studio",
    rename: "New conversation name:",
    modalTitle: "⚡ I want free credits",
    modalSub:
      "Tell us why you want credits — the owner reviews it and grants them. (Tip: mention what you're building.)",
    modalPlaceholder: "E.g.: I'm making an obby game and need help with checkpoint scripts...",
    modalSend: "Send request",
    modalSending: "Sending...",
    modalSentTitle: "Request sent!",
    modalSentSub: "The owner (XSkinny) will review your request and grant credits. 🙏",
    modalOk: "Got it",
    modalPromo: "Have a promo code? Redeem it on",
    modalAccount: "your account",
  },
  sk: {
    suggestions: [
      "Sprav mi skript na dvere ktoré sa otvoria po dotyku",
      "Ako spravím leaderboard s bodmi (kills) pre hráčov?",
      "Vytvor kill-brick ktorý zabije hráča pri dotyku",
      "Sprav shop GUI kde si hráč kúpi meč za coiny",
    ],
    newChat: "✦ Nový chat",
    history: "História",
    online: "Online",
    noChats: "Zatiaľ žiadne chaty",
    credits: "kreditov",
    getMore: "+ Získať viac",
    account: "Účet",
    admin: "🛠️ Admin",
    logout: "↪ Odhlásiť",
    welcomeTitle: (n: string) => `Ahoj ${n}! Čo ideme skriptovať?`,
    welcomeSub:
      "Popíš svoju hru alebo skript vlastnými slovami — napíšem ti hotový Luau kód a poviem kam ho v Roblox Studio vložiť.",
    placeholder: "Napíš čo chceš vyskriptovať... (Enter = odoslať)",
    outOfCredits: "⚡ Došli ti kredity!",
    getCredits: "Získať kredity",
    sendToStudio: "📤 Poslať do Studia",
    rename: "Nový názov konverzácie:",
    modalTitle: "⚡ Chcem free kredity",
    modalSub:
      "Napíš prečo chceš kredity — owner to schváli a pridelí ti ich. (Tip: uveď na čom pracuješ.)",
    modalPlaceholder: "Napr.: Robím obby hru a potrebujem pomoc so skriptami na checkpointy...",
    modalSend: "Odoslať žiadosť",
    modalSending: "Odosielam...",
    modalSentTitle: "Žiadosť odoslaná!",
    modalSentSub: "Owner (XSkinny) tvoju žiadosť skontroluje a pridelí kredity. 🙏",
    modalOk: "Rozumiem",
    modalPromo: "Máš promo kód? Zadaj ho na",
    modalAccount: "svojom účte",
  },
};

export default function Chat({
  userName,
  initialCredits,
  isAdmin,
  userAvatar = null,
  lang = "en",
}: {
  userName: string;
  initialCredits: number;
  isAdmin: boolean;
  userAvatar?: string | null;
  lang?: "en" | "sk";
}) {
  const T = CHAT_T[lang];
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState(initialCredits);
  const [outOfCredits, setOutOfCredits] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studioStatus, setStudioStatus] = useState<Record<number, string>>({});

  // modal na free kredity
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [reason, setReason] = useState("");
  const [reqState, setReqState] = useState<"idle" | "sending" | "sent">("idle");
  const [reqError, setReqError] = useState<string | null>(null);

  const [online, setOnline] = useState<OnlineUser[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadChats = useCallback(async () => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      if (Array.isArray(data.chats)) setChats(data.chats);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Prítomnosť: heartbeat + zoznam online používateľov (každú minútu)
  useEffect(() => {
    let stop = false;
    async function tick() {
      try {
        await fetch("/api/presence", { method: "POST" });
        const res = await fetch("/api/presence");
        const data = await res.json();
        if (!stop && Array.isArray(data.users)) setOnline(data.users);
      } catch {
        /* ignore */
      }
    }
    tick();
    const iv = setInterval(tick, 60_000);
    return () => {
      stop = true;
      clearInterval(iv);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function refreshCredits() {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (data.user) setCredits(data.user.credits);
    } catch {
      /* ignore */
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    if (credits <= 0) {
      setOutOfCredits(true);
      return;
    }
    setError(null);
    setMessages((m) => [
      ...m,
      { role: "user", content: trimmed },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: currentChatId, content: trimmed }),
        signal: controller.signal,
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.code === "NO_CREDITS") {
          setOutOfCredits(true);
          setCredits(0);
        }
        throw new Error(data.error ?? `Chyba servera (${res.status})`);
      }

      const newChatId = res.headers.get("X-Chat-Id");
      if (newChatId && newChatId !== currentChatId) setCurrentChatId(newChatId);
      if (!res.body) throw new Error("Prázdna odpoveď zo servera");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      refreshCredits();
      loadChats();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // zastavené
      } else {
        setError(err instanceof Error ? err.message : "Neznáma chyba");
        setMessages((m) => {
          const last = m[m.length - 1];
          if (last?.role === "assistant" && last.content === "")
            return m.slice(0, -1);
          return m;
        });
      }
      refreshCredits();
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function stop() {
    abortRef.current?.abort();
  }

  function newChat() {
    stop();
    setMessages([]);
    setCurrentChatId(null);
    setError(null);
    setSidebarOpen(false);
  }

  async function openChat(id: string) {
    stop();
    setSidebarOpen(false);
    try {
      const res = await fetch(`/api/chats/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.chat.messages ?? []);
      setCurrentChatId(id);
      setError(null);
    } catch {
      /* ignore */
    }
  }

  async function deleteChat(id: string, e: MouseEvent) {
    e.stopPropagation();
    await fetch(`/api/chats/${id}`, { method: "DELETE" });
    if (id === currentChatId) newChat();
    loadChats();
  }

  async function renameChat(id: string, current: string, e: MouseEvent) {
    e.stopPropagation();
    const title = window.prompt(T.rename, current);
    if (!title || !title.trim()) return;
    await fetch(`/api/chats/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    loadChats();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function sendToStudio(index: number, content: string) {
    setStudioStatus((s) => ({ ...s, [index]: "posielam" }));
    try {
      const res = await fetch("/api/studio/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Chyba");
      setStudioStatus((s) => ({
        ...s,
        [index]: `✓ Poslané do Studia (${data.count})`,
      }));
    } catch (err) {
      setStudioStatus((s) => ({
        ...s,
        [index]: "⚠️ " + (err instanceof Error ? err.message : "Chyba"),
      }));
    }
  }

  async function submitCreditRequest() {
    if (reason.trim().length < 5) {
      setReqError("Napíš aspoň krátky dôvod (min. 5 znakov).");
      return;
    }
    setReqState("sending");
    setReqError(null);
    try {
      const res = await fetch("/api/credit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Nepodarilo sa odoslať");
      setReqState("sent");
    } catch (err) {
      setReqState("idle");
      setReqError(err instanceof Error ? err.message : "Chyba");
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link href="/" className="sb-brand">
          <Avatar size={30} />
          <BrandName small />
        </Link>

        <button className="new-chat-btn" onClick={newChat} type="button">
          {T.newChat}
        </button>

        <div className="sb-section-title">{T.history}</div>
        <div className="chat-list">
          {chats.length === 0 && (
            <div className="chat-empty">{T.noChats}</div>
          )}
          {chats.map((c) => (
            <div
              key={c.id}
              className={`chat-item ${c.id === currentChatId ? "active" : ""}`}
              onClick={() => openChat(c.id)}
            >
              <span className="chat-item-title">💬 {c.title}</span>
              <span className="chat-actions">
                <button
                  className="chat-del"
                  onClick={(e) => renameChat(c.id, c.title, e)}
                  title="Premenovať"
                  type="button"
                >
                  ✎
                </button>
                <button
                  className="chat-del"
                  onClick={(e) => deleteChat(c.id, e)}
                  title="Zmazať"
                  type="button"
                >
                  ✕
                </button>
              </span>
            </div>
          ))}
        </div>

        {online.length > 0 && (
          <>
            <div className="sb-section-title">
              <span className="online-dot" /> {T.online} ({online.length})
            </div>
            <div className="online-list">
              {online.map((u) => (
                <div key={u.id} className="online-item" title={u.name}>
                  <UserAvatar name={u.name} avatar={u.avatar} size={22} />
                  <span className="online-name">
                    {u.name}
                    {u.me ? " (ty)" : ""}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="sb-footer">
          <button
            className="credits-btn"
            onClick={() => {
              setShowCreditModal(true);
              setReqState("idle");
              setReason("");
              setReqError(null);
            }}
            type="button"
          >
            <span className={`credits-pill ${credits <= 5 ? "low" : ""}`}>
              ⚡ {credits} {T.credits}
            </span>
            <span className="get-more">{T.getMore}</span>
          </button>

          <div className="sb-links">
            <Link href="/ucet" className="sb-profile">
              <UserAvatar name={userName} avatar={userAvatar} size={22} />{" "}
              {userName}
            </Link>
            {isAdmin && (
              <Link href="/admin" className="admin-link">
                {T.admin}
              </Link>
            )}
            <button onClick={logout} type="button">
              {T.logout}
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="sb-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN */}
      <div className="chat-main">
        <header className="chat-topbar">
          <button
            className="burger"
            onClick={() => setSidebarOpen((v) => !v)}
            type="button"
          >
            ☰
          </button>
          <div className="chat-topbar-brand">
            <Avatar size={26} />
            <BrandName small />
            <span className="scripter-tag">scripter</span>
          </div>
          <span className={`credits-pill ${credits <= 5 ? "low" : ""}`}>
            ⚡ {credits}
          </span>
        </header>

        <div className="messages" ref={scrollRef}>
          {empty ? (
            <div className="welcome">
              <AiAvatar size={72} />
              <h1>{T.welcomeTitle(userName)}</h1>
              <p>{T.welcomeSub}</p>
              <div className="suggestions">
                {T.suggestions.map((s) => (
                  <button
                    key={s}
                    className="suggestion"
                    onClick={() => send(s)}
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className="avatar">
                  {m.role === "user" ? (
                    <UserAvatar name={userName} avatar={userAvatar} size={34} />
                  ) : (
                    <AiAvatar size={34} />
                  )}
                </div>
                <div className="bubble">
                  {m.role === "assistant" ? (
                    m.content ? (
                      <>
                        <Markdown content={m.content} />
                        {m.content.includes("```") &&
                          !(loading && i === messages.length - 1) && (
                            <div className="studio-actions">
                              <button
                                className="studio-btn"
                                onClick={() => sendToStudio(i, m.content)}
                                type="button"
                              >
                                {T.sendToStudio}
                              </button>
                              {studioStatus[i] && (
                                <span className="studio-status">
                                  {studioStatus[i]}
                                </span>
                              )}
                            </div>
                          )}
                      </>
                    ) : (
                      <span className="typing">
                        <span />
                        <span />
                        <span />
                      </span>
                    )
                  ) : (
                    <div className="user-text">{m.content}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {outOfCredits && (
          <div className="credits-banner">
            <span>{T.outOfCredits}</span>
            <button
              className="credits-cta"
              onClick={() => setShowCreditModal(true)}
              type="button"
            >
              {T.getCredits}
            </button>
          </div>
        )}
        {error && !outOfCredits && <div className="error-bar">⚠️ {error}</div>}

        <form className="composer" onSubmit={onSubmit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={T.placeholder}
            rows={1}
            disabled={loading}
          />
          {loading ? (
            <button type="button" className="send-btn stop" onClick={stop}>
              ■
            </button>
          ) : (
            <button type="submit" className="send-btn" disabled={!input.trim()}>
              ➤
            </button>
          )}
        </form>
      </div>

      {/* MODAL: Free kredity */}
      {showCreditModal && (
        <div className="modal-overlay" onClick={() => setShowCreditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowCreditModal(false)}
              type="button"
            >
              ✕
            </button>
            {reqState === "sent" ? (
              <div className="modal-success">
                <div className="big-icon">✅</div>
                <h2>{T.modalSentTitle}</h2>
                <p>{T.modalSentSub}</p>
                <button
                  className="btn btn-primary full"
                  onClick={() => setShowCreditModal(false)}
                  type="button"
                >
                  {T.modalOk}
                </button>
              </div>
            ) : (
              <>
                <h2>{T.modalTitle}</h2>
                <p className="modal-sub">{T.modalSub}</p>
                <textarea
                  className="modal-textarea"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={T.modalPlaceholder}
                  rows={4}
                />
                {reqError && <div className="auth-error">⚠️ {reqError}</div>}
                <button
                  className="btn btn-primary full"
                  onClick={submitCreditRequest}
                  disabled={reqState === "sending"}
                  type="button"
                >
                  {reqState === "sending" ? T.modalSending : T.modalSend}
                </button>
                <p className="modal-note">
                  {T.modalPromo} <Link href="/ucet">{T.modalAccount}</Link>.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
