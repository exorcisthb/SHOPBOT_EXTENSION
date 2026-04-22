// popup.js - Logic chính của popup extension

const MAX_SLOTS = 5;
let slots = []; // Mảng chứa các sản phẩm đã chụp
let chatHistory = [];
let isLoading = false;

// ========================
// INIT
// ========================
document.addEventListener('DOMContentLoaded', async () => {
  await loadSlots();
  await loadChatHistory();
  await updateCurrentPageInfo();
  renderSlots();
  updateSlotCount();
  setupEventListeners();
});

// ========================
// TAB NAVIGATION
// ========================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`view-${tab.dataset.tab}`).classList.add('active');
  });
});

// ========================
// EVENT LISTENERS
// ========================
function setupEventListeners() {
  // Capture button
  document.getElementById('btn-capture').addEventListener('click', handleCapture);

  // Refresh page info
  document.getElementById('btn-refresh-page').addEventListener('click', updateCurrentPageInfo);

  // Chat send
  document.getElementById('btn-send').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  document.getElementById('chat-input').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });

  // Quick buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('chat-input').value = btn.dataset.q;
      sendMessage();
      // Switch to chat tab if not there
      document.querySelectorAll('.tab')[1].click();
    });
  });

  // Settings
  document.getElementById('btn-clear-all').addEventListener('click', clearAllSlots);
  document.getElementById('btn-reload-ext').addEventListener('click', () => {
    if (!confirm('Reload extension sẽ xóa toàn bộ sản phẩm và lịch sử chat. Tiếp tục?')) return;
    chrome.storage.local.clear(() => {
      chrome.runtime.reload();
    });
  });

  // Preview overlay
  document.getElementById('preview-close').addEventListener('click', () => {
    document.getElementById('preview-overlay').classList.remove('show');
  });
}

// ========================
// PAGE INFO
// ========================
async function updateCurrentPageInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const url = tab.url || '';
    const title = tab.title || '';

    let platform = 'Web';
    let badgeClass = 'badge-other';

    if (url.includes('shopee.vn')) { platform = 'Shopee'; badgeClass = 'badge-shopee'; }
    else if (url.includes('lazada.vn')) { platform = 'Lazada'; badgeClass = 'badge-lazada'; }
    else if (url.includes('tiki.vn')) { platform = 'Tiki'; badgeClass = 'badge-tiki'; }
    else {
      try { platform = new URL(url).hostname.replace('www.', ''); } catch(e) {}
    }

    const badge = document.getElementById('platform-badge');
    badge.className = `platform-badge ${badgeClass}`;
    badge.textContent = platform;

    const titleEl = document.getElementById('page-title');
    titleEl.textContent = title || url;
    titleEl.style.color = '';

    const captureBtn = document.getElementById('btn-capture');
    captureBtn.disabled = slots.length >= MAX_SLOTS;
    if (slots.length >= MAX_SLOTS) {
      document.getElementById('btn-capture-text').textContent = 'Đã đủ 5 sản phẩm';
    } else {
      document.getElementById('btn-capture-text').textContent = 'Chụp trang này';
    }

    // Store current tab info
    window._currentTab = { tab, platform, url, title };
  } catch (e) {
    console.error('updateCurrentPageInfo error:', e);
  }
}

