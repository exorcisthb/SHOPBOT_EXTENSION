// content_script.js - Chạy trong trang sản phẩm, xử lý cuộn + chụp màn hình

let isCapturing = false;

// Lắng nghe message từ popup/background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'capture_page') {
    if (isCapturing) {
      sendResponse({ error: 'Đang chụp, vui lòng chờ...' });
      return;
    }
    captureFullPage().then(result => sendResponse(result)).catch(err => sendResponse({ error: err.message }));
    return true; // async
  }

  if (msg.action === 'extract_info') {
    const info = extractProductInfo();
    sendResponse(info);
  }

  if (msg.action === 'ping') {
    sendResponse({ ok: true });
  }
});

// Trích xuất thông tin sản phẩm từ DOM
function extractProductInfo() {
  const url = window.location.href;
  let platform = 'unknown';
  if (url.includes('shopee.vn')) platform = 'Shopee';
  else if (url.includes('lazada.vn')) platform = 'Lazada';
  else if (url.includes('tiki.vn')) platform = 'Tiki';
  else if (url.includes('sendo.vn')) platform = 'Sendo';
  else if (url.includes('amazon.')) platform = 'Amazon';
  else if (url.includes('ebay.')) platform = 'eBay';
  else {
    // Lấy tên domain làm platform
    try { platform = new URL(url).hostname.replace('www.', ''); } catch(e) {}
  }

  const title = document.title || '';

  // Selectors cho từng sàn
  const selectors = {
    price: [
      // Shopee 2026
      '.IZPeQz',
      // Shopee cũ
      '._3n5NQx', '.pqTWkA',
      // Shopee generic
      '[class*="mainPrice"]', '[class*="main-price"]',
      '[class*="price--main"]', '[class*="finalPrice"]',
      '[class*="sale-price"]', '[class*="salePrice"]',
      // Lazada
      '.pdp-price_type_normal', '.pdp-price', '.price-box',
      // Tiki
      '.product-price__current-price', '.product-price',
      // Fallback
      '[class*="price"]:not([class*="original"]):not([class*="label"]):not([class*="tag"])'
    ],
    rating: [
      '[class*="rating-stars__stars"]', '[class*="shopee-rating-stars"]',
      '[class*="rating--number"]', '[class*="ratingCount"]',
      '.pdp-review-summary__overall-rating',
      '.review-rating__point',
      '[class*="rating"]', '[class*="Rating"]', '[class*="star"]'
    ],
    sold: [
      '[class*="sold"]', '[class*="Sold"]',
      '[class*="historical_sold"]', '[class*="sales"]',
      '[class*="quantity_sold"]'
    ]
  };

  function trySelectors(list) {
    for (const sel of list) {
      try {
        const el = document.querySelector(sel);
        if (el && el.innerText.trim()) {
          const text = el.innerText.trim();
          if (text.length > 0 && text.length < 50) return text;
        }
      } catch (e) {}
    }
    return '';
  }

  return {
    platform,
    url,
    title: title.replace(/\s*[-|]\s*(Shopee|Lazada|Tiki).*/i, '').trim(),
    price: trySelectors(selectors.price),
    rating: trySelectors(selectors.rating),
    sold: trySelectors(selectors.sold),
    capturedAt: new Date().toLocaleString('vi-VN')
  };
}

// Chụp full-page bằng cách cuộn + capture từng đoạn
async function captureFullPage() {
  isCapturing = true;

  // Thông báo bắt đầu
  chrome.runtime.sendMessage({ action: 'capture_progress', progress: 5, status: 'Chuẩn bị chụp...' });

  const originalScrollY = window.scrollY;
  const originalOverflow = document.body.style.overflow;

  try {
    // Ẩn các popup/sticky header nếu có
    const stickyEls = document.querySelectorAll('[class*="sticky"], [class*="fixed"], [class*="float"]');
    const hiddenEls = [];

    // Lấy toàn bộ chiều cao trang
    const totalHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Cuộn về đầu trang
    window.scrollTo(0, 0);
    await sleep(500);

    chrome.runtime.sendMessage({ action: 'capture_progress', progress: 10, status: 'Bắt đầu cuộn trang...' });

    // Tính số đoạn cần chụp
    const segments = [];
    let scrollY = 0;
    const overlap = 50; // pixel overlap để ghép mượt

    // Cuộn qua toàn bộ trang để load lazy images
    while (scrollY < totalHeight) {
      window.scrollTo(0, scrollY);
      await sleep(300);
      scrollY += viewportHeight - overlap;
    }

    // Cuộn về đầu để bắt đầu chụp
    window.scrollTo(0, 0);
    await sleep(600);

    chrome.runtime.sendMessage({ action: 'capture_progress', progress: 20, status: 'Đang chụp màn hình...' });

    // Chụp từng đoạn
    scrollY = 0;
    let segmentIndex = 0;
    const maxSegments = Math.min(Math.ceil(totalHeight / (viewportHeight - overlap)), 15);

    while (scrollY < totalHeight && segmentIndex < maxSegments) {
      window.scrollTo(0, scrollY);
      await sleep(400);

      // Yêu cầu background chụp tab hiện tại
      const dataUrl = await new Promise(resolve => {
        chrome.runtime.sendMessage({ action: 'capture_tab' }, resolve);
      });

      if (dataUrl) {
        segments.push({
          dataUrl,
          scrollY,
          viewportHeight,
          viewportWidth
        });
      }

      const progress = 20 + Math.round((segmentIndex / maxSegments) * 60);
      chrome.runtime.sendMessage({
        action: 'capture_progress',
        progress,
        status: `Đang chụp... (${segmentIndex + 1}/${maxSegments})`
      });

      scrollY += viewportHeight - overlap;
      segmentIndex++;
    }

    chrome.runtime.sendMessage({ action: 'capture_progress', progress: 85, status: 'Đang ghép ảnh...' });

    // Ghép tất cả segments thành 1 ảnh
    const finalImage = await stitchImages(segments, totalHeight, viewportWidth, overlap);

    // Khôi phục scroll position
    window.scrollTo(0, originalScrollY);

    chrome.runtime.sendMessage({ action: 'capture_progress', progress: 95, status: 'Trích xuất thông tin...' });

    // Lấy thêm thông tin từ DOM
    const productInfo = extractProductInfo();

    chrome.runtime.sendMessage({ action: 'capture_progress', progress: 100, status: 'Hoàn thành!' });

    isCapturing = false;
    return {
      success: true,
      imageData: finalImage,
      productInfo,
      totalHeight,
      segments: segments.length
    };

  } catch (err) {
    window.scrollTo(0, originalScrollY);
    isCapturing = false;
    throw err;
  }
}

// Ghép các ảnh chụp thành 1 ảnh dài
async function stitchImages(segments, totalHeight, viewportWidth, overlap) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = viewportWidth;
    canvas.height = Math.min(totalHeight, segments.length * (segments[0]?.viewportHeight || 900));
    const ctx = canvas.getContext('2d');

    let loadedCount = 0;
    const images = [];

    if (segments.length === 0) {
      resolve('');
      return;
    }

    segments.forEach((seg, i) => {
      const img = new Image();
      img.onload = () => {
        images[i] = img;
        loadedCount++;
        if (loadedCount === segments.length) {
          // Vẽ từng đoạn
          let currentY = 0;
          images.forEach((im, idx) => {
            if (!im) return;
            const drawHeight = idx === images.length - 1
              ? im.height
              : im.height - overlap;
            ctx.drawImage(im, 0, currentY);
            currentY += drawHeight;
          });
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === segments.length) {
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = seg.dataUrl;
    });
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}