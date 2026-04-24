// widget.js - ShopBot floating widget

(function () {
  if (document.getElementById('shopbot-root')) return;

  // ============================================================
  // STYLES
  // ============================================================
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700&family=Inter:wght@400;500&display=swap');

    /* ── Themes ── */
    #shopbot-root[data-theme="bright"] {
      --bg:      #f8f8fc;
      --bg2:     #ffffff;
      --bg3:     #eeeef5;
      --border:  rgba(0,0,0,0.08);
      --border2: rgba(0,0,0,0.15);
      --text:    #18181f;
      --text2:   #5a5a78;
      --text3:   #9898b8;
      --accent:  #7c6af7;
      --accent2: #5b4fd4;
      --green:   #059669;
      --red:     #dc2626;
      --yellow:  #d97706;
      --shadow:  0 32px 80px rgba(0,0,0,0.13), 0 0 0 1px rgba(124,106,247,0.13);
    }
    #shopbot-root[data-theme="dark"] {
      --bg:      #0c0c10;
      --bg2:     #141418;
      --bg3:     #1c1c22;
      --border:  rgba(255,255,255,0.07);
      --border2: rgba(255,255,255,0.13);
      --text:    #ededf0;
      --text2:   #8888a0;
      --text3:   #4a4a62;
      --accent:  #7c6af7;
      --accent2: #5b4fd4;
      --green:   #34d399;
      --red:     #f87171;
      --yellow:  #fbbf24;
      --shadow:  0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,106,247,0.1);
    }
    #shopbot-root[data-theme="rose"] {
      --bg:      #fff5f7;
      --bg2:     #ffffff;
      --bg3:     #ffe4ea;
      --border:  rgba(220,80,120,0.12);
      --border2: rgba(220,80,120,0.22);
      --text:    #1a0a10;
      --text2:   #8a4060;
      --text3:   #c090a8;
      --accent:  #e0407a;
      --accent2: #b82d60;
      --green:   #059669;
      --red:     #dc2626;
      --yellow:  #d97706;
      --shadow:  0 32px 80px rgba(220,80,120,0.13), 0 0 0 1px rgba(224,64,122,0.13);
    }
    #shopbot-root[data-theme="midnight"] {
      --bg:      #08081a;
      --bg2:     #0f0f24;
      --bg3:     #16163a;
      --border:  rgba(120,100,255,0.13);
      --border2: rgba(120,100,255,0.22);
      --text:    #e8e8ff;
      --text2:   #8888cc;
      --text3:   #4444aa;
      --accent:  #a78bfa;
      --accent2: #7c5fdc;
      --green:   #34d399;
      --red:     #f87171;
      --yellow:  #fbbf24;
      --shadow:  0 32px 80px rgba(0,0,30,0.85), 0 0 0 1px rgba(167,139,250,0.15);
    }
    #shopbot-root {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: var(--text);
    }
    /* Theme cards in settings */
    .sb-theme-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .sb-theme-card {
      background: var(--bg3); border: 2px solid var(--border);
      border-radius: 8px; padding: 7px 8px;
      cursor: pointer; transition: all 0.18s;
      display: flex; align-items: center; gap: 7px;
    }
    .sb-theme-card:hover { border-color: var(--border2); background: var(--bg2); }
    .sb-theme-card.active { border-color: var(--accent); background: var(--bg2); }
    .sb-theme-card.active .sb-theme-check { opacity: 1; }
    .sb-theme-preview {
      width: 22px; height: 22px; border-radius: 5px; flex-shrink: 0;
    }
    .sb-theme-card[data-t="bright"]   .sb-theme-preview { background: linear-gradient(135deg,#f0f0fa 50%,#ddd8ff 100%); border: 1px solid rgba(0,0,0,0.1); }
    .sb-theme-card[data-t="dark"]     .sb-theme-preview { background: linear-gradient(135deg,#1c1c22 50%,#0c0c10 100%); }
    .sb-theme-card[data-t="rose"]     .sb-theme-preview { background: linear-gradient(135deg,#ffe4ea 50%,#e0407a 100%); border: 1px solid rgba(220,80,120,0.15); }
    .sb-theme-card[data-t="midnight"] .sb-theme-preview { background: linear-gradient(135deg,#16163a 50%,#a78bfa 100%); }
    .sb-theme-info { flex: 1; min-width: 0; }
    .sb-theme-name { font-size: 11px; font-weight: 600; color: var(--text); }
    .sb-theme-desc { font-size: 10px; color: var(--text2); line-height: 1.3; }
    .sb-theme-check { font-size: 11px; color: var(--accent); opacity: 0; transition: opacity 0.15s; flex-shrink: 0; }
    /* 2-col danger buttons */
    .sb-btn-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 7px;
    }

    /* ── FAB ── */
    #sb-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%);
      box-shadow: 0 8px 28px rgba(124,106,247,0.5), 0 2px 8px rgba(0,0,0,0.3);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483646;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s;
      outline: none;
      color: #fff;
      font-size: 22px;
    }
    #sb-fab:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 12px 36px rgba(124,106,247,0.6);
    }
    #sb-fab.open {
      transform: scale(0.9) rotate(45deg);
    }
    #sb-fab-badge {
      position: absolute;
      top: -4px; right: -4px;
      min-width: 18px; height: 18px;
      background: var(--red);
      border-radius: 9px;
      border: 2px solid var(--bg);
      display: none;
      align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; color: #fff;
      font-family: 'Inter', sans-serif;
      padding: 0 4px;
    }
    #sb-fab-close {
      position: absolute;
      top: -7px; left: -7px;
      width: 18px; height: 18px;
      background: var(--bg3);
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.2);
      color: #aaa;
      font-size: 9px;
      display: none;
      align-items: center; justify-content: center;
      cursor: pointer;
      z-index: 2147483647;
      line-height: 1;
    }
    #shopbot-root:hover #sb-fab-close { display: flex; }
    #sb-fab-close:hover { background: #f87171; color: #fff; border-color: #f87171; }

    /* ── Panel ── */
    #sb-panel {
      position: fixed;
      bottom: 88px;
      right: 24px;
      width: 400px;
      height: 568px;
      background: var(--bg);
      border-radius: 18px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow, 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,106,247,0.1));
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483645;
      transform: scale(0.88) translateY(16px);
      opacity: 0;
      pointer-events: none;
      transform-origin: bottom right;
      transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), opacity 0.22s ease;
    }
    #sb-panel.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    /* ── Header ── */
    .sb-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      background: var(--bg2);
      flex-shrink: 0;
    }
    .sb-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sb-logo-icon {
      width: 28px; height: 28px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .sb-logo-name {
      font-family: 'Syne', sans-serif;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: var(--text);
    }
    .sb-header-btn {
      width: 28px; height: 28px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 7px;
      cursor: pointer;
      color: var(--text2);
      font-size: 15px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .sb-header-btn:hover { background: var(--bg3); color: var(--text); border-color: var(--border2); }

    /* ── Tabs ── */
    .sb-tabs {
      display: flex;
      border-bottom: 1px solid var(--border);
      background: var(--bg2);
      flex-shrink: 0;
    }
    .sb-tab {
      flex: 1; padding: 9px 6px;
      text-align: center;
      font-size: 11.5px; font-weight: 500;
      cursor: pointer; color: var(--text2);
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
      user-select: none;
    }
    .sb-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
    .sb-tab:hover:not(.active) { color: var(--text); background: var(--bg3); }
    .sb-tab-badge {
      display: inline-flex;
      align-items: center; justify-content: center;
      width: 16px; height: 16px;
      background: var(--accent);
      border-radius: 50%;
      font-size: 10px; font-weight: 700;
      color: #fff;
      margin-left: 4px;
      vertical-align: middle;
    }

    /* ── Views ── */
    .sb-view { display: none; flex: 1; flex-direction: column; overflow: hidden; min-height: 0; }
    .sb-view.active { display: flex; }

    /* ── Capture View ── */
    .sb-capture-top {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .sb-page-card {
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 10px;
    }
    .sb-platform-row {
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 4px;
    }
    .sb-badge {
      padding: 2px 7px; border-radius: 4px;
      font-size: 10px; font-weight: 600;
    }
    .sb-badge-shopee { background: rgba(238,77,45,0.18); color: #ff6b47; }
    .sb-badge-lazada { background: rgba(0,102,255,0.18); color: #4d8eff; }
    .sb-badge-tiki   { background: rgba(0,134,255,0.18); color: #33a8ff; }
    .sb-badge-other  { background: rgba(120,120,140,0.18); color: var(--text2); }
    .sb-page-title {
      font-size: 12.5px; font-weight: 500; color: var(--text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .sb-btn-capture {
      width: 100%; padding: 10px;
      background: var(--accent);
      border: none; border-radius: 10px;
      color: #fff; font-size: 13px; font-weight: 600;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      transition: all 0.15s;
      font-family: 'Inter', sans-serif;
    }
    .sb-btn-capture:hover:not(:disabled) { background: var(--accent2); }
    .sb-btn-capture:disabled { opacity: 0.4; cursor: not-allowed; }

    .sb-progress { margin-top: 10px; display: none; }
    .sb-progress-track {
      height: 3px; background: var(--bg3);
      border-radius: 2px; overflow: hidden; margin-bottom: 6px;
    }
    .sb-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), #a78bfa);
      border-radius: 2px; transition: width 0.3s ease; width: 0%;
    }
    .sb-progress-text { font-size: 11px; color: var(--text2); text-align: center; }

    .sb-slots-header {
      padding: 10px 14px 6px;
      font-size: 11px; color: var(--text3);
      text-transform: uppercase; letter-spacing: 0.5px;
      flex-shrink: 0;
    }
    .sb-slots-list { flex: 1; overflow-y: auto; padding: 0 14px 12px; }

    .sb-slot-item {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: 10px; padding: 10px 12px;
      margin-bottom: 8px; display: flex; gap: 10px; align-items: flex-start;
      transition: border-color 0.15s;
    }
    .sb-slot-item:hover { border-color: var(--border2); }
    .sb-slot-thumb {
      width: 44px; height: 44px; border-radius: 6px;
      object-fit: cover; background: var(--bg3);
      flex-shrink: 0; border: 1px solid var(--border); cursor: pointer;
    }
    .sb-slot-thumb-ph {
      width: 44px; height: 44px; border-radius: 6px;
      background: var(--bg3); flex-shrink: 0;
      border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: var(--text3);
    }
    .sb-slot-info { flex: 1; min-width: 0; }
    .sb-slot-name {
      font-size: 12px; font-weight: 500; color: var(--text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px;
    }
    .sb-slot-meta { font-size: 11px; color: var(--text2); }
    .sb-slot-price { color: var(--yellow); font-weight: 500; }
    .sb-slot-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .sb-slot-btn {
      width: 24px; height: 24px; background: transparent;
      border: 1px solid var(--border); border-radius: 5px;
      cursor: pointer; color: var(--text2); font-size: 12px;
      display: flex; align-items: center; justify-content: center; transition: all 0.15s;
    }
    .sb-slot-btn:hover { background: var(--bg3); color: var(--text); }
    .sb-slot-btn.del:hover { border-color: var(--red); color: var(--red); }
    .sb-empty {
      text-align: center; padding: 28px 0;
      color: var(--text3); font-size: 12px; line-height: 1.8;
    }
    .sb-empty-icon { font-size: 30px; margin-bottom: 8px; }

    /* ── Chat View ── */
    .sb-messages {
      flex: 1; overflow-y: auto; padding: 12px 14px;
      display: flex; flex-direction: column; gap: 10px; min-height: 0;
    }
    .sb-msg { display: flex; gap: 8px; align-items: flex-start; }
    .sb-msg.user { flex-direction: row-reverse; }
    .sb-avatar {
      width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700;
    }
    .sb-avatar.bot { background: linear-gradient(135deg, var(--accent), #a78bfa); color: #fff; }
    .sb-avatar.usr { background: var(--bg3); border: 1px solid var(--border); color: var(--text2); }
    .sb-bubble {
      max-width: 80%; padding: 8px 11px;
      border-radius: 10px; font-size: 12.5px; line-height: 1.55;
    }
    .sb-msg.bot .sb-bubble {
      background: var(--bg2); border: 1px solid var(--border);
      border-top-left-radius: 3px; color: var(--text);
    }
    .sb-msg.user .sb-bubble {
      background: var(--accent); color: #fff; border-top-right-radius: 3px;
    }
    .sb-typing {
      display: flex; gap: 4px; padding: 9px 12px;
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 10px; border-top-left-radius: 3px; width: fit-content;
    }
    .sb-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--text3); animation: sbdot 1.2s infinite;
    }
    .sb-dot:nth-child(2) { animation-delay: 0.2s; }
    .sb-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes sbdot { 0%,80%,100%{opacity:0.3} 40%{opacity:1} }

    .sb-quick-btns {
      padding: 8px 14px 0; display: flex; gap: 6px;
      flex-wrap: wrap; flex-shrink: 0;
    }
    .sb-quick-btn {
      padding: 5px 10px;
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 16px; cursor: pointer;
      font-size: 11px; color: var(--text2);
      transition: all 0.15s; white-space: nowrap;
      font-family: 'Inter', sans-serif;
    }
    .sb-quick-btn:hover { background: var(--bg3); color: var(--text); border-color: var(--border2); }

    .sb-input-area {
      padding: 10px 14px 12px;
      border-top: 1px solid var(--border);
      display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0;
    }
    .sb-input {
      flex: 1; background: var(--bg2); border: 1px solid var(--border);
      border-radius: 10px; padding: 8px 12px;
      color: var(--text); font-size: 13px; resize: none;
      outline: none; font-family: 'Inter', sans-serif;
      line-height: 1.4; max-height: 80px; transition: border-color 0.15s;
    }
    .sb-input:focus { border-color: var(--accent); }
    .sb-input::placeholder { color: var(--text3); }
    .sb-send {
      width: 34px; height: 34px;
      background: var(--accent); border: none; border-radius: 8px;
      cursor: pointer; color: #fff; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; flex-shrink: 0;
    }
    .sb-send:hover:not(:disabled) { background: var(--accent2); }
    .sb-send:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ── Settings View ── */
    .sb-settings { padding: 10px 14px; flex: 1; overflow-y: auto; }
    .sb-settings-section { margin-bottom: 12px; }
    .sb-settings-label {
      font-size: 10px; color: var(--text3);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
    }
    .sb-select {
      width: 100%; background: var(--bg2); border: 1px solid var(--border);
      border-radius: 10px; padding: 8px 12px;
      color: var(--text); font-size: 13px; outline: none;
      font-family: 'Inter', sans-serif; cursor: pointer; transition: border-color 0.15s;
    }
    .sb-select:focus { border-color: var(--accent); }
    .sb-select option { background: var(--bg2); }
    .sb-btn-danger {
      width: 100%; padding: 8px; background: transparent;
      border: 1px solid rgba(248,113,113,0.28); border-radius: 10px;
      color: var(--red); font-size: 12px; cursor: pointer;
      transition: all 0.15s; font-family: 'Inter', sans-serif;
    }
    .sb-btn-danger:hover { background: rgba(248,113,113,0.08); }
    .sb-btn-dev {
      width: 100%; padding: 8px; background: transparent;
      border: 1px solid rgba(167,139,250,0.28); border-radius: 10px;
      color: #a78bfa; font-size: 12px; cursor: pointer; margin-top: 6px;
      transition: all 0.15s; font-family: 'Inter', sans-serif;
    }
    .sb-btn-dev:hover { background: rgba(167,139,250,0.08); }
    .sb-support-info {
      font-size: 11.5px; color: var(--text2); line-height: 1.7;
    }

    /* ── Preview overlay ── */
    #sb-preview {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.88);
      display: none; align-items: center; justify-content: center;
      z-index: 2147483647; padding: 24px;
    }
    #sb-preview.show { display: flex; }
    #sb-preview img { max-width: 100%; max-height: 100%; border-radius: 10px; object-fit: contain; }
    #sb-preview-close {
      position: absolute; top: 14px; right: 14px;
      width: 32px; height: 32px;
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 50%; cursor: pointer; color: #fff; font-size: 15px;
      display: flex; align-items: center; justify-content: center;
    }

    /* Scrollbar */
    #shopbot-root ::-webkit-scrollbar { width: 3px; }
    #shopbot-root ::-webkit-scrollbar-track { background: transparent; }
    #shopbot-root ::-webkit-scrollbar-thumb { background: var(--bg3); border-radius: 2px; }
  `;
  document.head.appendChild(style);

  // ============================================================
  // HTML
  // ============================================================
  const root = document.createElement('div');
  root.id = 'shopbot-root';
  root.setAttribute('data-theme', 'bright');
  root.innerHTML = `
    <button id="sb-fab" title="ShopBot AI">
     <img src="data:image/jpeg;base64,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" style="width:36px;height:36px;border-radius:10px;display:block;object-fit:cover;">
      <div id="sb-fab-badge"></div>
      <div id="sb-fab-close" title="Ẩn ShopBot">✕</div>
    </button>

    <div id="sb-panel">
      <!-- Header -->
      <div class="sb-header">
        <div class="sb-logo">
<div class="sb-logo-icon"><img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAQABAsDASIAAhEBAxEB/8QAHQABAQEBAAMBAQEAAAAAAAAAAAIBAwQFBgcICf/EAFQQAQABAwIDBQMIBAYOCQUBAAABAgMRBCEFMUEGElFhgQdxkQgTFSIyU6GxUnLB0RQjQmKSshYkMzdDVFVjc3SFs8LhFyU0NUVkgvDxJ0R1g5Oi/8QAGwEBAAMBAQEBAAAAAAAAAAAAAAECAwQFBgf/xAAvEQEAAgIBBAEDAwQCAgMAAAAAAQIDEQQFEiExURMUQSIycQYVIzQzYYGhJEKR/9oADAMBAAIRAxEAPwD+M6ubUqASKASoAAAAAABm/NoAMloAyWgDOrQGbtAGbtGQBu0AZu0AAAAAAZANAAAAAAABmWgDIaAAAM9WgAAAAAADN2gAMy0AAAAAAAAAAGQ0AAAAABktAGS0AAGerRnUGgADJaAAAAAAAAAAAAAAAMkgDq0AGS0ABkA0ZLQGdWgM9WgAAAAAAAAAADOrWS0AAGdWpUAAAAAAAyWgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMhoAMy0AAAAAAAAAAAAAZLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQDQAAAAAAAAAAAAAAAAAAAZ1ayebQSoAAAAAAAAAAAAAZu0AGZaAAAAAAAAAAAAAMloAAAAAAAAAAAACVAAAAAAAAAAAAAAzLQAAAAASoAAAAAAGQ0AAAAAAAAAAAAAAAAAASCgAAAGZaAAAAAAAAAAAAAAAlQAAAAAAAAAAAAAAbgzq1nVoAAAAJUAJUAAAAAAAAAAAAAAM3BoAAAAAAAJUAAAAAAAAAAAAAAAJUAAAAAAAMhoAAAAAAAAAAADJx0aDIaAJUAAAAAAAAAAAAADOTQAAAAAAAAAAAAAAAAAGQDQAAAAAAZAMUAAAAAJUAAAJUAAAMhu4Azq1lXNoAADOTQAZLQSoABmzQBno0AAAAAAGQ0ABno0AAAAAAAAAAAAAGQDQ2AZDQAAAAAAAGbNAGS0AAAZ6NAZlu3gyAazLQGdWgAAAM9GxzAGbNAAAAABn4g1mTZoDMk46Q0AAAAAAGQ1mzQAASoASoAAAAAZDWS0AAAGQDQABno0AAAAAAAZ1aAM9GgAAAADJw0AZPuaAAAADIaAM6tZVzaAAAAAAADMeYENZLQAAAAAAAZ6g0AAAAAAGY8waM2aAyWgAAAMgGjNmgAAAAAyAIaMwDQZgGgAAAAADNj1BoAAADMtAAZEA0GeoNZloADIBoAMhozANZ1NjANZLQAAAAAZs0AAAAAAAGY8waM28TAEtSAoAAAAZOGgyGgAAAAAMloMw1mGgDJaAACVAAAAzkbNAABKgAAAABnVrKubQSoAAASoABktAABKgAAAAAAAAAABkNAAAAAAAAAAZ1ybg0AAZs0AAAGQDRnVoAAAAJUAAM3BoAAAJFAAAAAAyWglQAAAAAAAAAAAlQyAaAAAAAADIBoAAAAJAUAJUAAAAAAAAAAAAAAAJUAJUlQAAMhoAAkBQAlTJaDIaAMhoAzq1nVoJUAAAAAAyWglQAAAAAAAAAAADNmgAAlQzAMUAJFAJUAAAJUAJUAJUAAAJUAJUMwDFACVACVACVACVACVAAM5NAAAABKgAAAABKhmAYoASoAAAAZuDQASoASoAAZANAAAAABKgABmAaACVAAAAAAACVDMAxQAlQAAACVAlSVAlSVAAAAAyGgDOrWS0AZLQSoASoASoABno0GQ0ABktAAAAABkfEGjNmgDJaCVDIBihkA0AAZLQEqASKAZDRmAYpmzQAASKASoABmzcxkGeRlsczqAJUAAAycY5HPmU8wMbEe465InYGgz0BgoBLfVjY5YBoAM67nRoAlQAADMEEtBnVrOTQGZ3aAkUAlQAAAAAAAAAAAAADOrQAAEqAEqZgCGjIBoAJUAJFAAzYwBDQAABIKBIKBKgAGbNAAABmAOrWVc2gAAlQAyGgAAAAAzLQAGQDQAZB6NAZs0AZs0AAAZDRkA0ZtkwDQAAAAAGbHmdQaAAzLQAAEqGbgbNAAZLQBKgSoAAZ6g1m3g1nqBs0ABIChKgAAAAAASpKgAZgCGgAAAACVDIBoyWgzDWThoMhrJaAAAADIaAAAAzq0AAAZ0aAGAGQ0AAAAAZDRmAOps0BnVrJIBigBKgAZs0AGS0BmWgAAMhoYBlXNrKubQAASoAAABktAAAABKgBmGs6tBmGgAACVAAAAMmGgzfxaAAAJUAMhozcGgAMloAADIaAAMgGgAAAluWKBkNAGY3aAAJAUlQJUlQJUAMw0ABnVoJUlQJUAMwerQGYaAAAJUMgCGjNwNzfxaADJaCVACVAAADPVoAAAAAAAM3aAzfxPVoAAAAAMkgGs3PNoAAAAJUAMhoAzDWdWgCVAAAAARzABlXNrKubQAABKgAAAASoASKAZDQAAASoBKgBKgAABkNAEqAEqAEqAGQ0ASoASoASoASoZuDWZaAlSVAlSQBSVAAACVAlSQBSQBQAAAlQAlSQBSVAlQAAAlSVAlSVAlSVAAACVAlSW4BigAAAAAAASoBKgBkHJoAAAAAAAAAAAAAACVAAAAACVACVJUAADIaAMhoZBnVrKubAFAAAAACVACVAAAAAAACVJUCRQAAAACVACQUCVACVACVAAlQCRQCVAAACVACQAAUCVJUCQAAUCRSQBQCVACQUCQAFACVACVACQUCVJbgGKAAAEqSoEqSoEqSoEqAGQ0AAAAASKZAMUz0aAAAACVAAAAAAAAJUAAAACVACVACVMloJUAJUAAAMhoAzq1lXNoAAAACVAJUAAM9Qazk0AABKgBKhmAazkbHqDRnVoAAJUMiAaDIgCnm0ABktBKgBKhmAaMweoNAAEqBKkqBKmY82gAzANGS0EikgKAEqZs0AA0JUkToFJDQKA0JUzDUAACVACVAAM2aDIaAAAJUAJUAAAMiGgAACRQAMweoENZseoNAAAABkA1nVrMA0Zt4tAGS0EqAEqGeoNAAAAABKgABmPMGgzANAAAAABnVrKubQAASoAAAZDRm4G7WT7mgAAAAAzEg0ZuYkGjJaAACVAAM8zcGgzcGgAlQAAzEgQ0ZuDQABktBKgABm4NGbm4NAAAAAAGYmWxHinQERLcNiJnktECYpbjDYjxatFRODHkrBELdgzDFzEzJiYOwTDMc+S+7PgzfwV7ZEYO6uYnqyYk7ZETDWkxCswIG4YroUDN0DRnobg0AAAEqGREg0ZuYkGjN/BoAAJUMgGgzEg0Zubg0AAZJAMUAAzfwNwaDNwaAAACVDMSBDRm4NBm4NBICmS0AGbg0Gbg0AAAGQ0AAZgDq1lXNgKABKgBKgBkNAAAEqAAAAAAAASoEqAAAAZloAAAAJUAAAAAJUlQJUAJUlQAAJUAJUAJBSdARBEYbzWiA6Yb4HVURn3rxQZENjOeqop6yqIa1qnSO7OebYpX3dsqilpGNaKufdzygxvnDrFPk2mnfkt9NPa5YMeTr3N+U4JoxHgfSNOOPI7uemHbuz8GVU7H0ztce75pmmcO00pmJUmiO1ynzZiM+DpNOY5JmlnNFdIJhWMMwzmqETEw1s+TJhnMCVJFQBQJUADMtABnVoAAJUlQJUADMtZANZk9zQAASpKgAAAAAASoAAZANAAZuS0AAEqAEt5NAZ1aAAAJUAJUAAAMhoAyrm1lXNoAAAAJUAJUAJUlQAAAAAAJUAJUAJUADMtASoASKASoASoAAASpKgSCgSoAGZaACQAUyAakAbjdURhkRhvNeI2Co8hdMRDatUxDKaVRHgqKV00t60XiExSqKfFUUvYcL4TruI193S2KqqYneudqY98ummGZnwv2vXxS6W7VVyqKbdNVVU8opjMvueFdjdJaiK9fdq1FX6FH1af3z+D6XRaPSaOjuaXT2rMfzKcT8Xfj4Fp9rRV+aaTs7xnUxFVvQXojxr+pH4vZWOxHFq4ibleltZ6TXMz+EP0Kmd93SnxdccCke09r4SnsFrJj62v00e6mqU3OwPEYj+L1ukq9/ej9j7+mXSicp+0xrdkPy/Vdi+PWaZmnT2r0f5u7H7cPTa3h2u0c41ekv2POuiYj4v2ulfzcV0zTVEVRO0xMZiWVuBWfUn034PNKJpfsfFOyXBeIZmdL/B7k/wAux9X8OU/B8fxvsHxXRRVe0WNfZjfFEYuRH6vX0y48vDtVSaS+Kqp8ETEvKuW5pqmmqJiYnExPRzqpcV8akw4TCKod6qUTEOe1FJhxxli6o6pljaqukzzStMwymEMUlSglQAyGgCRQCQAFJUAACVJAAAAUCVAAzLQAEgCgEqAAAAAEigEigEqAEqAAAEgoEqSoGQ0AZDQAABlXNrKubQAZgGgAlQAlu7QBmWsgGgAAAAAAAlQzANAAAAABKgBKmS0AAEqAEqAEqAAZs0EqAEqSoEqAEqiOo3G2y0QHlDYI8F0w2rVMNpp6rpgphdMOmlF4gpjZ1tUVV1xTRE1VTOIiIzMq09m5fvUWbNFVddU4ppjq+87OcEtcOpi9diLmqmN6ulHlH73ocfjzeWkQ8HgHZamKadRxKMzzizE/1p/Y+usUUW7dNu3RTRRTtFNMYiPRzo5OtudntY8NaRqGkQ6U81080U+/Z6riXaXhWgmaPnZ1FyP5FrfHvnkm14r7NvcxzdKZ3fn2u7Z665VMaWza09PSZ+vV+78HqNRx/i96fr8Q1Huoq7sfgwtzaQibQ/W6YnHJVMYnd+MzxHXVTvrdTM/6Wr97ra4vxOzObfENVT/+2Wf3tfhMXfstM7O1GX5Pou2HG9NMd7UUaimOl2iJ/GMS+l4T290dyYp4jpa9PPWu3Pfp+HOPxaV5VLLReH3FMZmHkUTNPLm8Hhut0mus/PaPUW79HjROce+OjzYnHNrvaz0vafspwzjluq7cojT6z+TftxvP60fyvzflHaHgWv4JqvmdZaxTVn5u7TvRXHlP7Ob9xmqfF43EtFpuJaWvS6y1Tes1xvTP5x4T5ubNxq3jce1bUifT8Aqpy51Uvqu2nZfU8Dv/AD1vvXtFXOKLsxvTP6NXn59XzNVPg8jLims6lhaNPHqhzqjDyKqXOYcd6s5hxnxZOZXMYZyc9oUcxVUDKYABAlQAkUAlQzAMUAAAJUAJUAJUAMhoAlQyAYoAAAGcmgAAAAJUAJUAAAAAJUlQJUlsQDFAAAAAAADKubWVc2gAAAAlQAlQzAHqSejQZu0AAAAAAAGciWgAAyGgCVDIBrOTdwGYaAAAJUMwDQZuBg3aAAAlSVAlQyAaAmAj7KoY3DSsCqYzLpEdE0xs6Uw6aVXiG00+TtRRNdUU0xMzM4iIjmmmH1nY3hkf943qM9LMT+NT0ePh7500iHsezfCKOH2Iu3aYnU1x9af0I8Ie6p8E081Rye3jpFI1C7pT73icW4vpeGWe/frzXV9i3T9qr90ebwu0HGaOG2oooiK9TXH1Kekecvg9VqL2ovVX79yblyqd5lhn5UU8R7RMvacZ7Qa/iUzRVc+ZsT/grc4j1nq9PMpmUTU8vJlm07mVZlc1MmrdzmpMz5sJyI2697zO95uXeO95q/URt3irbm2KnDvKpqWjInuedoNdqtDqI1Gj1FyxdjlVROP/AJfofZjt5avzRpONRTZuco1FMYon9aOnv5e5+YxOVRLpxci1J8LRaYf0HRNNdMTTVFVMxmJicxMOtMbPyXsR2tu8JuU6PW1VXNBVOInnNmfGPLy+D9Z01yi9aou266a6K4iaaqZzEx4w9THljJHhvW226jS2Nbprmm1Vmm5ZuU92uirlMPxntx2bvdnuJdymKrmju5nT3Z6x1pnzh+326dnj8d4TpON8IvcO1MREV70V43t1xyqhTPijJCLV2/nOuHOqHsuL6HUcN4lf0Opo7t6zXNFUftjy6vArjd4mWmpc9ocKo5ueHaY3c6oxPJx2hlMImGKnmmqN2EwhKkjMFJbANABmGsloAAJUAJUAMg9WmAZjzaAAAAAAzzaDMNAAAGdWgAACW4OrQZ6tAGQ1ktAGbNBKgABm4NAAABkNAGQ0ABlXNoAAJUAAAAAMgy0AAABkAQ0AZubtZkGgAAAAyAIaAAzJuDQABKgAAZBlrNwazkZaCVJAFADIN+bWQB6NjmEc1oGx9pVMdWRyXRDekJhdLrTCKYdaYdmOrSry+FaSrW661p6doqn60+FPWX6LYt0WrVNu3T3aKY7tMeEQ+c7F6SKLFzWVR9a5Pco90c/x/J9JTL3eJj7a7aQ6U83h8Z4hb4boqr9URVXO1un9Kr9zzImIjOYjbd8B2k4jPEOIVVUz/E2/q248vH1bcjL9Ov8A2mXg6rUXdTqK796uarlc5qmXj1VY3bVLnVVvzeHkvtSZZNUzyRMlUoqlyWupMqmfGUzVHiiZyxjN1dune8zvOeZbnyV70bXFSoqcstiqY6rxc7neKvBdMuET4OlMtqWaRLyKZfeezLtNOk1VHBtbc/tW7VixXVP9zrnp7p/CXwFM56ulM45O7Dkms7hes6f0lG0Y8GTXETs+Y7AcdnjPAqPn7ne1Wm/i73jV+jV6x+MS+gznk9ik90bh0x6fA+2HhHz1i1xuzR9e3MWr+I50/wAmfSdvWH5fVGz+heKaWzreH39HfjNq9RNFXunq/AuI6W7otbf0d6MXLNyaKvfEvO5uLtnbDJXy8OqM9HGrk71xLlVDyL1YzDlOfBNXJc80uW0M0KSMpFMhogGZ8ms6g0AEqAEqAAAAZloAAJUlQAAAMyDWZaAAkFAAAAyGjMyDQABktBKgAZ6NZAG7Rm4NAAAAAAAAABKgBKgAAAAAAAABkNAAAAAEqAAAAAAAASAKSoEqSoGQ0AAASpKgSpKgSpLcg1ky1kRlOgjdRGzYXrA2IzLpTCKY3dKYdNIWiHSiHaiiaqopiMzO0OdEbPZcAs/PcW09ExtFXen03d+Cm5iGsQ+24fYp0ujtaen+RTEevV5NM4RCqXv1jUahaHre0+u/gnCaqaJxcvT3KfKOs/D83wtXJ7ztjqJucTpsRP1bVGPWd/3PRV8nl8rJNrEoqlyqXW51cnm5JZyiqXNdaJ5Q5LyzkZMtnkhhKFd6TvCUbF8yOeE0qWiRdM4l0p8HJ0p6OikrVdaZdaXGjm60OzHLWH1Ps84pVw7tDat1VYs6r+Jrjpmfsz8fzl+xWvsbv56t1VUV010ziqmcxPWJfvfCNZGt4XpdZE/3a1TX6zG/4vZ4VtxMN8cu92cxMPyj2raD+D8eo1dNOKdVbiqf1qdp/DD9VqnwfHe1fSfPdnbWqiPrae/G/lVGJ/HDfl4+7HKbxuH5RXDlU71Rs41Q+dyVc0w41wjq61Q5zDjvDKUzA33pmGEwholSugEiAUkAUAJUAAAJUlQJUkAUlQMhoAAAJUAkFAlQAAAyGiQFAAACVAAACVJAFACVJUAADI82gDKubWVc2glQAlQAAAAAlQAyGgAAAACRQCVAAAAACVACVACVACVACVJUCQUCVCQBuMtiFogZENx4tbiVogZiCG4buvFRmGxu2KVRHkvWqYhtMYdKY3ZTEulMejppVpEKojZ77shbiriNdc/yLU/jL0kRiH0HY2MXtRP8yn83pcWP1w0h9RHNccnOnm6U5zHvezJD4Djlz53i2quT1uTHw2/Y8Gp5Gt31d6fGur83Cfc8TL7klyr5OU83arwc5jdw3hSXKvmiXWqEVUua1WcwnDJiFYmGY8mU1VTiG4huPIx5I7BjY8W4nwbFPktFBlMTLpDIjC6Y8W1YXiF083SlFMOtPvdVIaQul+vezi/N7slpqZnM2qq7fwqzH5vyGmH6l7Jqs9n71P6Opq/q0vV4X72uP2+vop3zL0/bu1F7sjxGjrTaiv4VRP7Hunru0sd/s7xGmY2nS3P6svUyRuktpjw/Cqocqodqonwc6ofNZauWXCYc6o3d6qUTDivVnMOMxOWOs0omGNqKTCdmd1WPIwp2oRMNVv4Mn3KzUQNn3MU0ChkIGgAlQAlQAlSVAlQAlTJaCVACVACVDIBozZoJUAJUz0aCVJUCVADIaAJUAJUlQJUlQJUAMhoAz3tAGVc2skgGgAAAlQAlQADJ9xESDQAAAAASoZiQaAAAAACVACVDNwaAAACVACVACWxGSFR4LRAcoMS2GxEtYqEeTYhUUqiGtaJiERSqIXFKopaxRftc4hUUukUqiGlcaYhlNC6YbFLceTelNLxDYjo9/wBkNr2o/Vp/OXoojD3nZTa9f/Vj83dx41eFn00TsumeThTLrRVmeb01X59qf7vc/Xn83GY8nkaj+73P1p/NyqjweRkr5Wlyqjdzqh3mJlMw5LVUmHjzHgyacu00+DIpYzjV04907sOs0+RNKv0ztccR4GHbuwd1H0kacsNxLp3PJvcnwTGNOnOKZVFK4o8lRS1rRMQymFxtsRCqaW9KLxCqMxD9O9k044Fqv9Z/4YfmcQ/SvZTmOB6r/WP+GHo8ONXa09vsJq8HhcenPA9fH/lrn9WXlZ33l4fHJzwfXR/5e5/Vl6l/2y1n0/EeeEVQ7YRMS+evVzTDjNLnVS8iaUTT4uW+NSYcJjZMw7zSmafBjONWYcZphM0u007JmGc0V04zGOjMOs0pqpxuymqsw5smPBfkyWMxpCQmBSYABAlQAlQzANBm4NABKkqBKgABkA1mTBuDQASoASoZiQaMmPJoAz0OoNABKkqBLctZuDRm7QAAAAZDQwAMq5tAAAAAABkNZ1aAyWsgGgAAADJw0GQejQAZloAyWglQAAAyGsyZBoAJUlQJUAAMjdMCoIBpWBURldNJTDpEZdNKrRDIh0t26qpiKaZqmekRmXl8M0Nesvd2n6tEfaq8H0+j0ljS0RTZoiPGrrL1OLwLZfM+IaRD5i3w3W1RmNNc9Yw6RwvXf4rcfWNidnpx0unytp8nHC9d/itxf0Vr9v7Vufg+rh0onZaOm0+UxD5KOE8Q/wAVufgm/wAP1di1N29YrooicTMvs6ZeB2jnPCa/1qfzL8KlKzMLRD5R7nsxtev+dMfm9M9x2b2u3vdDmxR+uC3p9BTLpRO7x6Z2dKat3eo+LvRHz1f60/my1aru3KbVuia665iKYjrMtu/3av8AWl5HCP8AvXS4++o/OHn9vdbTV0q4Bxf/ABG7+H70TwHi/wDiF78H6LM5yUxEw9H+10n8n04fnX0Bxef/ALC7+DP7H+L5/wCwXvwfo9MZlcH9px/KYxQ/Nf7HuMf5Pvfg3+x3jP8Ak67+H736XETh0j7J/aMfyn6MfL8zjs3xqf8Aw+7+H7z+xrjf+Tr/AMI/e/UKcYdKU/2enyn6EPyv+xrjn+Tb/wAII7M8c/ybf+EP1enkqnpuf2enyfRh+Ux2X47/AJMvfh+9kdl+Pf5Nv/g/Wqd53dIiPJMdIx/JGCH5JT2W49n/ALtv/h+94/EuE8Q4bFuddpLliLkzFE1Y3xzfs1D4z2sR/a3Dp69+5+VLPP06mLHNolNsURG3wL9G9lk/9S6mP/Mf8MPzrG2z9E9l+3BtT/rH/DDm4lf8ilX1/e3eHxmf+qNbt/8Ab3P6svJ9Xi8Y/wC6dZ/q9z+rL1L0ntlpL8Yx9V5HDuH6ziWsp0mh09d+/VEzTRRzmIjMuPR9Z7J8f2aabx+bu/1JePTFF76ZxXcvWVdjO08TvwXU/h+9M9jO08f+Dan4R+9++VU56Q41UvQ/tmOfy0jBHy/B57Gdpv8AI+p+EfvP7Cu08/8Ag+p+EfvfvFFOZ6OtNMQiek4/lP28PwCrsV2oj/wbU/h+96riXCeI8Or7uv0Oo00zy+dtzTE+6er+lO7CL9i1fs1Wb9qi7bqjFVFcRVTPviWOTpFJjxKs8aPxL+Xqo8kTEv1v2g+z6xRprnFOBWpomiJqu6WN4mOs0fu+Hg/KKo3eFyuJbBbVnNfHNJ1LhVDm71R0c6ow8+1WExpE7sVPNNTnmEJUkUGw0AAAAAAASoZANBkA0ZloDMtAAAAZAENZsZBoAAAJUlQMhoAM6mWgAAAAAAAAyrm1lXNoAAJUAAADMtAGZaAlSVAAyAIaADMktAAAAAGbNAZloAzLQEgoEgoBmcNAZltIRmIWqKjmqnmmOS6Ib0hMLph1ppmcJow8vh1EXNZZpmNpqjLuwY+6YhpEPo+GWI02looxvMZq97zqZieThHNVNU0zl9bjpFKxELu081RyhGYmNlxvDRaFU81xO0IjkunktCYVTM8nhdopzwquP51P5vMpeF2g34XX+tT+bDNH6ZW/L5eIe17P7XLvuh6x7LgM/wAZd90fm8/FH6i0ah7uJxuqKtnKJx7lRLrmPDJ8pc/ulXvn83kcK/7z0s/56n83C5H16vfLvwuMcT03+lp/OHHWP1w1h+i77tjlCeUyqJ2fQ19NWxGy6Yz1RTsuhOkwumNsLp5JhURustDpG0LhHR0pWhdUe50p5ucc3SnmqqqlcbphUZ2Flw+N9qn/AGTh/wCvX+UPsqY3fGe1b/s/D/16/wAqWHM/4ZReP0vhH6D7MZ/6o1WP8Y/4Yfn/AFff+zPH0Rqf9P8A8MPI4sayMI9vrJrx0eLxeqPojWf6vc/qy8iqYw8Xi8xHB9Z/oLn9WXp3/bK78g6Q+q9lU47aaaf81d/qS+Vj7Me59N7MJ7vbLTT/AJu5/Ul5eGP8kK19w/au9lNcZcqKpql2pxh7etOqIc4zE7OkZIjErpwlZMZy6UxGN0Vbcia4ppmapiIiMzM8oRobcrpopmqqYimIzMzyiH8++0HRafS9o9RVo6O7pr9XzluMcszvHuzl+scd4rVqq5sWJmLETvP6f/J+d+0az/E6O/jlNVEz8JcfVOJvjzefcMORj/Rt8NXEudUZh2rcqofFZK6ebMOUx0TO8LqS5LwzQplXMhlI1mWiAZloAACVJUDIMtAGZaAzJloCRQCVAAADMmSWgAAlQAAAyDLQBmWgAAJUAAAMhoAzq1lXNoMhoAlQADJaCVACVAAAAAAAAAAAAJUAACVACQAFJUCVJUDIJakFNTCoXqKdKXOjm60dHVSFqutES8/g1Odfbz0zP4PBo5bvacBpzq5q6U0S9Ph13khpD30c4Gcphr6mF4VTPd5cvB3tzmNnjwuiqYk1tMPIjOFxOznTOY2dImcLLw2M5eB2gn/qyr9al58c8PB47GeF1zEcqqfzY5v2Sj8vmseb2XA/t3fdD1z2HBaoi5cpnnMRMODH+6E39Pb01eKs7uZmIiZmcREZl16ZPnK/7pV+tLtwzbiWm/0tP5w4VzmuqY6zLyOFxNXEtLTH3tP5uSv74bQ/Qt8zuuOSFQ92vppKoXQinkuhZMOkdFR1TCo+0mF4dKeS6eUIp5Kp5rLOqqURzXR0Efl0p5KjOOiaeSoISuh8b7Vt7HD/ANav/hfZUPjvanRVOm0FeJxFdcT8I/c5OX/xyi/7Xwj772azjhGp/wBP/wAMPgX3Xs4uUTw3VWsx36b0VTHlMf8AKXncX/kY19vrYnblu8Ti8/8AVWs/0Fz+rLyInEbvD43cpt8H1lyucUxYr398Yh6N6x2ys/J45Q+k9mk47X6X9S5/Ul85L6P2a01VdrdNNP8AJt3Jn+jLy8X/ACQivuH7DRLyKJeLRO7tRU9qYdP5duZEspmJbVNFFM111RTTEZmZ5QhYrmIiapmIiI3mej5jjfE51MzYsTMWInef0/8Ak3jXE6tXM2bOadPHXrX/AMnq5elx+NqO6zamPXmUTGHzvb+3NfBKa/0L0T8YmH0r1Pa21872f1UdYpir4TDPqWLv49/4Uz13SX5dXmXKp5FbhX7n5tlq8W0ONX2kS6VubhvDKU1c2lSXPKG+5qVIASAKSAKSoAAEqAEgoEqZLQAAAASoASpKgSoAAAAASoASoASoAAAAAZVzayrm0AAAAEqAEqAAAEqAAAAAEqAEqGYBoAAJAUAJUAJUAAAJFJBsc+Suqaea4aVFUOtHNzph2ojk68cL1dKM4e44DTvdq90PUURL3nA6caeqrxrez0+u8kNIez8G9Rr6GFobTybE7shsc14WhdFU0z5eDyKaomMw8aOa6Ku7OengTCzyI58maqxGp0tyzM479OI9/RtExO7rTLO0bjQ+JuU1UV1UVRiaZxMebbVyq1ciuicTHJ77j3DartU6rT096v8Al0x184fPzGJ3edek0lPt7S3xO33fr0VRPlu4aviFV2ibdumaKZ5zPOXhCJyWmNIisbHueymlm/xKm9MT3LMd6Z8+kPW6LSX9Zfi1Yomqes9KY8ZfccJ0VrQaSLFE5nnXV+lLfjY+6214eXTOy45Jp3VD14TK6V07SijouErQuOUKpT0VHJMLw6xybT9pNPOF081ll9V0ThMQunmqiV08lQmmJwuBK6aeT1Pbjh86/s7ei3T3rtiYvURHOcc4+Ey9vTO7pTvGOiuSvdWYNbjT8Nnm87gnE9RwrWRqLGJzHdronlVHg+i7b9mLmjvV8Q0FqatLXPeropje1Pu/R/J8fl4l6WxWYTExL7232z4dVb712xqKK/0YpiY+OXou0naW9xO3/BrNubOmzmYmc1Vz0z5eT58TbkXtGiZbOH6F7IOF1V3tVxW5TMUU0/M258Zner8o+L5XstwHWcd10WbETRZif429MfVoj9s+T9s4XotNw7h9nRaSjuWrVOKY6z4zPnLbi4vPdLTHXzttVPdlnew61xmHj3aqbVM13Ku7TTGZmXpx58Q2jy7Rdpt0TXcqimmmMzM9Hz/F+J16uqbduZpsRO0davOXLiWvr1dfdpzTZido8fOXh83p8fjdv6re3RSmvMmcG0mCHbpqyefJ4nF7fzvCtVbiN6rNUfg8yrmmumK6JpnlMTDn5FO7FaFbxusw/HLnuca3lamibd2uiedNUw8a5yfmHIrqZh4FnCvk5O1TlPN512Mpq5JVVvCXNKBQKiVACVAAAAACRQAzLFAlQAAAkb1aCVAAAAAAACW5aAlQAlQAAAAAAAyrm1lXNoAAJUAJUAAMgGjJaAAAAAAAz0aAM9GgMhoAlQAlQynmBHuPRoAz0azcGiVAlQkFUqhNKoa19jpRydqI35OVEYjd2odmNpV2o5PfcJp7uio85mXoaX0ejp7ultU/zYe502P17WeRHJUYwiPsrj7L214bHPAR9qFLwmGx0wpPRUeGVoS6UVTRy5PJt1RMZjq8SPsqt11UVbcusE12tLzYeJrOGaTVzNVdE0Vz/Ko2mXlW6oqpzHJdPmwtWJ8SiHpf7HLczPd1dUR50Zd9N2c0tNUTevXLvlH1Ye2phdPJEYKfCzNPp7Ono7li3Tbo8KY5vIpTHJVOzelYr6WXSqM45JondW8NolZVPRcc0ROJdIXIXHJVM5TCqOYvDrT4riHOK6aZxVVTE+cunejETG6IyRP5W3DpTsqnmindcbQsS6UqhNE7K3zkQqjnu70cnCmp0iZwn8LwuudsS+d4r2R4TxCublNurS3Z3mqzOIn05fDD39Oc7u9uGV6VvGpg1E+3w1Xs7t9/6vFKop87Mfvedw3sDwmzcirVX7+rmP5O1FM/Df8AF9d3dk07Sw+2xx+FeysL0OnsaSxRZ01mizbp+zRRGIh51NWYzEvEpqiafBk6q3Yt1XLtWKI/FpSsz4haIn8PLv3rdmzVdu1RTRTG8y+Y4nr7mtucpptR9mj9so4lrrusu96c026fs0eHn73jRvD1+Nx4pHdb26sePXmWxybDG5d0NWjPRiVhvLdhPJS3mJhS3p+V9orXzPGdXbxyvVfm9XXy5Pf9trc0doNR4Vd2r4xD0NT8x59O3LaP+3hZY1aXCrOXGebtW5V83kXhz2T0QueqHJZUUCoM9GgM9GgAACVJUCVAAAADNwaACVAADPUD0aADJaACVAlQAAAAAAAyGgDIaAM6tZVzaAACVACVADIMmzQGZNvBoAAAAM6tABmTZoDMktAEqBKgAZloDIMmWgAAlSVAlQA2lUSmOSobUHSnd2oc6HWnbDtxQ1h2o8H0/d7n1P0YiPwfOaOj5zUWqI/lVRH4vqNXGNXeiOlcvoen11WZaa8Ij7K45ucdV0vUhKo5wpLYWghWduao5IjnKqZz0XTC2wmJ3UmPa34XaqmirMerzLcxVGYeBH2nW1XNFWY9YRaux7CM4zhVMIt1RXT3ol0hWFoVE4jmqJ3jdHVceC8JhcTutzp8XRf0sql0iXKnd0jHjjCZnUbIl7Hs9wjifaDjGn4RwbR3dZrtRV3bdqj8ZmeUUx1mdof057PPk7cC4fp7eq7XXauLa6YzVp7ddVGntz4bYqr984jye4+TJ2Bsdmex1njussxPF+L2qbtdVUfWtWZ3otx4bYqnznyh+wPi+p9XyZLzjxTqsf8AtzZc071V8zpOwXYvS2YtWOy3BrdERjEaK3+eN3pe0vsf9n/HbNVN3s9ptFemNr+hp+Yrpnx+riJ9Yl+gydHjV5GWs7i07Yd9vl/G3ta9kXF+w0zxDS3KuJcFmrH8IijFyxM8ouRG2OnejbxiNs/m/KX+g/ENHp9for2j1dmi9p71E27luuM01UzGJiY8H8S+1rslV2L7b6zg1Peq0k4v6OurearVWcRPjMTE0z7s9X1nReq2zT9LL7duDL3+JfKUTh0jdyp5rpl9K3b5KoZhtO0krO1HLkumZc6ZhfOULO1uqFVU5jMOVM4TqtZa01nvV7zO1NMc6pVis2nUIiNt1N+3p7M3LlWPCmOcvn9Zqrmpu96vamPs0xyhOp1FzU3ZuXPSI5RHk5vTwYIpG59umlO1dM+LeqFRLrhpErjcQ3MrLKGZ8zMiNtmdmZE5RKJ3L4T2hUd3i1u5H8u1E/CZh8tW+z9o1H1tJdxjNNVPwx+98ZW/Our07eRaHjciNXlxr9zlW7Vw41vByOWyJ+0xs/aTLkso0BmDM4PRoDMtASpKgAAGZaAyDJ6NAZloAAAAAzPm0AGZjwIBozq0AAEqABmSfc0BmSWglQAAAyGgDOrWVc2gAAlQAAAAAAAAAM5NAAAAASoASoAZDQAABKkqBIACkqBm3VoyEwKjkqOaY6Ko5t6Jh2pdqHGl2o3d2KGsPZcDo+c4rpaP87E/CXv9Z/2y9+vL1PZOjvcYtT+jFU/g9vrYxrbsfzn0nBrrFtpMfpco5qpndMqjk7a+lYUrnCfVsLQKjaVUua45xsvC8Kj7SuqY58lLws10pRG8KhKIdbNc26sx6w863XFdOYnZ6+I6Lt3KqKsxy6wiY2s9hE7qjnzc6K6a4zDpCsLQunHdXE7IjOeS4ndpHmFlRzew4FpI4hxzh+gq+zqtXasT7q64pn83r4eXwzWV8P4jpdfbpzXpr1F6mPGaKoq/YzzbnHOkP9GdNbotWLdu3TFNFFMRTEcoiHbo8Lg+uscS4VpOI6WuK7Gps0XrdUdaaoiYn4S83o/M7bifLz59gCEEv5y+WNobVN3s7xKKYi5VN/T1T4x9WqPh9b4v6My/mr5YnFbdzifAeD0TE12bd3U3I8Iqmmmn+rX8HpdIifu6ab8eJ734PPNkbSRVmW9Nn6HDvXTO6sOdHg60zsmVmx7nWmcw5xDx9Zq6NLRvPermPq0/vRWs2nULRG5dtZq7elt5q+tVP2aY6vQ6i9cv3pu3JzPh0iPCE3Lld65Ny5VNVUsejhxRSN/lvWumqZEx6ticTh0w0iSPBsThkYmDPktCVRLU7G6UbXy2ZMpmZZuCpnzZzlnvZmZB877QKO9wyxcx9i7j4x/yfBVv0btnR3+BXJx9iumr8cftfnVb4brtNZ5n5eXyo/W41uNbvccK3y2SHFZEoq5rlNTkszBKmQJUAlQAlSVAAAAAlQAlQyAYoABnKWgAAlQAlQAlQAMloCVACVCQUAAADIaAM6tZVzaCVACVACVACVM2aAAAADIaAAAJUAAAJUAMhoAlSQAFAlQAlQAMp5sbCYFxzVRG6YmMrodFEw6U8+Tvb6OVDtRGzuxNYfQ9iaO9r7tePs25/GXseJR3dfc9J/B4/YejEam5+rEfi8zjEY1sT40w+s4lNceG8x+h4rYmMMKV6sYXTyxLaeaYlseDRKsbYbHJm0xCqeaYlaFROVUzHgilcc11ony2PeqmU9W9RLpEy2nmmJxKs75WhaHS1XNFWYn3x4vOtV0105icvXulquaKsx6wtMIexjkuPtOVqumunMS60zDNZdMthEbYdKIXWf1J8lL2j6fWcIt9huL36beu0kT9H1Vzj5+zz7kfzqd9v0ceEv6Djd/nBpb13T37d/T3blm9bqiu3ct1TTVRVG8TExvE+b+kPYT7a+OcX4/w3sj2g0tvXXNVM27Wvoq7lyO7RNX8ZTjFX2ecY90vj+q9JtS05sXr8ufLh/MP6PNmRyy+Q9rPbW12D7JV8du6C5rpi7RZos0VxRmqqdszOcRt4S8ClLXtFa+5c0RudQ952l41w/gHBtTxXimpo0+l09E13K6p+ER4zPKI6y/h72h9p9T2w7Ya7j+opm3F+vu2bUzn5q1TtRT78bz5zLzvaN7Re0XbvWU18WvU2tHbqzY0VjMWrc+M53qq859MPlIxMPtOk9Lnix9TJ+6f/T0MOLsjz7KJ8nWJcpiI5KonZ77V0mJVRUyJ2eLr9XFmJot4m5P/APlNY7vC0eXXW62nT092nFVyY5eHvelrrquVzXXVNVU85l5PC+GcV4xqps8L4dreI3p50aaxVdqj3xTE4e9uezrt7as/PXOxvHooxnMaKuZ+ERlrHJ4+Hxa8RP8ALWLVr+XzKumV6jT3tNfrsai3cs3qNq7dymaK6ffE7w5xVEdXbjyVvG6ztrE7a2JZsZapVu2JhOcN6bLQmJaeqW7+Kdpb6yJMm0bbyJmGThkzERlVLwO0VHzvBdVT/m+98N/2PzO5zl+p62mLukvWv07dVP4Py69H15h8l/UFNZKy87lx528evk41u9cbONcPkMkPPlynkmpU9U1OOzNKkjEFACRQCVADIaAJUAJUAJUAAADMtASKASoASoASpktBKhIAoBKgAABkNAAAGdWsloAAJUAJUAAAJUADN2sgGgAAAAAAyAIaAAzq0EgoEqGQDQAAAGQ0pWqKhdCIdKMOnGmPbtb5u1PJyodrbuxNYfX9jqO7w65Xj7Vyfwh5HG4+var8pg7MU93g9r+dNU/i6cZpzp6av0an2OGuuPEOmY/Q9dBtllPLDWUeJcyqeapRHJUbrrKp6thkY6tWhMLjaVIzmFdExK21NhlPJVq3XduU27VFVddUxTTTTGZqmZxERHWZnotNoiNymfltO84ebw7hvEeJVzb4bw/Wa6uOdOmsV3Zj0piX9Pewv5N2jtaOxx72iWJ1OquRFdrhPexbsx0+ex9ur+b9mOU97p/SPDOG8P4ZoqNHw/Q6fR6a3GKLVi1TRRTHlEbQ+e5PX647duKNqTliH+a+v4Fxzh1v5ziPA+K6Kj9PUaO5bp+NUQ8Lbuxjl4v9PqrNqqJiq3TMTtMTG0vyH2sewbsl2u0t7V8L0tngfGcTVRqNNb7tq5V4XLcbTnxjFXnPJXj/ANRbtrJXUIjNv2/iO3XNurMfB59quK6c0/8Aw6drOz3Fuy3H9VwHjmlnTa7S1Yrp501RPKqmetMxvE/tzD1tu5Vbq71Pq+jx3rkrFqz4lvD2cRu6RDlZuU1096N/2LiV/wApdIff/J8/vydnJj/GK/8AdVvz+Iff/J+/vydmo6/wiv8A3Vbk53+vf+JTb9sv7lp5ej8g+VvGfZT/ALQ0/wCcv2CH478rnb2U/wC0dP8AnL4Xg/7NP5hxYv3w/kvptDaJwyiYmNmzD9Kem604lkxiUUzu8bWa3u5t2p+t1q8EVrNp1BEbVrtbFmmaKJ+vjefB+0ewH2H09ptDZ7UdsaLtHDb319JoYqmirU0/p1zG8UT0iMTPPMRz/N/Yr2Sp7a+0fhvCdRRNeipqnU6yPG1RiZpn9ae7T/6n97aa1RYsUWrdNNFFFMU000xiIiOj53r3UrYNYMU6n8yx5GWaR21eHwPgnCuCaCjQcJ4fpdDpbf2bVi1FFMekPYd2nwhQ+Nm0zO5l58zMvlu3HYXsx204fVpePcLs6icTFu/Ed29anxorjePynrEv449s3sv4p7OeNURXcr1vB9VVMaPWd3E55/N3IjaK4j0qjeOUxH934fM+0jsto+2XZDiHAdbRTjUWp+armMzauRvRXHnE4n4x1et0rquXh5Y87r+YdHHzzjt/0/z9ifgrE+9us017R6u9pNRR83fsXKrV2if5NdMzFUfGJc4l+qYskXrFo/L2YncKwwztud6MLp8GZO9Pge6RO0He8jvT4AHlmZ8WE4yzMCWS/L9fR83q7tvH2a5j8X6fPN+c9orfzfGdVT/nJn47vm/6hrulbOLl+ol6uvq41O9zq4Vw+JyvOs5V80T9lc80+LiuyQpIxkFJUgBnm0AAEigEqAEqAAAGQ1ktAABKgBKmdSAIaAJUAJUlQJUAAAAAAAAAM6nUq5tAAAABKgAAAZloDMkzu0AAAABkNyAMy0ABktBKgABkA0AGZMtABKgCkKeS1RcOlLn4OtHR00Wq7Uctnanm5W+TtbjMxHi9Hj18w1h97wej5vhemox/g4n47r4hT39JcjwjK7FPcsUUfo0xH4Lqp79M09JjD7aldY4q7P8A66egp57N6smJpqmmdpicNcUx5cctjwVSmPtKjmvHohU+TYlLYWhKo8G0zid0qTCyof0J8i3sPp+O9q9Z2t4jYpu6bg000aSmqMxOpqjPe/8ARTy86ono/np/b3yJ9Nbs+xim/RH19TxLUXK584mKI/CmHkdayzj42o/PhW86h+4xGNmg+Lc4TywAPwP5YvYixxjsNHazS2qY4jwWYm5VEb3NNVViqmfHuzMVR4Yq8X8dP9HvaZprWs9nfaLS3oibd3heppqz/oqn+b1qrNumZ8IfXf0/nm2O1J/DpwzMw72rlVqvvUz748XsbFyLsd6PXyerdbNyq3XFVPrHi+kbvbUzjaOfi+7+T5/fm7Nf6xX/ALqt+f27sXKYqp+D9B+Tzv7Zuzf+nr/3Vbi53+vf+JTb9sv7np5ej8d+V3GfZR/tHT/nU/YqeXo/H/lcxn2Tz/8AkNP+cvheD/s0/mHFi/fD+RqKuku1FUPE5f8Ay8XVavvU/N2526z4v0ule56UeXbXazObVmcfpVR+x4FMzDIa6q1isahrEaf0F8ii1bq7YcdvVRHzlGgt00eUVXMz/Vh/WL+Kfklcep4R7WbWhuz/ABfFtNc0seVcfxlP9SqPV/avi/OOvUmvNtM/l5vK/e0IHjOY6Iu/Yn3L6PF4hqbGj0V/Vam7TasWbdVy5XVOIppiMzM+UQmvmU19v4J9s1m1pvax2os2sdz6SuV+tWKp/GZfJZ83tO2XFfp3tdxfjeJinX6y7qKInnFNVUzTHpGIeqfr3Aia8elZ/EQ92nisKiZM+Kct2l3LK9TKPQE7V8WMEbNqmcMzLJ5mduSNoZU+F7Y0dzjVyrpXTTV+H/J9y+P7dUY1ti5j7VvHwmXidbr3Ydubkxur5mpwrd7jjXzfC5YedZxq55QutHVw3ZSmSGjCUACAZloAACVJUAADIblno0BmWgAAJUAMhoAAAzJJVzaAACVAAyZNmgMy0AAAAAABnVrOrQAAEqAZDRmAIaAAAAMgGgAAAzY2aAAkBQAlQAyMGxs0GbNEgKSAKAGQqMMavUVHN1piHONpdKXVjharvREd15nDqPnNbYo/Srpj8Xh2+T2nZ6jv8W08Y5VZ+EZepxK7yRDaseX3ES2EQqJ2fbVjUOl6fiFHc1de20/WcY+y87i9G1Fz/wBMvXw4cldWlheNStu2GFPJWGa45DI5tW/KymxOYTEthMLQuOT+v/kL8ftX+xnGezVyuI1Gh1v8JopzvNq7TEZj3VUVfGH8f0ziX1/sl7d6/wBnnbfSdo9HTVes05tazTxVj5+xVjvU++MRVHnEebz+qcaeRx5rHuEWjcP9Ih6LsX2l4P2s7P6XjnAtZb1ei1NPeprpneJ601RziqJ2mJ3h718Las1nUuaY0AA/PflDcft9nPY/2h1tdWLl7S1aSxHjcvfxdP8AWz6P8/aMYjbZ/prxzhXD+N8K1PCuK6Wzq9FqaJt3rN2nNNdM9JfxB7ffY/r/AGdcVniHD4vavs3qLmLGoq3r09U8rVyf6tXXlz5/Q9B5OLHaaW8TLfDaI8Py3nConZFEqh9hDph2sV1W6+9G/l4v0/5OlcV+2bs3VH39zP8A/Gt+XUcub9G+TjXMe2zszTnnqLkY/wD1VuPnx/8AHv8AxJaf0y/vSl+O/K6qin2TzMziPpCxmZ98v2Gnl6PxX5ZU49kU7c+I6f8AOXwvT/8AZp/MOPF++H8eavUfOz3aMxR+bx4xhkzu2H6nSIiHqwqJeZwjhuv4xxLT8M4Zpbur1upriizZtRmquqf/AHznaI3c+EcO1/F+KabhnC9Ld1et1NcW7Nm3Gaq6p/8Ae88ojd/a3sG9kug9n3Cqdbrot6vtBqaManURGabMc/mreeVPjPOqfLER5PVeq04VNR5tPqGeXNGOHH2A+yLSdgOHU8S4l83q+0OpoxevRGadPTP+Dt+XjV192IfrvNL8i9v/ALX9J2C4dPC+FVWtV2i1NGbVqd6dNTP+EuR+VPX3Pgf83NzfNped+rLZ+vehs/i7sl8ozt9we3FnikaPjlqJ+1qKPm7v9KjEfGmX2FXyqNXVp5i32MtU3cbTVxGZpz7vm3dfoPNpOu3bSeNeH9QV100UzNU4iH8xfKe9r+l1Olv9iOzOqpvfOT3OKaq1VmmKY/wNMxzmf5U8oj6vOZx+bdvvbX267Xae5oruut8L0FyMV6fh8Tb78eFVczNUx5RMRPg/NIiIiIjaOmHudJ/p21Lxl5H4/Dpw8Xt82XnM5bmExzMvtI8O2FTjo1DcrLKZCcy2JEbbubzDMszKNp2qPcycM9RCuyqfJ8x26oza0t2I5TVT+T6aXou2dHe4VTXH8i7H5S87qde7j2ZZo3WXxNcOFbyK3Cvm+Ayw8yzjW59XWtzlw3ZSirm0q5jmlAAgBKgSpKgZDQAZs0BmzQBKgBKgBkNAGbNAGbNAAAAABmzQGbNAAAAAGQ0AZDQBnVrKubQSoAAAAAAAAAAAAAAAAASoASoAGciWglQAkFAlSQBQANhMdFbZXqLjm60budLpRtOXZjhervb9z3XZSjvcTirH2aJn9j01HJ9B2Ppj+EX6/CiI+MvZ6dXeWrent9PEtjyTlUcn18Ohy1lv5zTV09cZj3vS53y99Ey9Nq7fzWoroiNs5j3ObPH5ZZY/LDrlkbxDZ5OZg2G9UxyU0WbH5qTEtjklZbY3hMNieiR9X7Oe33ansFxGrWdmuJ1aem5MTf01ynv2L+P06J6+cYnzf0L2c+Vnpf4PTR2k7J6ii9EfWucPv0101ecU192Y92ZfylHMziXByOmcfkTu0eUTWJf1xxr5WnArdifofsnxTUXcbfwu9bs0xP8A6Zrn8HoPZz8p/it3tlXT2102js8D1dUUUV6S3MToZ/SnnNdM/wArrHONtn8z52XTiHP/AGTjRWYiCKVf6g6PU6fWaW1qdLet37F6iK7dy3VFVNdMxmJiY5xMdXHjPDNBxnhep4ZxTS2tXo9Tbm3es3ac010z0mH8afJw9td/sPqrXZvtHeuXuzV2vFu7OaquH1TPOPG3PWOnOOsT/aOk1NjV6W1qdLet3rN2mK7dy3VFVNdMxmJiY5xMdXy3L4mTiZNW/wDEsbVmsv4c9v3sg1/s64rPEOHUXtX2a1NzFi/P1qtNVPK1cn+rV15Tvz/LOT/TLjHDdDxjhmo4bxPS2tVo9Tbm3es3ae9TXTPOJh/EPt/9kev9nfFP4fw+m7quzepuYsX53q01U8rVyf6tXXlz5/RdJ6t9TWLLPn8S3x5N+JfltL9C+TlXEe2/stTMxmdTXj/+Nx+b3LsURvvPg+8+TTM1+3fstVVO/wDCbn+5uPX5/wDr3/iV7z4f6Cxyh+K/LL/vP/7S0/51P2uOj8Q+WlVNPsbmY5/Sem/OXw3T/wDap/MObF+6H8aROJebwjh2u4txLT8N4bpbur1mpri3Zs2ozVXVPSP38ojeXHg2j1nGOI6bhvDNLd1Wu1FyLdqxajNVdU9I/f06v7Z9gfsj4f7PuFxxHiEWtV2h1NuIv34jNNimd/mrfl4zzqnyxD7nqXVacPHqPNp9O/JmikI9gPsg0ns/4d9JcRi3qu0WqoxfvRvTYpnf5q35eNXWfLEP1xUvyT2+e1vQ+z7hf8A0M2tX2g1VGdPp5nNNmmdvnbmP5PhHOqY8MzHw0fW5ub5tLg/Vlse3n2ucP7BcNnh3D5tavtBqaM2bEzmmxTO3zlzy8I/le7Mv4t4tr9ZxXiOo4lxHU3dVrNTcm5evXas1V1T1n93TkzivENdxbiWo4nxPVXdXrdTcm5evXJzVXVP/ALxEcojaHjQ++6T0qnCpufNp9y9HFijHDYiYbHIjPUw9xqqJU55MzAtEujMx4piqJhuYTtKhOehCdiokTmTJtKmbszJMo2hs5hmRmTYTPk9Z2mp+c4LqNuWKvhMPYzLxeKR85wzU0RHO1V+Tm5cd2G0f9M7+pfnVblcd6uUuFyNn57njy82zjX1c6ujrVDlLz8jGyakqqS5rIFJFQUAJUAJUAJUAAAJUlQJUMgGgAlQAlQAlQADJaAACVACVACVAAAAADKubWVc2gAAAAAAAAyGgAAAAAADIaAAAAzq0AAEqSoEqSAKSoGQ0AZTzUmnmuGtBdDrRDlQ7UOvG0q7W/svp+yNONPer8a4j4R/zfM0PrOzNHd4ZFX6Vcz+x73Sq7yxLfH7e4jk3kmnwbHJ9Q2hTwuJ28003Y6bS8yGXKIuW6qJ5TGEXr3V0i0bh6Xk1ldM01TTMYmJxJEZh57lbHvVT+acbNjGFqrQqNm0sjE9COa4tseKFQlZccldEUqpEwqNoXTzRHOG8pWQ60ziX7h8nL206jsVqrXZ3tFfuX+zV2rFu5OaqtBVM846zb8aenOOsT+HU8m0zjk5eVxKcnHNLpmNw/wBP9HqdPrdLa1WmvUXrF6iK7dy3VFVNdMxmJiY5xMOHHOFaDjfCdTwrimltavRaq3Nu9ZuU5prpnpL+Lfk6+3G/2F1tvs32ju3NR2Zu14oub1VaCqZ+1T42886enOOsT/bGi1Wn1ujtavSX7eo096iLlu5bqiqmumYzExMc4mOr4fl8TJxMmp/8S5rR2y/g/wCUF7H+Jezji863Rxe1nZrVXMabVVb1WKp5Wrs+PhV/K9713ya4n/pz7KzH+NV/7qt/fXHOFcP45wnU8K4ro7Ws0WqtzbvWbtOaa6Z6T/72fy9wz2Qa/wBnHyhey2s0FN7Wdm9Vrq402pn61Wnqm1X/ABVyfHwq/lR5vVwdW+pxrYsvvXhrXJuNS/rDo/Gvle8P13FfZTb4fw3SXdXrNRxXS27Fm1T3qq6pqnERD9ljkmqimqYmqImYnMZjk8LFknHeLx+GNZ1O34/8nj2N6T2e8MjivFotavtJqreL12N6NNRP+Ctz+dXX3P2L3NflHygPa9w32a8HjT6em1rOP6uiZ0ekmdqI5fO3MbxRE+tUxiOsxr/m5mX5tK3m8unt39rHDfZ5widNpptaztBqqJ/gukmdqI5fOXMbxRHSOdUxiOsx/EfGuKcQ41xbU8W4tq7ur1uquTcvXrk71T+yI5REbRG0J4xxrX9oOK6njHFdZc1mv1Vffv3bk7zP7IjlERtERiHi+b77pPTMfCpv3afcvQxY4pC45KQ3MvaiWrYnHNvPdMcmxtyW2nbfU9WZ8W7Ldy0SGQSeGxMkVSwBUSd7qjaWgrvMzDGegbb3vczM5YRyRKNmfGU3KYqt1U+MTEtmG+bLL5rMIn0/Nr9M011Uz0mYePXGzz+KUfN6/UUeFyr83hVxs/P+TGrTDzrw4VuMu1TlXzebdjZFXJKp+ylyWVFAqJUAJUzq0AAEgAKAEqGcgaACVACVAAAAAAACVACVAAAAAAADIaAM6tZVzaAM9GgMy0AAAAAGbNAAAAAAAZ6tABmzfQAZs0EigEqGQDFAAAAySSQbSqE08lR721B0pjZ2ocqXaiMRDsxtKu1D7PgtPc4ZYjxoz8ZfGUcn3OkoijTWqMcqIj8H0fSK/qmW+N3pnO2VRLmuJzHJ9BEtVNynLfNK0S9fxO1i7F2OVW0+94tMvbX7cXbVVE9eXveomJicTzjaXJlrq22GSupU2PtMjlyGTJccxke5sTsssqKujcIyuOSw33KpnKFRKVlx9lsbJiVSCqZc7t7Ed2id+sudy5n6tPLxRHuWiCJa/b/k1+27U9g9Vb7Odo71y/2Yu14ornNVWgqmftU9Ztz1p6c46xP4hs2mcS5uXxKcmnZcmsS/1L0Wr02t0dnV6O/bv6e9RFy1dt1RVTXTMZiYmOcTHV3xExyfw78mz22ajsLq7fZ3tFeuX+zN6v6le9VXD6pneqmOc25neaY5c46xP9taHVabW6O1q9Lft6jT3qIuWrtuqKqa6ZjMTExtMTD4bmcO/Fv229Oe1ZrLyhj4T249u6fZ32A1faL+B1ay/FdFjTWc4pqu1zimap6UxznG+zmx0nJaK19yiI29Z7ePa1wn2a8CzHzet47qqZ/gOh73Pp85cxvFuJ9ZnaOsx/B3afjvFe0nHdVxzjerr1nENXX3712vr4REdKYjaIjaIhvajj/Fu03HtVx3jusr1mv1VXeuXKunhTTH8mmI2iI5PXbY5Puel9NpxK91vNpdVaxWFW65oqiqmYz+b2Fm7TdpzG09YetmmG266rdfejm9qttNa209rlrlZu03KcxtPWPBc+Toidt4nauRnxZnJK20qyJ9W5TtO25ludt2Z8jZO0bbkzlqU7WUzLMeYbRtvq1AjZts8jLBGzZmegyZMomUbfE9paO7xjUR41RV8Yeore97X044n3sfatxP7P2PRVvhefXtzWhwZPcuNTjMbu1fNyq5vIyQwshC2OSyqVMhqgyGs9GgAAAAlQAB6AAz0aAACRQCVAAzkbEA1kk+5oJUAMhrJaAAAMkgGgzqDQAZDQBktZVzaAAADIAhoADNj1AhrNmgAAAAMkwYBoAAzZoAAAAAzY9QIwbHqbA0AAEkC45KhMclRG/NvRZ1pdqXKn3u1HTd2Y4Xh309PeuUU+NUQ+6p2xD4zhdHf1+np/nw+xiX1HSY1WZb41jInwa9poqJbEohsTtuRIuHgcStd25F2mNqtp97zo5Ju0U3Lc0T1/BXJXuhFo3D1NO0wpNdM0VzRVzidyMeLilza0qOTeUsnkRyIlMLgid2ROObZ9zRKmwmJbMxG8gqJxzc7tyap25Irq720ZiEx4JhZcEbSzlOylhu3MZybEpIbFUxyl/QPyQfahxvhfbDQez/AFk1azg/Eq66dLTVV9bR3Ipqrnu/zKu7OaekzmOuf59l+jfJm39vPZP/AFq5/ubjzuqYqZOPbuj1CLRuH+h0Pwv5b8//AEV/2ppvzqfukPwv5cH95T/amm/Op8Zwf9in8wwp+6H8Qw2J32ZGMc27P0aJdaqZ3bzR1bErCqKqqKu9S8+xdi5TttMc4euy2muqirvU7TC9b6XrbT2o5WbsXacxtPWHSMt4nbaJ21SdjELbTtTMY5HqzODaFMyxkzGMizZqkzLMw3KdhmTczHiZ80bDfxMQzMMNqq5MyerEG3zXbKmPnbFzHOmY+E/83zlfJ9V2wozpbNfhXMfGP+T5Wvk+P6rXWaXJl9uFfNyrdrkeTjW8HI57InmirmuUzG7ksoAz1ZjQABktBKgABnqBs0AZTzaAJUAJbubHqBDWbNAABkNAAAAGeoGxs0AAABkA0ZyaDIaAMq5tZVzaADIBoMwBDWSQDQAAAAAAAAAAAAASoAAAAASAApICkjYTAqOSo3lK6ebeiYdaY3d6I2w40O1DtxNYez4FT3uJWtvs5n8H1MTGHzfZqM66qr9GiX0US+r6ZXWJtRdOy45uUTCo57S9NZ0jcTExKoBsbNjPRJ1W2s8fiFnvUxdp5xz84eC9vnMTEvW6m181cmIz3Z5ObLXXljkp+URORmVMdMxsT0ynLapxGVonadqmYiMy511TVMfgzPe3ZKyVQ1MbNiQbDeTCJ33laFls5M26KSNfpHyZIj/p57J/6zc/3Fx+bRs/Svkwz/8AXjspH/mbv+4uOPqH+vf+Fben+hdL8L+W9/eV/wBqab86n7pD8L+W9/eUn/8AKab86nxHB/2KfzDGvt/EEbNiU5Nn6JDoX5sInzb3o8FtpiWNg2k9U7W22iuqiqK6Z3h7Cxepu05jaY5w9d+RRVVbriqmcStW2lq209rky5WLsXacxtMc4dMy3idtttzLcwiJzzbmFtjc55CcxLTZtuRkczMpFYg2YzIbbuZYyZwjY3LJ3ZlmZQjb1faejvcMqn9GuJfH18n2/G6e/wAL1FP83Pwl8TW+Y6xX/Jthl9uNzllxrd7jjVyfOZIc0uVXJNXNUpqcdmaVJGQKSAKAGQ0AAASpKgASAoAAAASAoASoASoZuDQAAABIAoAAAAAZ1ayWglQAAAAAAAAAAyAaAAAAAAACVAAMloJUlQJBQJUlQDKebWU80wLjmqiExzXRDopCYdaObvREONEO9DuxQ2h7vszT9a9X5RD3fnl6rs5TjS3KvGv8oe1fW8GO3DDWGxMKiUNid3dtMS6ROW97xREtiYFodInZsSiJw3MZShSL9uLtuaZn3T4SqObcpmNx5W9vV1RNNU01bTBEvM1dnv09+mPrR+MPXzVjaHJaup057xpc1Y580TPVnnJEqx4VhsbKjdOxvzXW2rmcmROWg2ORLMbtybWbE4VtKSOcb4W2PK4doddxPiGn4dw3SX9ZrNTci3YsWaJqruVTyiIf1t8nn5O+v7L8d4d2y7VcTm3xTSTNyxw/S4mi1NVE0/xlc/anFU7U4iJ6y9p8jz2ZaXgPZOz234pp6auMcWt97SzXG+m0s/Zx4VVx9aZ8Jpjxz/QnR8d1PqlstpxU9MbW/EEPj/ax2E4X7ROyN3s7xe9qtPYqu0XqLmmqiK6K6M92d4mJjflMPsdh4tLTW0Wj3DOPD/PL2z+xztL7Nb8arUTHEuCXK+7a4hZommKZnlTdp37lU9N5iek52fmucP8AUfjvCeH8b4RqeE8V0lrV6LVW5tXrNyM010zG8P8AOn2y9iL/ALPvaDr+zldVdzT0TF7RXqud2xXnuTPnGJpnzpl9f0jqc5/8eT23pbb4+JjLU9WxOHvNFROCJ6SzMYBChLdwVRVVRV3qZxMPOs3ouU55T1h6/MtormirvU7SvW2mlb6ezzDYxLjZuxdpzGImOcL8m8TttvbozHhKMNjZO0bbGzcyiJMybTteWTyTmWTmYNo2qfFksDZtuY8WTLN2o2b246yn5zS3aP0qJj8Hwtez7yreMPhtTT3LtdPhVMfi8HrEepY5Hj1uFW7vccanzGSHPaHLxRVyXPOUT9lx3ZJUlTASoSAoASoASoASoASoAAAAAAASoASoAAASpktBIKBKkqAAAAAABnVrKubQSoAAAAASoAAABnm0AAAAAGYBoAAAAAJBQJUluAYoACnmyW0rVFQuhEOlLoxrQ7UQ7UOVt2o3l34msPpOCUxTw6jb7VUy86Jw8Xh1Pd0Nmn+bl5MS+v48axxDTamxOeqY8mxOXQKiW53RMqIlMTpcT4t5wjM+8W2vt03bmJjwRluU7QrlDw9ZY53KPWP2vK355b6K2jujRMbjT1OWu2rsdyZro+z1jwcIlyzExOpc8xpsc2sI+yg2clRuww0WUSyJ6S0CJeXwjSfSPF9Dw7OI1eptWM+Hfrin9rwnlcL1c6Diej18RmdLqLd+I/Uqir9jLNvsnQ/1K4fpbGi0NjR6a3FuzYt027dMRtTTTGIj4Q8l4nC9XY4hw7Ta7TVxcsai1Tdt1RyqpqiJifhLy353O9+XPIAgZh/Jvy/eF2adT2T43RTEXq41GkuT40x3K6fhPf8Ai/rN/Jvy/eJ2p1HZLgtFUTep/hGruU9YpnuUU/Ge/wDB6HSt/d00tT2/lqMNGRL72Jb7ae42Ep2ZnG5mJ5ghLeZsxm5sVTNVFXepnd51m7FynwqjnDwMy2mqqmqKqZ3hettLVtp7LLcuNm7FyNtpjnC2sTEtdryZQGyJVkmfNInaNmYMwzYDbcs9SeYiZRtL47itPc19+n/OTL7CZ8HyvaCnu8SuTj7URP4PJ6rG8cSzv5h6u5zcK3kVxu4V83ymWGFnGvmiebpVzRP2nHdnKBstYShKgQDMtAAASCgSoAAAGZOrQSKASoABmGgDJaAAAlQCVAAADIaAAAMhoAzq1lXMgCGsloAAJUADNmgMw0AAAAAAAAZ6g0GeQNABkNZLQSoAZBs0BkNAAp6pVH2Vqio6OsdHPwdKejqxrVd7fudqIcaObydPT3rtFPjVEPQwR5iGsPp7Mdy1RT4UxC4lMYMYnZ9fj8Vhd0iYxurnDlEqiZhfZtecSeqYlvoJVGVIiZbHIFZ8W5p80TyVM56tE7VM+bc+SI2Mo2napxMbvC1VnuTNVMfV/J5mck4wi1e6CYiz1uTm7aiz3Jmqn7Ph4OTmmJidMZjRHNsMjwEoVhnLYidhOxuzBsTCdeB/avyNfaZp+0HY+32J4nqIp4xwa33dPFdW+o0sfZmPGaNqZjw7s9Zf0P0f5X8D4pxHgnF9NxbhGsvaLX6W5FyxftVYqoq/b4TE7TG0v6x9mPyq+E3tHZ0Pb7Q3dFq6Yimdfo7U3LNzzqtx9aifd3o93J8j1LpV6XnJijcSpav5h/T0j890Ptp9les08X7XbvglFMxnF3URaqj3014n8Hoe1XyjvZZwTTV1abjlXGtREfVscOs1XO9P684oj+k8mONmmdRWf/xXUv1LjXE9BwXhOp4pxPVWtLo9Lbqu3r12rFNFMRmZmX+dHtq7b3faF7ReI9o5prt6SZixobVe00aejPdzHSZzNUx41S937bvbP2k9pd+NLdp+i+B26+9a4dauTV35jlVdq278x0jERHhnd+YYjo+n6R02cH+TJ7aVrpXUZmYNpfQNWtzPiwBuTPmxvQGiVAGGZbEo2jctoqmirvU84ebavU3KfCesPAzHmU1TTMVUziVotpattPZd6PAzDjavRXHhMc4dMtInbXbe9BmE58jMJVVM5EZyTODYqcRzTMwyZZO6AmYfPdpaf7coqjrR+19BMPSdpqdrNXvhw9QjeGVbenoa3j15eRXzcK3yOWGNnGrmiftOlbm4rspYE82R73PKGgIAAEqAAGQBBs0BnVoAAAlQAM2OrQGbNABno0AAAAGQ0ABktAAAAAABnVrKubQAZANAAAAABkRLQAAABkAQ0AGbtAZu0AAASoAZhoAzDQAABkKjkmGxyheo6RvLpTnDnHN1pdWNaHajPi8zh1Pe1lqPPLw6PF7Hg9OdZTPhEy9PiRu8NYe9ifFsVfBES2X1UJXtMNc4ndeYzhKzY8lRPmkmcJiR0y31c48WxMrG17mY8UxO27eYlXXmZYzdYX3oM78kzMdWxKqxl49+ziZqo9Yd4zBMotG1ZiJeBO7d4eTesxV9anar83izExOKoxLLWmcxpTc+KGxPQQoTlufEGxMw3LDAs3rvJOfFmZVtJERAZbmPFgsKj3jmrvAoidt2RLU7WbmDl1YLDTdO/i3Mg3M5bunLcwqAZZMwnY2maqas07S8u1diuP53WHh7eLYqmme9E7wmLaTE6edub5c7V2K48JjouZabX22c+J6s3ZMo2NnbqyZhnvZmDaCZl6rtFT3tJRV+jX+x7KaukPB41TNXD7nlifxc3KjuxWhEvmq+rhW73HGt8hlYy4Vonm6XHOejgyMp9onOebSrmlzyhQlSBKgAAAABnVrJaAACVDIBoADMebQAAEqAAAAAGQ0AAAAAZDQBkNAAZVzaAACVAAzLQGQ0AAZgGgAAAAAAkBQAlSVAAAAkBSQAAGwryTCl6i45utPNyjm6083VRervRyez4JH8fXV4UvV0vccEp+rcq84h7HAjeSF3s+nM38UkT4vozazOEtz8U7TtcVYVEw5+rcynadunQzKInwlUSkbHMiWbNTtZUT5tifNzzLU7NrEbxybEzlO07V6k58U5bM+Rs23MpuUU1xvtPi3PkzPkezw8aumaJ35eKXlziqMTGzhctY3o5eDK0a9KTCIk58meWDkrtVUT4kbpiW+5JtoRzAbmc7tzGeaZ5tWFCdzKNrKZGxmG+42GZblgk22JgywDamfBO/SWm07V6icmZ8DaG+pzZnyZlGxdNU0zExOJh5Nu7FdPTveDw8z4EVTE5jaYTErRbTzssmXO3ciuN9pjmvZp4W231ajMCEbJePr47+ivUx+hLvjdNyIqoqp8YmGeXzSYNvj693Gudna5iJmJ6S4V8nx+bxLKzlW5z0dK3OXBdlKZ8UqqS55QpIKgoABktAABKkqBIoAABkNAEqAAAEqAAABmWgJUlQJUAJUAAAAAMq5tZVzaADIBigAABIoAABKhkA0AAAAAEigGQ0AAASCgSCgSoAGsbHJeouOeXSlyieTpT73VSVod6Je74PTNOk73LNUvRU830HC/+w2/X83tdN/5F9+Hl58Wp59Tzy93ZtTcpz5NTsV6mU5luY8FtpiVG7PcRsnZtUTjxhXe2R6t9VtrbXEmyN/FsTubFY82x70RViW58k7Ntz5GZZ3m94Ttu7NyKoO9BtBvEm7JlmRO2V0RVvynxcaqKqZ33h3yZyrMbVnThsOlVNM7xtKJiY2mFfSCJ3w1J5whChOfNufM2nbWp9W5Ts2Yhu/iZyJ2NyZiWMFtq28TCceZv0lYVgwzfxN45qisDM7GfJGxpuzPkZSMDJlUbE4nMO9uuKturx2d6YnMZiV4tpZ5mI8DMeLnbr78Ymd4VutvYrLCWTOyLeh8lrqe5qbtPhXMfi8Wt5nFZ/t+9j9KXg1PjuT4vLKyK3OV1uc/aefeWcsnmlssYShQCoAAAAlSVAlSVAAADNmglQAlSVAlQAMy0AAAABIoAAAAAABkNAGVc2sq5tAGS0AAAAAGYBozY9QaM2aAMloJFAAAMhoAAAJUAlQAAzHmDQAZ1VE7JlsStAqF0yiFUy3pKYdqZe84Jc72nqtdaZz6S9DTLydHqKtPei5T7pjxh6XDz/TyRMr7fSjnp71u/biu3VmPDrDo+mreLRuEGAFtjctSJ2navc3MpiW5hKVc92pOSNp2qJlucpyRKYkiVRMS1GYYts2vdn1vFkThuZR3J23JmU58mJ2bXmcNTnB6ybNt3anPmyfebRtaZxywz1Mo2bTMRPLZExMSuJM+QI5m+VYzPJndmJ5o2giZbnxYGxsNScjYrMmfKWRJkNty3KeZiE7TtRCceZjzRs2rJlnTxM+ZuTbZNk5MmzbRmfIz5BtozJmUbTtsZicw70VxVG/2njbkTMTmOiYtpG3lTv7k11U0W6q6uURmWW7kVRjq9VxzX09ydNaqzM/bmPyZ8jkVxUmZW29Pqrnzl6u51qqmXjVLqlyql8hlv3TMs7SmeaZbLJ2clpZpq5tGYYzI0GeqBozZoAAJUAAzBgGgAAAlQAlQzANGbeJ6g0Zs0BKgAAAGeoNGbNAAAAAAwDOrWVc2gAADJaCVAAM9GgDOrQAAAAAABnoYkGgAAAlSVAAzEg0Zu0AAEthqUwL2bEpicK3aROhdM9MukThxjyVTMt62WiXlWL1y1V3rdc0z5PYW+K3YjFdFFfnyenifVUVO3Fyr0j9MrRMPdRxafuKf6R9KVfcx/Seoitveh0xzsnynUPb/AEpP3MfEjik/cx8XqYqyrMJ+9yfKfD2v0nP3UfE+kp+5j+k9V3md7yT97k+Tw9tHE6vuo+LfpSqP8FHxep7x3vI+9yfJ4e1nidX3VPxPpSr7qn4vU947x97k+Tw9v9KVfdU/E+lKvuqfi9R3jvJ+9yfJ4e3+lavuqfifSlX3VPxeo70HeyffZPk8Pb/Slf3VPxPpSv7qn4vU96TvT4I+9yfI9t9KVfc0/wBI+lKo/wAFT/SepmfI7x99k+Tw9t9KVfdU/E+lavuqfi9R3m96D77J8p8PbfStX3VP9Jn0pP3VP9J6nvQ3vQffZPk8Pa/SlX3VPxPpSr7qn+k9V3jvJ++y/J4e2+k5+6p+J9KT91T8Xqe83vI+9yfJ4e1+k5+6p/pM+k5+6p+L1Xeg70J+9y/J4e1nic/dR8WfSc/dR8Xq+9B3oR97k+Tw9p9Jz91T8T6Tq+6p+L1feg70H32T5PD2n0nP3VP9Jv0nP3VP9J6rvQd4+9y/J4e1+k5+6p/pH0nV91T8Xqu8d7c+9yfKPD2v0nP3VP8ASPpOfuqf6T1Xeg70H3uT5T4e1+lJ+5p/pH0nP3VP9J6rvQd4+9yfJ4e1+lJ+5p+J9Jz9zT/Seq7xk++yfJ4e1+lJ+5p/pMnik/c0/wBJ6qat2TV5onnZPlHh7b6Vn7mn4or4rVjazTHq9XNfkmalJ52X5R4eZf4hqLkY7/cjwp2eFVUmak1S48ue1/3SibNqqc53lszlMy5rWUmWMnm2dk7ywmUGGs3IyzDDQAAABkA0ZJuDQZiQIaAAAAM3AhozcGgAAAAyAaDIyBDWbm4NAABkA0AAZu0GdWsq5tAAAAAZyPRoAAAAMhoAAAMy0AZloAACVAAAAMloAkAUlQMhrOTQCJBaJGtiUxLV4toXmYbFSI2M+TSLp26RV4KiZcjMrxdO3bvS3vOOZ8JMzC31Dbt358Tv+bl3jvJ707de/Pid+fFy7x3jvNuvfO/PjDl3jvH1Dbr3vcd6fGHLvHe8j6ht17/uO97nLMne8j6ht178+MHfnxcu8d4+obde/J358XLveRk+obde/PjB3vNyyd4+obde9Pgd6fBy70+B3j6ht173kd6fBz7x3j6ht070+B3p8HLvHePqG3XvT4Henwcu8Z8j6ht170+BEy5d47x9Q2696fA70+DlFW53kd5t170+B3pjq595neO82696fE78+Ll3jvJ7zbr3/M7/AJuUVHe8j6ht1709JO9Pi5Z97e9J9RO3TvT4nfnxc+8yajvR3Ok1GZcu8Znoj6htc1M7yGZVm6NrmqU+rMyyWc2RtszlhmITzZzKGzMgKTIAIAAAAAAAZLQAASpKgSoAAAAAAASoASoAZDQAABIoAAAABkNAGVc2sq5sAUAAAJUAJUAJFAAAAAAAAAJFAJUAMhoAlQkBSQBSVAlQAyGgAAnYZMgnuGwRjxYyE9wpuZTkynuFZMynPnInuFTMmU5DuFZM+aMtO4XnPizKMtR3C87YlmZ8U5E9wrJlOQ7hWdyZSHcKyZTkO4VnxkzKch3Cszgz5pyHcKz5mUh3G1Z9DO/VIdwrJmfFIjuNqid+bcoyJ7hWTMpz5h3is7EzCQ7hWZM7pz5iO42rJEpyep3CsmZ8UsydwqZMpy07hs4zzZmGZajuD0ZMsbhHcNAV2AAAAJUAJUAAzZoJUAJBQJUAAAAAJFAJFAJUAMhoAAAkUAlQAAAAAyGgAMq5tBkNAAAAAAAAAAAGQ0AAAAAAAAABktBKkqBKkqBKgAABKkqBkNSoGQ0AZDRmAaCQFAADIBoADOrQAEgoAAAAAAAAAAAAAGQ0AASCgAAZANAAAAABkNAAAAAAZLQAAAAAAAASoASoASpnUwDQABktBKhICkqBKgBkNAAAEqAAAGQ0ABktAABkNGYA6tZ1aAAAAAADIaAAMwDWTloAAAAAADMeZ6tAAASpmzQAAZhozcDDQAABKgABm/gBhoAAAkUAlQAzBuS0GYk+BJuDQASoAZDQBmDdrOoNAAABKgAABm7WT4tAABKgBKhkAYaAAAAAJUMgGKAGerRm4NAAABKgBkNDcAAAAEqAEqABnq1m4Hq0ABmzQSoAGdWm4DPU9GgzdoAAAlvVoAAAzdoAAAADIaGAZ1ayrm0AAAAAGQBDWZaAAAAADIBrPRoAMyZkGgAAAAADMmdgaMy0AAEqAEqAAZloAAJUlQJUlsA1mWs3BrMtZuDQASpKgS30aADMm4Ho0AAASoAAAGejWbgQ0ASKABKgGejQAZloAAJUlQJUzk0Bno0ABm4NEqBKhkAe9ozcGgAAAlTJaDIaADN2gM3MtZuDQAAAAAZB6NZmQNzJ1aAAAADIaz0aAz0aAAAAAAAyD4tABlXNoAAAAAAAAAAAADJaAMy0AAAAAAAZyaAMloCVACVJUCVAAAACQUJUCVACVAAAAAAJUCVAAAAzLQEqSoEigEqABmWgAJAUAJUAAyWgAAlSVAkFAlQAyGgAACVJUCVACVAAAAJAFACVADIOTQAAASoASoAABmWgAAAAAlQAAMhoAAAkUAAAAAyG5GYA6tZVzaAAAAAAAAAAAAAAAAAM9CAaAAAAAAJUAAAAAAAACVACVAAAAM2aCVJUCVM9GACmQDQAAASoASoASoAAAAASoASKAAAAASpKgSoAEqASoASoASoABno0EqZLQAAAASoSAoASoAAAAAAAAZ1BoAAAJUAAAAMwDQAAASoASKASoAAAAZgCrm1lXNoAAJUAAAAM3BoMxIENGQDQAAAAAAZgCGgAAAAAMwbg0AAAEqAAAGQ0AAAAASoAAZuDQZuDQAAAAABnobg1nVrNwaM2aAAADNwaDNwaACVADIaAAz0aAMloAAAAJUMiJBoAAAAAAAJUMwDRm5gGgADNmgAyAaDNwaAAAAAAAAzdoAyWgAAAAAAAAAAAAAAM6tZVzaAAAACVAAAAyWgMhoAAyAaADIayTINAAAAAABkA1m5loAAAAAAMhrOUtADzAZDQAAAAAAAAAAAGe9oAMgGjMmegNAABnUGgTPLAAZgyAM5nQGjPM6A0GYAg3IbE4Bno05zyInAATOZZPPYGgAAAAAAADOjQZDQABnID0aADN2gAAAAAMiQaMy0AAAABktAZDRmQazk0AABKgAGdWgzqbNABnVoMhrJIBoAAAM6tZVzaAACVAAADMyZaAMzLQAAAGQBuZaAMzLUgoAAAGQ0ZANZloDMmWgAAAAAAMgzu0BmWgCVACVADIOTQBmWgAAJUAMg5NAGZPNoDJayAaAAAAZAGQZJw0AAAAAAAyADMtAAAAAZDQAZloDMy0ABKgSoAGZaAMyS0AAAABnJoDIMktBmTLQAAAGQDWZaAzJmWgMy0AAZAMUADMtAAAEqAZDUqBnVoAyGjMAdWsq5tBKgAAAZyaAMy0BKhIKAAAABkA0AAAEqAAAAAEqSoAAAAAAAAEqAAAAZ1aAACW5aAkFAAAAAAACVAAAAAAAAAAAAyAaAAAAAAAAAAAAAAzdigAAAAZDQAABKhIKAAAAABKgAAAAAAAAAAAAAAAABKhIKAAAAAAABnVrKubQSoAAAAAAASoAAAAAAAAAAAAZANABkNAAAAAAAAAAAAAAGbg0AEqAAAGQ0ZANGbEA0AAAAAAAAZLQAAAAAZuDQAAAAAAAAAZDQAABKgAAAAAAAABKgABm4NZyaAAAlQyAYoAAAAAAAAAAAAAAASoZkGjMmQYpmTINGZMg0AGdTLQGdWsq5tAGS0GQ0AAAAAAAAASpKgAAGZaAyGgDIy0ABKgAAGdWgDN2gDOR1aAAAAAMybg1mWgJUlQJFADPRoAMy0AAEqAEqGQDRmWgM3azcGgAlSVAAyAIMtAGS1kAxQAAyAIaMgGjMtAABKkqBKmbEA1no0AGebQBKgSoAAABmWgAAAAlQAyGgDN/BoAAAAAlQAz0aAMg5NAAAZPJjZ5MAAAAAABscmsjk0GU82gCRvVoJAAUkAUlQJbloACQFJABQCVADIMtAGZakBSQFCVAAAMy0BKkgCkqBKgAZk9D0AyZYAKSAKEgKAAAAEgoSAKABmWgDMtABIAoASoAGZaAMy0AEgCkqBkGWgDMno0AAASoEqABmWgAADMtASpKgAAAAAASoSApKgGRLWegNGejQBIAoSAoAAABno0ASAKSoEjZ5MAAAAAABscmsjk0GQ0Z6A1IAAACkgKABIoEikgCkgKAAAEikgAAAoEqAEqEgAAAACgEqAEikgNywAFJAUAJUlQJUkAAAUlQJUAJUJABQJAAUAJUAJUlQJUkAUlQJUAAlQJFAJUkAUlQJUAAJAUkAFAJUAAAAAJBQJUAJUJBQJAUAJAAFAAAJAAAAAABQJAAAAAAABscmsjk0GQ0ASKSApIApLYBigAEgCkgKEqBkNAEqSAKSAKSoAAAAEqAEqSoEqSoGQ0AAASoSAoAZDQAABKgBKkqBKgBKkqABIKEgCkgCkqBKgBIACkgKABKhIKABKhICkqBKhICgBKgBKgBKgBKgBKgBKkqAEqBKgBKgAABKkqBKhICkqBKgASAAAChIApICkgAAAKBIKBIoBkcmgAACRTNwYKASpno0EjfRoJUAAz0NwaM9GglTPRoJG+h6A0AEqAAZ6HoDRnobg0Z6G4MUz0aAM9GgAAlTPQ9AYKABno0AZ6NAAAGehv4AxQAlQADPQgGDfQ38AYpnob+AMUz0NwaDN/AGKAEimegMUAM6NGegNGehv4A0Z6NABnoDFM9GgAzcGgzcGgzfwBihnoDQZ6A0Zv4G4NBnoDFDPQGKGbgxTNzcGjN/BoJUAAz0PQGCmR7gYpno0AAEjfRoJG7+BiQYpnoegMUAJG+jQSKZuDFDNwaAAM9GgDOh6A0DAP//Z" style="width:28px;height:28px;border-radius:8px;display:block;"></div>          <span class="sb-logo-name">ShopBot</span>
        </div>
        <button class="sb-header-btn" id="sb-btn-refresh" title="Làm mới">↻</button>
      </div>

      <!-- Tabs -->
      <div class="sb-tabs">
        <div class="sb-tab active" data-tab="capture">
          📸 Chụp
          <span id="sb-tab-badge" class="sb-tab-badge" style="display:none">0</span>
        </div>
        <div class="sb-tab" data-tab="chat">💬 So sánh</div>
        <div class="sb-tab" data-tab="settings">⚙️ Cài đặt</div>
      </div>

      <!-- Capture View -->
      <div class="sb-view active" id="sb-view-capture">
        <div class="sb-capture-top">
          <div class="sb-page-card">
            <div class="sb-platform-row">
              <span id="sb-platform-badge" class="sb-badge sb-badge-other">Web</span>
            </div>
            <div class="sb-page-title" id="sb-page-title">Mở trang sản phẩm để bắt đầu</div>
          </div>
          <button class="sb-btn-capture" id="sb-btn-capture" disabled>
            <span>📸</span><span id="sb-btn-capture-text">Chụp trang này</span>
          </button>
          <div class="sb-progress" id="sb-progress">
            <div class="sb-progress-track">
              <div class="sb-progress-fill" id="sb-progress-fill"></div>
            </div>
            <div class="sb-progress-text" id="sb-progress-text">Đang chuẩn bị...</div>
          </div>
        </div>
        <div class="sb-slots-header">Sản phẩm đã lưu (<span id="sb-slot-count">0</span>/3)</div>
        <div class="sb-slots-list" id="sb-slots-list">
          <div class="sb-empty"><div class="sb-empty-icon">📦</div>Chưa có sản phẩm nào.<br>Mở trang SP và bấm Chụp để thêm.</div>
        </div>
      </div>

      <!-- Chat View -->
      <div class="sb-view" id="sb-view-chat">
        <div class="sb-messages" id="sb-messages">
          <div class="sb-msg bot">
            <div class="sb-avatar bot">S</div>
            <div class="sb-bubble">👋 Xin chào! Tôi là <strong>ShopBot</strong>.<br>Hãy chụp ít nhất 2 sản phẩm rồi hỏi tôi để so sánh nhé!</div>
          </div>
        </div>
        <div class="sb-quick-btns">
          <button class="sb-quick-btn" data-q="So sánh tất cả sản phẩm đã lưu">🆚 So sánh tất cả</button>
          <button class="sb-quick-btn" data-q="Sản phẩm nào đáng mua nhất? Cho điểm từng cái">⭐ Chấm điểm</button>
          <button class="sb-quick-btn" data-q="Cái nào giá tốt nhất so với chất lượng?">💰 Giá tốt nhất</button>
          <button class="sb-quick-btn" data-q="Tóm tắt ưu nhược điểm từng sản phẩm">📋 Ưu/nhược điểm</button>
        </div>
        <div class="sb-input-area">
          <textarea class="sb-input" id="sb-input" placeholder="Hỏi về sản phẩm..." rows="1"></textarea>
          <button class="sb-send" id="sb-send">↑</button>
        </div>
      </div>

      <!-- Settings View -->
      <div class="sb-view" id="sb-view-settings">
        <div class="sb-settings">
          <div class="sb-settings-section">
            <div class="sb-settings-label">🎨 Giao diện</div>
            <div class="sb-theme-grid">
              <div class="sb-theme-card active" data-t="bright">
                <div class="sb-theme-preview"></div>
                <div class="sb-theme-info">
                  <div class="sb-theme-name">☀️ Bright</div>
                  <div class="sb-theme-desc">Sáng, dễ nhìn ban ngày</div>
                </div>
                <span class="sb-theme-check">✓</span>
              </div>
              <div class="sb-theme-card" data-t="dark">
                <div class="sb-theme-preview"></div>
                <div class="sb-theme-info">
                  <div class="sb-theme-name">🌑 Dark</div>
                  <div class="sb-theme-desc">Tối, nhẹ mắt ban đêm</div>
                </div>
                <span class="sb-theme-check">✓</span>
              </div>
              <div class="sb-theme-card" data-t="rose">
                <div class="sb-theme-preview"></div>
                <div class="sb-theme-info">
                  <div class="sb-theme-name">🌹 Rose</div>
                  <div class="sb-theme-desc">Hồng nhẹ, dịu dàng</div>
                </div>
                <span class="sb-theme-check">✓</span>
              </div>
              <div class="sb-theme-card" data-t="midnight">
                <div class="sb-theme-preview"></div>
                <div class="sb-theme-info">
                  <div class="sb-theme-name">🌌 Midnight</div>
                  <div class="sb-theme-desc">Tím đậm, sang trọng</div>
                </div>
                <span class="sb-theme-check">✓</span>
              </div>
            </div>
          </div>
          <div class="sb-settings-section">
            <div class="sb-settings-label">Model AI</div>
        <select class="sb-select" id="sb-model-select">
              <option value="gemini-2.5-flash">⚡ Gemini 2.5 Flash</option>     
              <option value="gemma-3-27b-it">🚀 Gemma 3 27B</option>
              <option value="gemma-3-12b-it">🔬 Gemma 3 12B</option>
            </select>
          </div>
          <div class="sb-settings-section">
            <div class="sb-settings-label">Dữ liệu</div>
            <div class="sb-btn-row">
              <button class="sb-btn-danger" id="sb-btn-clear">🗑️ Xóa sản phẩm</button>
              <button class="sb-btn-danger" id="sb-btn-reload">🔄 Reset toàn bộ</button>
            </div>
          </div>
          <div class="sb-settings-section">
            <div class="sb-settings-label">Tương thích</div>
            <div class="sb-support-info">
              ✅ Shopee · Lazada · Tiki<br>
              ✅ Amazon · eBay <br>
              ✅ Taobao · Alibaba <br>
              ⚠️ Trang khác: chụp ảnh vẫn hoạt động
            </div>
          </div>
          <div class="sb-settings-section">
            <div class="sb-settings-label">⚠️ Lưu ý quan trọng</div>
            <div style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.25);border-radius:8px;padding:10px 12px;font-size:11.5px;color:#fca5a5;line-height:1.7;">
              ShopBot <strong style="color:#f87171;">không</strong> liên kết hay được bảo lãnh bởi Shopee, Lazada, Tiki hay bất kỳ sàn nào. Extension hoạt động độc lập, chỉ đọc thông tin hiển thị công khai trên trình duyệt của bạn.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview overlay -->
    <div id="sb-preview">
      <button id="sb-preview-close">✕</button>
      <img id="sb-preview-img" src="" alt="">
    </div>
  `;
  document.body.appendChild(root);

  // ============================================================
  // STATE
  // ============================================================
  const MAX_SLOTS = 3;
  let slots = [], chatHistory = [], isLoading = false, isOpen = false;

  // ============================================================
  // FAB CLOSE (ẩn widget)
  // ============================================================
  document.getElementById('sb-fab-close').addEventListener('click', (e) => {
    e.stopPropagation();
    root.style.display = 'none';
  });

  // ============================================================
  // FAB TOGGLE
  // ============================================================
  const fab = document.getElementById('sb-fab');
  const panel = document.getElementById('sb-panel');

  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    fab.classList.toggle('open', isOpen);
    document.getElementById('sb-fab-badge').style.display = 'none';
    if (isOpen) updatePageInfo();
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'reset_widget') {
      root.remove();
      sendResponse({ ok: true });
      return;
    }
    if (msg.action === 'toggle_widget') {
      // Nếu root đang bị ẩn (do bấm X), hiện lại và mở panel luôn
      if (root.style.display === 'none') {
        root.style.display = '';
        isOpen = true;
        panel.classList.add('open');
        fab.classList.add('open');
        updatePageInfo();
      } else {
        isOpen = !isOpen;
        panel.classList.toggle('open', isOpen);
        fab.classList.toggle('open', isOpen);
        if (isOpen) updatePageInfo();
      }
      sendResponse({ ok: true });
    }
  });

  // ============================================================
  // TABS
  // ============================================================
  document.querySelectorAll('.sb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sb-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.sb-view').forEach(v => v.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`sb-view-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // ============================================================
  // INIT
  // ============================================================
  loadSlots().then(() => { renderSlots(); updateSlotCount(); });
  loadModel();
  loadChatHistory();

  document.getElementById('sb-btn-refresh').addEventListener('click', updatePageInfo);

  // ============================================================
  // PAGE INFO
  // ============================================================
  function updatePageInfo() {
    const url = window.location.href;
    const title = document.title || '';
    let platform = 'Web', badgeClass = 'sb-badge-other';
    if (url.includes('shopee.vn')) { platform = 'Shopee'; badgeClass = 'sb-badge-shopee'; }
    else if (url.includes('lazada.vn')) { platform = 'Lazada'; badgeClass = 'sb-badge-lazada'; }
    else if (url.includes('tiki.vn')) { platform = 'Tiki'; badgeClass = 'sb-badge-tiki'; }
    else { try { platform = new URL(url).hostname.replace('www.', ''); } catch (e) { } }

    const badge = document.getElementById('sb-platform-badge');
    badge.className = `sb-badge ${badgeClass}`;
    badge.textContent = platform;
    document.getElementById('sb-page-title').textContent = title || url;

    const btn = document.getElementById('sb-btn-capture');
    btn.disabled = slots.length >= MAX_SLOTS;
    document.getElementById('sb-btn-capture-text').textContent =
      slots.length >= MAX_SLOTS ? `Đã đủ ${MAX_SLOTS} sản phẩm` : 'Chụp trang này';
  }

  // ============================================================
  // CAPTURE
  // ============================================================
  document.getElementById('sb-btn-capture').addEventListener('click', async () => {
    if (slots.length >= MAX_SLOTS) return;
    const btn = document.getElementById('sb-btn-capture');
    btn.disabled = true;
    document.getElementById('sb-btn-capture-text').textContent = 'Đang chụp...';
    document.getElementById('sb-progress').style.display = 'block';

    const progressListener = (msg) => {
      if (msg.action === 'capture_progress') {
        document.getElementById('sb-progress-fill').style.width = msg.progress + '%';
        document.getElementById('sb-progress-text').textContent = msg.status;
      }
    };
    chrome.runtime.onMessage.addListener(progressListener);

    try {
      let pingOk = false;
      try {
        pingOk = await new Promise(resolve => {
          chrome.runtime.sendMessage({ action: 'ping_tab' }, res => resolve(res?.ok === true));
        });
      } catch (e) { }

      const captureResult = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'inject_and_capture', tabId: null }, res => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(res);
        });
      });

      if (captureResult?.error) throw new Error(captureResult.error);
      if (!captureResult?.success) throw new Error('Capture thất bại');

      const thumbnail = await createThumb(captureResult.imageData, 88, 88);
      const slot = {
        id: Date.now(),
        platform: captureResult.productInfo?.platform || 'Web',
        name: captureResult.productInfo?.title || document.title,
        price: captureResult.productInfo?.price || '',
        rating: captureResult.productInfo?.rating || '',
        sold: captureResult.productInfo?.sold || '',
        url: window.location.href,
        capturedAt: new Date().toLocaleString('vi-VN'),
        imageData: captureResult.imageData,
        thumbnail,
        segments: captureResult.segments
      };
      slots.push(slot);
      await saveSlots();
      renderSlots();
      updateSlotCount();
      addBotMsg(`✅ Đã lưu <strong>${slot.name.slice(0, 40)}${slot.name.length > 40 ? '...' : ''}</strong> (${slot.platform})<br>📦 Đã lưu ${slots.length}/${MAX_SLOTS} sản phẩm${slots.length >= MAX_SLOTS ? ' — <span style="color:var(--yellow)">Đã đủ slot!</span>' : ` — còn trống ${MAX_SLOTS - slots.length} slot`}`);

      const fabBadge = document.getElementById('sb-fab-badge');
      fabBadge.textContent = slots.length;
      fabBadge.style.display = 'inline-flex';
    } catch (err) {
      addBotMsg(`❌ Lỗi: ${err.message}`);
    } finally {
      chrome.runtime.onMessage.removeListener(progressListener);
      document.getElementById('sb-progress').style.display = 'none';
      document.getElementById('sb-progress-fill').style.width = '0%';
      updatePageInfo();
    }
  });

  async function createThumb(dataUrl, w, h) {
    return new Promise(resolve => {
      if (!dataUrl) { resolve(''); return; }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        const aspect = img.width / img.height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (aspect > 1) { sw = img.height; sx = (img.width - sw) / 2; }
        else { sh = img.width; sy = (img.height - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve('');
      img.src = dataUrl;
    });
  }

  // ============================================================
  // RENDER SLOTS
  // ============================================================
  function renderSlots() {
    const el = document.getElementById('sb-slots-list');
    if (slots.length === 0) {
      el.innerHTML = `<div class="sb-empty"><div class="sb-empty-icon">📦</div>Chưa có sản phẩm nào.<br>Mở trang SP và bấm Chụp để thêm.</div>`;
      return;
    }
    el.innerHTML = slots.map((s, i) => `
      <div class="sb-slot-item">
        ${s.thumbnail
        ? `<img class="sb-slot-thumb" src="${s.thumbnail}" data-preview="${i}">`
        : `<div class="sb-slot-thumb-ph"><img src="data:image/jpeg;base64,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" style="width:28px;height:28px;border-radius:8px;display:block;"></div>`}
        <div class="sb-slot-info">
          <div class="sb-slot-name">${esc(s.name)}</div>
          <div class="sb-slot-meta">
            <span class="sb-badge ${getPlatformClass(s.platform)}" style="font-size:10px;padding:1px 5px">${s.platform}</span>
            ${s.price ? `<span class="sb-slot-price"> ${esc(s.price.slice(0, 20))}</span>` : ''}
          </div>
          <div class="sb-slot-meta" style="margin-top:2px;font-size:10px;color:var(--text3)">${s.capturedAt}</div>
        </div>
        <div class="sb-slot-actions">
          <button class="sb-slot-btn" data-preview="${i}">🔍</button>
          <button class="sb-slot-btn del" data-delete="${i}">✕</button>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('[data-preview]').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = slots[parseInt(btn.dataset.preview)];
        if (s?.imageData) {
          document.getElementById('sb-preview-img').src = s.imageData;
          document.getElementById('sb-preview').classList.add('show');
        }
      });
    });
    el.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        slots.splice(parseInt(btn.dataset.delete), 1);
        await saveSlots(); renderSlots(); updateSlotCount(); updatePageInfo();
      });
    });
  }

  function getPlatformClass(p) {
    if (p === 'Shopee') return 'sb-badge-shopee';
    if (p === 'Lazada') return 'sb-badge-lazada';
    if (p === 'Tiki') return 'sb-badge-tiki';
    return 'sb-badge-other';
  }

  function updateSlotCount() {
    document.getElementById('sb-slot-count').textContent = slots.length;
    const badge = document.getElementById('sb-tab-badge');
    badge.textContent = slots.length;
    badge.style.display = slots.length > 0 ? 'inline-flex' : 'none';
  }

  document.getElementById('sb-preview-close').addEventListener('click', () => {
    document.getElementById('sb-preview').classList.remove('show');
  });

  // ============================================================
  // CHAT
  // ============================================================
  document.getElementById('sb-send').addEventListener('click', sendMsg);
  document.getElementById('sb-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  });
  document.getElementById('sb-input').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });
  document.querySelectorAll('.sb-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('sb-input').value = btn.dataset.q;
      document.querySelectorAll('.sb-tab')[1].click();
      sendMsg();
    });
  });

  async function sendMsg() {
    const input = document.getElementById('sb-input');
    const text = input.value.trim();
    if (!text || isLoading) return;
    input.value = ''; input.style.height = 'auto';
    document.querySelectorAll('.sb-tab')[1].click();
    addUserMsg(text);
    chatHistory.push({ role: 'user', content: text });
    saveChatHistory();

    if (slots.length === 0) {
      const r = 'Bạn chưa chụp sản phẩm nào! Hãy mở trang sản phẩm và bấm "Chụp trang này".';
      addBotMsg(r); chatHistory.push({ role: 'assistant', content: r }); saveChatHistory(); return;
    }

    isLoading = true;
    document.getElementById('sb-send').disabled = true;
    const typing = showTyping();

    try {
      const parts = [];
      let ctx = '=== THÔNG TIN SẢN PHẨM ===\n';
      slots.forEach((s, i) => {
        ctx += `\nSP${i + 1}: ${s.name}\nSàn: ${s.platform}\n`;
        if (s.price) ctx += `Giá: ${s.price}\n`;
        if (s.rating) ctx += `Số sao: ${s.rating}\n`;
        if (s.reviewCount) ctx += `Lượt đánh giá: ${s.reviewCount}\n`;
        if (s.sold) ctx += `Đã bán: ${s.sold}\n`;
        if (s.variants) ctx += `${s.variants}\n`;
        ctx += `URL: ${s.url}\n`;
      });
      parts.push({ type: 'text', text: ctx });

      if (!window._sbImgSent) {
        slots.forEach(s => {
          if (s.imageData?.startsWith('data:image')) {
            const base64 = s.imageData.split(',')[1];
            const mime = s.imageData.includes('jpeg') ? 'image/jpeg' : 'image/png';
            parts.push({ type: 'image', source: { type: 'base64', media_type: mime, data: base64 } });
          }
        });
        window._sbImgSent = true;
      }
      parts.push({ type: 'text', text });

      const model = document.getElementById('sb-model-select').value;

      const res = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'call_claude',
          payload: {
            model,
            system: `Bạn là ShopBot - trợ lý so sánh sản phẩm chuyên nghiệp trên Shopee, Lazada, Tiki...

BƯỚC 1 - Phân tích TỪNG sản phẩm:
━━━ SẢN PHẨM [số]: [Tên] ━━━
💰 Giá: [giá]
⭐ Đánh giá: [sao] ([lượt])
📦 Đã bán: [số lượng]
🏪 Shop: [tên + Mall/thường]
✅ Ưu điểm: [ít nhất 3 điểm]
❌ Nhược điểm: [ít nhất 2 điểm]

Chấm điểm CỐ ĐỊNH:
💰 Giá cả: [X/2]
⭐ Đánh giá người mua: [X/2]
📦 Độ tin cậy: [X/2]

Chấm điểm ĐỘNG (chỉ khi thấy trong ảnh):
- Thấy chất liệu/vải → 🧵 Chất liệu: [X/1]
- Thấy thông số kỹ thuật → ⚙️ Thông số: [X/2]
- Thấy bảo hành → 🛡️ Bảo hành: [X/1]
- Thấy size/kích thước rõ → 📐 Size: [X/1]
- Thấy thành phần → 🧪 Thành phần: [X/1]
- Thấy công suất/điện năng → ⚡ Công suất: [X/1]
🎯 Tổng: [X/tổng thang]

BƯỚC 2 - So sánh & Kết luận:
━━━ KẾT LUẬN ━━━
🏆 ShopBot gợi ý: [Tên sản phẩm]
Lý do: [giải thích ngắn gọn]
⚠️ Lưu ý: [size, màu, liên hệ shop...]

💬 Đây chỉ là gợi ý tham khảo dựa trên thông tin hiển thị — bạn mới là người hiểu rõ nhu cầu và đưa ra quyết định cuối cùng!

QUAN TRỌNG: KHÔNG dùng markdown. Trả lời bằng tiếng Việt.`,
            messages: [
              ...chatHistory.slice(0, -1).slice(-6).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: parts }
            ]
          }
        }, res => {
          if (res?.error) reject(new Error(res.error));
          else resolve(res);
        });
      });

      typing.remove();
      addBotMsg(fmt(res.text));
      chatHistory.push({ role: 'assistant', content: res.text });
      saveChatHistory();
    } catch (err) {
      typing.remove();
      addBotMsg(`❌ Lỗi: ${err.message}`);
    } finally {
      isLoading = false;
      document.getElementById('sb-send').disabled = false;
    }
  }

  function fmt(t) {
    return t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  }
  function addUserMsg(text) {
    const c = document.getElementById('sb-messages');
    const d = document.createElement('div');
    d.className = 'sb-msg user';
    d.innerHTML = `<div class="sb-avatar usr">U</div><div class="sb-bubble">${esc(text)}</div>`;
    c.appendChild(d); c.scrollTop = c.scrollHeight;
  }
  function addBotMsg(html) {
    const c = document.getElementById('sb-messages');
    const d = document.createElement('div');
    d.className = 'sb-msg bot';
    d.innerHTML = `<div class="sb-avatar bot">S</div><div class="sb-bubble">${html}</div>`;
    c.appendChild(d); c.scrollTop = c.scrollHeight;
  }
  function showTyping() {
    const c = document.getElementById('sb-messages');
    const d = document.createElement('div');
    d.className = 'sb-msg bot';
    d.innerHTML = `<div class="sb-avatar bot">S</div><div class="sb-typing"><div class="sb-dot"></div><div class="sb-dot"></div><div class="sb-dot"></div></div>`;
    c.appendChild(d); c.scrollTop = c.scrollHeight;
    return d;
  }

  // ============================================================
  // SETTINGS
  // ============================================================
  document.getElementById('sb-model-select').addEventListener('change', function () {
    chrome.storage.local.set({ shopbot_model: this.value });
  });
  document.getElementById('sb-btn-clear').addEventListener('click', async () => {
    if (!confirm('Xóa tất cả sản phẩm đã lưu?')) return;
    slots = []; await saveSlots(); renderSlots(); updateSlotCount(); updatePageInfo();
    window._sbImgSent = false; chatHistory = []; saveChatHistory();
    document.getElementById('sb-messages').innerHTML = '';
    addBotMsg('🗑️ Đã xóa tất cả. Bạn có thể thêm sản phẩm mới!');
  });
  document.getElementById('sb-btn-reload').addEventListener('click', async () => {
    if (!confirm('Reset toàn bộ? Tất cả sản phẩm và lịch sử chat sẽ bị xóa.')) return;
    await chrome.storage.local.clear();
    slots = []; chatHistory = []; window._sbImgSent = false;
    renderSlots(); updateSlotCount(); updatePageInfo();
    document.getElementById('sb-messages').innerHTML = '';
    addBotMsg('🔄 Đã reset toàn bộ. Bạn có thể bắt đầu lại!');
    // Chuyển về tab Chụp
    document.querySelectorAll('.sb-tab')[0].click();
  });

  // ============================================================
  // THEME
  // ============================================================
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    document.querySelectorAll('.sb-theme-card').forEach(d => {
      d.classList.toggle('active', d.dataset.t === t);
    });
    chrome.storage.local.set({ shopbot_theme: t });
  }
  document.querySelectorAll('.sb-theme-card').forEach(card => {
    card.addEventListener('click', () => applyTheme(card.dataset.t));
  });
  chrome.storage.local.get(['shopbot_theme'], res => {
    applyTheme(res.shopbot_theme || 'bright');
  });


  async function loadSlots() {
    return new Promise(r => chrome.storage.local.get(['shopbot_slots'], res => { slots = res.shopbot_slots || []; r(); }));
  }
  async function saveSlots() {
    return new Promise(r => chrome.storage.local.set({ shopbot_slots: slots }, r));
  }
  function saveChatHistory() {
    chrome.storage.local.set({ shopbot_chat: chatHistory.map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : '[ảnh]' })) });
  }
  async function loadChatHistory() {
    return new Promise(r => chrome.storage.local.get(['shopbot_chat'], res => {
      if (res.shopbot_chat?.length > 0) {
        chatHistory = res.shopbot_chat;
        const c = document.getElementById('sb-messages');
        c.innerHTML = '';
        chatHistory.forEach(m => m.role === 'user' ? addUserMsg(m.content) : addBotMsg(fmt(m.content)));
      }
      r();
    }));
  }
  async function loadModel() {
    chrome.storage.local.get(['shopbot_model'], res => {
      if (res.shopbot_model) document.getElementById('sb-model-select').value = res.shopbot_model;
    });
  }

  // ============================================================
  // UTILS
  // ============================================================
  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

})();