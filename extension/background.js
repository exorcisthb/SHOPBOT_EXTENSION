// background.js - Service worker

const PROXY_URL = 'https://shopbot-ai-fhss.onrender.com';
const EXTENSION_SECRET = '69fde1581c521688a0ce3855023d5440';

// Toggle widget when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  console.log('🔵 Icon clicked on tab:', tab.id);
  chrome.tabs.sendMessage(tab.id, { action: 'toggle_widget' }, (res) => {
    if (chrome.runtime.lastError) {
      console.log('⚠️ Content script not loaded, injecting widget.js...');
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['widget.js']
      }).then(() => console.log('✅ Widget injected')).catch(err => console.error('❌ Error:', err));
    } else {
      console.log('✅ Toggle message sent');
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.action === 'capture_tab') {
    chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 85 }, (dataUrl) => {
      if (chrome.runtime.lastError) sendResponse(null);
      else sendResponse(dataUrl);
    });
    return true;
  }

 if (msg.action === 'inject_and_capture') {
  const tabId = msg.tabId || sender.tab?.id;
  setTimeout(() => {
    chrome.tabs.sendMessage(tabId, { action: 'capture_page' }, res => sendResponse(res));
  }, 200);
  return true;
}

  if (msg.action === 'call_claude') {
    callAPI(msg.payload).then(r => sendResponse(r)).catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (msg.action === 'save_api_key') {
    chrome.storage.local.set({ anthropic_api_key: msg.key }, () => sendResponse({ ok: true }));
    return true;
  }

  if (msg.action === 'get_api_key') {
    chrome.storage.local.get(['anthropic_api_key'], res => sendResponse({ key: res.anthropic_api_key || '' }));
    return true;
  }
});

async function callAPI(payload) {
  const response = await fetch(`${PROXY_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-extension-secret': EXTENSION_SECRET
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || `Server lỗi ${response.status}`);
  }
  return await response.json();
}