// ========================
// CAPTURE
// ========================
async function handleCapture() {
  if (!window._currentTab?.url) return;
  if (slots.length >= MAX_SLOTS) {
    addBotMessage('Đã đủ 5 sản phẩm rồi! Hãy xóa bớt rồi thêm mới.');
    return;
  }

  const btn = document.getElementById('btn-capture');
  btn.disabled = true;
  document.getElementById('btn-capture-text').textContent = 'Đang chụp...';

  const progressEl = document.getElementById('capture-progress');
  progressEl.style.display = 'block';

  // Lắng nghe progress từ content script
  const progressListener = (msg) => {
    if (msg.action === 'capture_progress') {
      document.getElementById('progress-fill').style.width = msg.progress + '%';
      document.getElementById('progress-text').textContent = msg.status;
    }
  };
  chrome.runtime.onMessage.addListener(progressListener);

  try {
    const tabId = window._currentTab.tab.id;

    // Ping content script, inject nếu chưa có
    let pingOk = false;
    try {
      pingOk = await new Promise(resolve => {
        chrome.tabs.sendMessage(tabId, { action: 'ping' }, res => {
          resolve(res?.ok === true);
        });
      });
    } catch (e) {}

    if (!pingOk) {
      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content_script.js']
      });
      await sleep(600);
    }

    // Bắt đầu capture
    const result = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, { action: 'capture_page' }, (res) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(res);
      });
    });

    if (result?.error) throw new Error(result.error);
    if (!result?.success) throw new Error('Capture thất bại');

    // Tạo thumbnail từ ảnh đã chụp
    const thumbnail = await createThumbnail(result.imageData, 88, 88);

    // Lưu vào slot
    const slot = {
      id: Date.now(),
      platform: result.productInfo.platform,
      name: result.productInfo.title || window._currentTab.title,
      price: result.productInfo.price || '',
      rating: result.productInfo.rating || '',
      sold: result.productInfo.sold || '',
      url: result.productInfo.url,
      capturedAt: result.productInfo.capturedAt,
      imageData: result.imageData,
      thumbnail: thumbnail,
      segments: result.segments
    };

    slots.push(slot);
    await saveSlots();
    renderSlots();
    updateSlotCount();

    // Thông báo trong chat
    addBotMessage(`✅ Đã lưu <strong>${slot.name.slice(0, 40)}${slot.name.length > 40 ? '...' : ''}</strong> (${slot.platform}).<br>Còn ${MAX_SLOTS - slots.length} slot trống.`);

    // Update nút
    document.getElementById('btn-capture-text').textContent = slots.length >= MAX_SLOTS ? 'Đã đủ 5 sản phẩm' : 'Chụp trang này';
    btn.disabled = slots.length >= MAX_SLOTS;

  } catch (err) {
    addBotMessage(`❌ Lỗi khi chụp: ${err.message}`);
    document.getElementById('btn-capture-text').textContent = 'Chụp trang này';
    btn.disabled = false;
  } finally {
    chrome.runtime.onMessage.removeListener(progressListener);
    document.getElementById('progress-fill').style.width = '0%';
    progressEl.style.display = 'none';
  }
}

// Tạo thumbnail nhỏ từ ảnh lớn
async function createThumbnail(dataUrl, w, h) {
  return new Promise(resolve => {
    if (!dataUrl) { resolve(''); return; }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      // Crop center
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

// ========================
// SLOTS RENDER
// ========================
function renderSlots() {
  const container = document.getElementById('slots-list');
  if (slots.length === 0) {
    container.innerHTML = `
      <div class="empty-slots">
        <div class="empty-icon">📦</div>
        Chưa có sản phẩm nào.<br>Mở trang SP và bấm Chụp để thêm.
      </div>`;
    return;
  }

  container.innerHTML = slots.map((slot, i) => `
    <div class="slot-item">
      ${slot.thumbnail
        ? `<img class="slot-thumb" src="${slot.thumbnail}" alt="thumb" data-preview="${i}" style="cursor:pointer">`
        : `<div class="slot-thumb-placeholder">🛍️</div>`}
      <div class="slot-info">
        <div class="slot-name">${escHtml(slot.name)}</div>
        <div class="slot-meta">
          <span class="platform-badge ${getPlatformBadgeClass(slot.platform)}" style="font-size:10px;padding:1px 5px">${slot.platform}</span>
          ${slot.price ? `<span class="slot-price"> ${escHtml(slot.price.slice(0,20))}</span>` : ''}
          ${slot.rating ? ` · ${escHtml(slot.rating.slice(0,10))}` : ''}
        </div>
        <div class="slot-meta" style="margin-top:2px;font-size:10px;color:var(--text3)">${slot.capturedAt}</div>
      </div>
      <div class="slot-actions">
        <button class="slot-btn" title="Xem ảnh" data-preview="${i}">🔍</button>
        <button class="slot-btn delete" title="Xóa" data-delete="${i}">✕</button>
      </div>
    </div>
  `).join('');

  // Preview buttons
  container.querySelectorAll('[data-preview]').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.preview);
      if (slots[idx]?.imageData) {
        document.getElementById('preview-img').src = slots[idx].imageData;
        document.getElementById('preview-overlay').classList.add('show');
      }
    });
  });

  // Delete buttons
  container.querySelectorAll('[data-delete]').forEach(el => {
    el.addEventListener('click', async () => {
      const idx = parseInt(el.dataset.delete);
      slots.splice(idx, 1);
      await saveSlots();
      renderSlots();
      updateSlotCount();
      await updateCurrentPageInfo();
    });
  });
}

