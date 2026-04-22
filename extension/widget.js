// widget.js - ShopBot floating widget

(function() {
  if (document.getElementById('shopbot-root')) return;

  // ============================================================
  // STYLES
  // ============================================================
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700&family=Inter:wght@400;500&display=swap');

    #shopbot-root {
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
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: var(--text);
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
      background: #2a2a35;
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
      box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,106,247,0.1);
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
      background: linear-gradient(135deg, var(--accent), #a78bfa);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
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
    .sb-settings { padding: 14px; flex: 1; overflow-y: auto; }
    .sb-settings-section { margin-bottom: 20px; }
    .sb-settings-label {
      font-size: 11px; color: var(--text3);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
    }
    .sb-select {
      width: 100%; background: var(--bg2); border: 1px solid var(--border);
      border-radius: 10px; padding: 9px 12px;
      color: var(--text); font-size: 13px; outline: none;
      font-family: 'Inter', sans-serif; cursor: pointer; transition: border-color 0.15s;
    }
    .sb-select:focus { border-color: var(--accent); }
    .sb-select option { background: #1a1a22; }
    .sb-btn-danger {
      width: 100%; padding: 9px; background: transparent;
      border: 1px solid rgba(248,113,113,0.28); border-radius: 10px;
      color: var(--red); font-size: 12px; cursor: pointer;
      transition: all 0.15s; font-family: 'Inter', sans-serif;
    }
    .sb-btn-danger:hover { background: rgba(248,113,113,0.08); }
    .sb-btn-dev {
      width: 100%; padding: 9px; background: transparent;
      border: 1px solid rgba(167,139,250,0.28); border-radius: 10px;
      color: #a78bfa; font-size: 12px; cursor: pointer; margin-top: 8px;
      transition: all 0.15s; font-family: 'Inter', sans-serif;
    }
    .sb-btn-dev:hover { background: rgba(167,139,250,0.08); }
    .sb-support-info {
      font-size: 12px; color: var(--text2); line-height: 1.9;
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
  root.innerHTML = `
    <button id="sb-fab" title="ShopBot AI">
      🛍️
      <div id="sb-fab-badge"></div>
      <div id="sb-fab-close" title="Ẩn ShopBot">✕</div>
    </button>

    <div id="sb-panel">
      <!-- Header -->
      <div class="sb-header">
        <div class="sb-logo">
          <div class="sb-logo-icon">🛍️</div>
          <span class="sb-logo-name">ShopBot</span>
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
        <div class="sb-slots-header">Sản phẩm đã lưu (<span id="sb-slot-count">0</span>/5)</div>
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
            <div class="sb-settings-label">Model AI</div>
            <select class="sb-select" id="sb-model-select">
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Nhanh)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Mạnh hơn)</option>
              <option value="Gemma 3-12b-it">Gemma 3-12b-it</option>
            </select>
          </div>
          <div class="sb-settings-section">
            <div class="sb-settings-label">Dữ liệu</div>
            <button class="sb-btn-danger" id="sb-btn-clear">🗑️ Xóa tất cả sản phẩm đã lưu</button>
          </div>
          <div class="sb-settings-section">
            <div class="sb-settings-label">Developer</div>
            <button class="sb-btn-dev" id="sb-btn-reload">🔄 Reload Extension</button>
          </div>
          <div class="sb-settings-section">
            <div class="sb-settings-label">Hỗ trợ sàn</div>
            <div class="sb-support-info">
              ✅ Shopee (shopee.vn)<br>
              ✅ Lazada (lazada.vn)<br>
              ✅ Tiki (tiki.vn)<br>
              ⚠️ Trang khác có thể không capture đầy đủ
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
  const MAX_SLOTS = 5;
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
  const fab   = document.getElementById('sb-fab');
  const panel = document.getElementById('sb-panel');

  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    fab.classList.toggle('open', isOpen);
    document.getElementById('sb-fab-badge').style.display = 'none';
    if (isOpen) updatePageInfo();
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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
    const url   = window.location.href;
    const title = document.title || '';
    let platform = 'Web', badgeClass = 'sb-badge-other';
    if      (url.includes('shopee.vn'))  { platform = 'Shopee'; badgeClass = 'sb-badge-shopee'; }
    else if (url.includes('lazada.vn'))  { platform = 'Lazada'; badgeClass = 'sb-badge-lazada'; }
    else if (url.includes('tiki.vn'))    { platform = 'Tiki';   badgeClass = 'sb-badge-tiki'; }
    else { try { platform = new URL(url).hostname.replace('www.', ''); } catch(e){} }

    const badge = document.getElementById('sb-platform-badge');
    badge.className = `sb-badge ${badgeClass}`;
    badge.textContent = platform;
    document.getElementById('sb-page-title').textContent = title || url;

    const btn = document.getElementById('sb-btn-capture');
    btn.disabled = slots.length >= MAX_SLOTS;
    document.getElementById('sb-btn-capture-text').textContent =
      slots.length >= MAX_SLOTS ? 'Đã đủ 5 sản phẩm' : 'Chụp trang này';
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
      } catch(e) {}

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
      addBotMsg(`✅ Đã lưu <strong>${slot.name.slice(0,40)}${slot.name.length>40?'...':''}</strong> (${slot.platform})`);

      const fabBadge = document.getElementById('sb-fab-badge');
      fabBadge.textContent = slots.length;
      fabBadge.style.display = 'inline-flex';
    } catch(err) {
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
        let sx=0, sy=0, sw=img.width, sh=img.height;
        if (aspect > 1) { sw = img.height; sx = (img.width-sw)/2; }
        else             { sh = img.width;  sy = (img.height-sh)/2; }
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
          : `<div class="sb-slot-thumb-ph">🛍️</div>`}
        <div class="sb-slot-info">
          <div class="sb-slot-name">${esc(s.name)}</div>
          <div class="sb-slot-meta">
            <span class="sb-badge ${getPlatformClass(s.platform)}" style="font-size:10px;padding:1px 5px">${s.platform}</span>
            ${s.price ? `<span class="sb-slot-price"> ${esc(s.price.slice(0,20))}</span>` : ''}
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
    if (p==='Shopee') return 'sb-badge-shopee';
    if (p==='Lazada') return 'sb-badge-lazada';
    if (p==='Tiki')   return 'sb-badge-tiki';
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
  document.getElementById('sb-input').addEventListener('input', function() {
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
    const text  = input.value.trim();
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
        ctx += `\nSP${i+1}: ${s.name}\nSàn: ${s.platform}\nGiá: ${s.price||'N/A'}\nĐánh giá: ${s.rating||'N/A'}\nURL: ${s.url}\n`;
      });
      parts.push({ type: 'text', text: ctx });

      if (!window._sbImgSent) {
        slots.forEach(s => {
          if (s.imageData?.startsWith('data:image')) {
            const base64 = s.imageData.split(',')[1];
            const mime   = s.imageData.includes('jpeg') ? 'image/jpeg' : 'image/png';
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
            system: `Bạn là ShopBot - trợ lý so sánh sản phẩm chuyên nghiệp trên Shopee, Lazada, Tiki. Phân tích ảnh chụp màn hình sản phẩm và đưa ra tư vấn mua hàng chính xác. Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu. KHÔNG dùng markdown.`,
            messages: [
              ...chatHistory.slice(0,-1).slice(-6).map(m => ({ role: m.role, content: m.content })),
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
    } catch(err) {
      typing.remove();
      addBotMsg(`❌ Lỗi: ${err.message}`);
    } finally {
      isLoading = false;
      document.getElementById('sb-send').disabled = false;
    }
  }

  function fmt(t) {
    return t.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
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
  document.getElementById('sb-model-select').addEventListener('change', function() {
    chrome.storage.local.set({ shopbot_model: this.value });
  });
  document.getElementById('sb-btn-clear').addEventListener('click', async () => {
    if (!confirm('Xóa tất cả sản phẩm đã lưu?')) return;
    slots = []; await saveSlots(); renderSlots(); updateSlotCount(); updatePageInfo();
    window._sbImgSent = false; chatHistory = []; saveChatHistory();
    document.getElementById('sb-messages').innerHTML = '';
    addBotMsg('🗑️ Đã xóa tất cả. Bạn có thể thêm sản phẩm mới!');
  });
  document.getElementById('sb-btn-reload').addEventListener('click', () => {
    if (!confirm('Reload extension sẽ xóa toàn bộ sản phẩm và lịch sử chat. Tiếp tục?')) return;
    chrome.storage.local.clear(() => {
      chrome.runtime.sendMessage({ action: 'reload_extension' });
    });
  });

  // ============================================================
  // STORAGE
  // ============================================================
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
  function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

})();