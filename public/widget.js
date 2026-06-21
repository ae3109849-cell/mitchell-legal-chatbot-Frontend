(function () {
  "use strict";

  const BACKEND_URL = "http://localhost:8000";
  const WIDGET_COLOR = "#2d2d2d";
  const BUSINESS_NAME = "Mitchell Legal Consulting";

  function generateSessionId() {
    return "sess_" + Math.random().toString(36).slice(2, 11);
  }

  const sessionId = generateSessionId();
  let messages = [];
  let isOpen = false;
  let isLoading = false;

  // Inject styles
  const style = document.createElement("style");
  style.textContent = `
    #mlc-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: ${WIDGET_COLOR};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      transition: transform 0.15s ease;
    }
    #mlc-widget-btn:hover { transform: scale(1.07); }
    #mlc-widget-btn:active { transform: scale(0.95); }
    #mlc-widget-window {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 380px;
      max-height: 560px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.16);
      display: none;
      flex-direction: column;
      z-index: 99999;
      border: 1px solid #e5e7eb;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #mlc-widget-window.mlc-open { display: flex; }
    #mlc-header {
      background-color: ${WIDGET_COLOR};
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    #mlc-header-text p { margin: 0; }
    #mlc-header-name {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
    }
    #mlc-header-sub {
      color: rgba(255,255,255,0.6);
      font-size: 12px;
    }
    #mlc-close-btn {
      background: none;
      border: none;
      color: rgba(255,255,255,0.7);
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
      padding: 0;
    }
    #mlc-close-btn:hover { color: #fff; }
    #mlc-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      min-height: 0;
    }
    .mlc-bubble-wrap {
      display: flex;
      margin-bottom: 12px;
    }
    .mlc-bubble-wrap.mlc-user { justify-content: flex-end; }
    .mlc-bubble-wrap.mlc-assistant { justify-content: flex-start; }
    .mlc-bubble {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
    }
    .mlc-bubble.mlc-user {
      background-color: ${WIDGET_COLOR};
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .mlc-bubble.mlc-assistant {
      background-color: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }
    #mlc-typing {
      display: none;
      justify-content: flex-start;
      margin-bottom: 12px;
    }
    #mlc-typing.mlc-visible { display: flex; }
    #mlc-typing-inner {
      background-color: #f3f4f6;
      padding: 10px 14px;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .mlc-dot {
      width: 6px;
      height: 6px;
      background-color: #9ca3af;
      border-radius: 50%;
      animation: mlc-bounce 1s infinite;
    }
    .mlc-dot:nth-child(2) { animation-delay: 0.15s; }
    .mlc-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes mlc-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
    }
    #mlc-input-area {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #e5e7eb;
      flex-shrink: 0;
    }
    #mlc-textarea {
      flex: 1;
      resize: none;
      font-size: 14px;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 12px;
      outline: none;
      font-family: inherit;
      line-height: 1.5;
      max-height: 96px;
      overflow-y: auto;
    }
    #mlc-textarea:focus { border-color: ${WIDGET_COLOR}; box-shadow: 0 0 0 2px rgba(45,45,45,0.15); }
    #mlc-send-btn {
      width: 36px;
      height: 36px;
      background-color: ${WIDGET_COLOR};
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    #mlc-send-btn:hover { background-color: #1a1a1a; }
    #mlc-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // Build HTML
  const btn = document.createElement("button");
  btn.id = "mlc-widget-btn";
  btn.setAttribute("aria-label", "Open chat");
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24"><path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clip-rule="evenodd"/></svg>`;

  const win = document.createElement("div");
  win.id = "mlc-widget-window";
  win.innerHTML = `
    <div id="mlc-header">
      <div id="mlc-header-text">
        <p id="mlc-header-name">${BUSINESS_NAME}</p>
        <p id="mlc-header-sub">Ask us anything</p>
      </div>
      <button id="mlc-close-btn" aria-label="Close chat">✕</button>
    </div>
    <div id="mlc-messages">
      <div id="mlc-typing">
        <div id="mlc-typing-inner">
          <div class="mlc-dot"></div>
          <div class="mlc-dot"></div>
          <div class="mlc-dot"></div>
        </div>
      </div>
    </div>
    <div id="mlc-input-area">
      <textarea id="mlc-textarea" placeholder="Type your message..." rows="1"></textarea>
      <button id="mlc-send-btn" aria-label="Send">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/></svg>
      </button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(win);

  const messagesEl = document.getElementById("mlc-messages");
  const typingEl = document.getElementById("mlc-typing");
  const textarea = document.getElementById("mlc-textarea");
  const sendBtn = document.getElementById("mlc-send-btn");

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addBubble(role, content) {
    const wrap = document.createElement("div");
    wrap.className = `mlc-bubble-wrap ${role}`;
    const bubble = document.createElement("div");
    bubble.className = `mlc-bubble ${role}`;
    bubble.textContent = content;
    wrap.appendChild(bubble);
    messagesEl.insertBefore(wrap, typingEl);
    scrollBottom();
  }

  function setLoading(val) {
    isLoading = val;
    sendBtn.disabled = val;
    textarea.disabled = val;
    typingEl.classList.toggle("mlc-visible", val);
    scrollBottom();
  }

  function openWidget() {
    isOpen = true;
    win.classList.add("mlc-open");
    btn.style.display = "none";
    if (messages.length === 0) {
      const greeting = "Hello! I'm here to help you learn about " + BUSINESS_NAME + ". How can I assist you today?";
      messages.push({ role: "assistant", content: greeting });
      addBubble("assistant", greeting);
    }
    textarea.focus();
  }

  function closeWidget() {
    isOpen = false;
    win.classList.remove("mlc-open");
    btn.style.display = "flex";
  }

  async function sendMessage() {
    const text = textarea.value.trim();
    if (!text || isLoading) return;
    textarea.value = "";
    textarea.style.height = "auto";

    messages.push({ role: "user", content: text });
    addBubble("user", text);
    setLoading(true);

    try {
      const res = await fetch(BACKEND_URL + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          session_history: messages.slice(0, -1),
        }),
      });
      const data = await res.json();
      const reply = data.reply || "I don't have that information — please contact us directly.";
      messages.push({ role: "assistant", content: reply });
      addBubble("assistant", reply);
    } catch {
      const err = "I'm having trouble connecting right now. Please try again in a moment.";
      messages.push({ role: "assistant", content: err });
      addBubble("assistant", err);
    } finally {
      setLoading(false);
    }
  }

  btn.addEventListener("click", openWidget);
  document.getElementById("mlc-close-btn").addEventListener("click", closeWidget);
  sendBtn.addEventListener("click", sendMessage);
  textarea.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  textarea.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 96) + "px";
  });
})();