function getPlatformBadgeClass(platform) {
  if (platform === 'Shopee') return 'badge-shopee';
  if (platform === 'Lazada') return 'badge-lazada';
  if (platform === 'Tiki') return 'badge-tiki';
  return 'badge-other';
}

function updateSlotCount() {
  document.getElementById('slot-count').textContent = slots.length;
  const badge = document.getElementById('slot-count-badge');
  if (slots.length > 0) {
    badge.textContent = slots.length;
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}

// ========================
// CHAT
// ========================
async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || isLoading) return;

  input.value = '';
  input.style.height = 'auto';

  // Switch to chat tab
  document.querySelectorAll('.tab')[1].click();

  addUserMessage(text);
  chatHistory.push({ role: 'user', content: text });
  saveChatHistory();

  if (slots.length === 0) {
    const reply = 'Bạn chưa chụp sản phẩm nào! Hãy mở trang sản phẩm trên Shopee/Lazada/Tiki và bấm "Chụp trang này".';
    addBotMessage(reply);
    chatHistory.push({ role: 'assistant', content: reply });
    saveChatHistory();
    return;
  }

  isLoading = true;
  document.getElementById('btn-send').disabled = true;
  const typingEl = showTyping();

  try {
    const userContentParts = [];

    // Luôn gửi kèm thông tin text sản phẩm ở mọi câu hỏi
    if (slots.length > 0) {
      let productContext = '=== THÔNG TIN SẢN PHẨM ĐÃ LƯU ===\n';
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        productContext += `\nSẢN PHẨM ${i + 1}: ${slot.name}\n`;
        productContext += `Sàn: ${slot.platform}\n`;
        productContext += `Giá: ${slot.price || 'N/A'}\n`;
        productContext += `Đánh giá: ${slot.rating || 'N/A'}\n`;
        productContext += `Đã bán: ${slot.sold || 'N/A'}\n`;
        productContext += `URL: ${slot.url}\n`;
      }
      userContentParts.push({ type: 'text', text: productContext });
    }

    // Gửi ảnh chỉ lần đầu trong session
    if (!window._imagesSentToAPI) {
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (slot.imageData && slot.imageData.startsWith('data:image')) {
          const base64 = slot.imageData.split(',')[1];
          const mediaType = slot.imageData.includes('jpeg') ? 'image/jpeg' : 'image/png';
          userContentParts.push({
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 }
          });
        }
      }
      window._imagesSentToAPI = true;
    }

    userContentParts.push({ type: 'text', text: text });

    const systemPrompt = `Bạn là ShopBot - trợ lý so sánh sản phẩm chuyên nghiệp, giúp người dùng ra quyết định mua hàng chính xác trên Shopee, Lazada, Tiki.

Bạn sẽ nhận ảnh chụp màn hình đầy đủ của từng trang sản phẩm. Hãy đọc kỹ ảnh để lấy thông tin thực tế.

NHIỆM VỤ - Phân tích TỪNG sản phẩm theo đúng cấu trúc sau:

━━━ SẢN PHẨM [số]: [Tên sản phẩm] ━━━
💰 Giá: [giá thực tế từ ảnh]
⭐ Đánh giá: [số sao] ([số lượt đánh giá])
📦 Đã bán: [số lượng]
🏪 Shop: [tên shop + trạng thái uy tín nếu có]
📋 Thông số nổi bật: [chất liệu, kích thước, màu sắc, đặc điểm...]
✅ Ưu điểm: [liệt kê rõ ít nhất 3 điểm]
❌ Nhược điểm: [liệt kê rõ ít nhất 2 điểm]
🎯 Điểm tổng: [X/10]
   - Giá cả: [X/2]
   - Chất lượng/Thông số: [X/3]
   - Đánh giá người mua: [X/2]
   - Độ uy tín shop: [X/1.5]
   - Giá trị đồng tiền: [X/1.5]

Sau khi phân tích xong TẤT CẢ sản phẩm, đưa ra:

━━━ BẢNG SO SÁNH NHANH ━━━
[So sánh các tiêu chí chính giữa các sản phẩm dạng text]

━━━ QUYẾT ĐỊNH CUỐI CÙNG ━━━
🏆 Nên mua: [Tên sản phẩm cụ thể]
Lý do: [Giải thích rõ ràng tại sao chọn cái này, không chọn cái kia]
⚠️ Lưu ý khi mua: [những điều cần chú ý như size, màu, liên hệ shop...]

QUAN TRỌNG:
- KHÔNG dùng markdown (#, ##, **, *, ---)
- Chỉ dùng text thuần + emoji + ━ để trang trí
- Phân tích ĐẦY ĐỦ tất cả sản phẩm, KHÔNG cắt ngắn
- Dựa vào thông tin THỰC TẾ từ ảnh, không bịa
- Trả lời bằng tiếng Việt`;

    // Gọi Claude API qua background
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'call_claude',
        payload: {
          system: systemPrompt,
          messages: [
            // Chỉ giữ 6 tin nhắn gần nhất để tránh ngốn token
            ...chatHistory.slice(0, -1).slice(-6).map(m => ({
              role: m.role,
              content: m.content
            })),
            {
              role: 'user',
              content: userContentParts
            }
          ]
        }
      }, (res) => {
        if (res?.error) reject(new Error(res.error));
        else resolve(res);
      });
    });

    typingEl.remove();
    addBotMessage(formatBotResponse(response.text));
    chatHistory.push({ role: 'assistant', content: response.text });
    saveChatHistory();

  } catch (err) {
    typingEl.remove();
    addBotMessage(`❌ Lỗi: ${err.message}`);
  } finally {
    isLoading = false;
    document.getElementById('btn-send').disabled = false;
  }
}

function formatBotResponse(text) {
  // Convert markdown-like to HTML
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function addUserMessage(text) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg user';
  div.innerHTML = `
    <div class="msg-avatar user-av">U</div>
    <div class="msg-bubble">${escHtml(text)}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function addBotMessage(html) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.innerHTML = `
    <div class="msg-avatar bot">S</div>
    <div class="msg-bubble">${html}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.innerHTML = `
    <div class="msg-avatar bot">S</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

// ========================
// STORAGE
// ========================
async function loadSlots() {
  return new Promise(resolve => {
    chrome.storage.local.get(['shopbot_slots'], (result) => {
      slots = result.shopbot_slots || [];
      resolve();
    });
  });
}

async function saveSlots() {
  return new Promise(resolve => {
    chrome.storage.local.set({ shopbot_slots: slots }, resolve);
  });
}

async function clearAllSlots() {
  if (!confirm('Xóa tất cả sản phẩm đã lưu?')) return;
  slots = [];
  await saveSlots();
  renderSlots();
  updateSlotCount();
  await updateCurrentPageInfo();
  // Reset chat
  window._imagesSentToAPI = false;
  chatHistory = [];
  saveChatHistory();
  const container = document.getElementById('chat-messages');
  container.innerHTML = '';
  addBotMessage('🗑️ Đã xóa tất cả sản phẩm và lịch sử chat. Bạn có thể thêm mới!');
}

// ========================
// CHAT HISTORY STORAGE
// ========================
function saveChatHistory() {
  // Chỉ lưu text, không lưu ảnh để tránh vượt giới hạn storage
  const toSave = chatHistory.map(m => ({
    role: m.role,
    content: typeof m.content === 'string' ? m.content : '[ảnh sản phẩm]'
  }));
  chrome.storage.local.set({ shopbot_chat: toSave });
}

async function loadChatHistory() {
  return new Promise(resolve => {
    chrome.storage.local.get(['shopbot_chat'], (result) => {
      if (result.shopbot_chat && result.shopbot_chat.length > 0) {
        chatHistory = result.shopbot_chat;
        // Render lại các tin nhắn đã lưu
        const container = document.getElementById('chat-messages');
        // Xóa tin nhắn chào mặc định
        container.innerHTML = '';
        chatHistory.forEach(m => {
          if (m.role === 'user') {
            addUserMessage(m.content);
          } else {
            addBotMessage(formatBotResponse(m.content));
          }
        });
      }
      resolve();
    });
  });
}

// ========================
// UTILS
// ========================
function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}