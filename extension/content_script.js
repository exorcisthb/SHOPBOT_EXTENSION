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

// Danh sách từ màu sắc tiếng Việt + tiếng Anh phổ biến
const COLOR_KEYWORDS = [
  'trắng','đen','đỏ','xanh','vàng','cam','tím','hồng','nâu','xám','bạc','kem',
  'be','bò','rêu','olive','navy','nude','gold','silver','beige','ivory','coral',
  'mint','lilac','camel','khaki','indigo','turquoise','maroon','burgundy',
  'white','black','red','blue','green','yellow','orange','purple','pink','brown','gray','grey',
  'trắng sữa','xanh lá','xanh dương','xanh navy','xanh rêu','xanh ngọc',
  'đỏ đô','đỏ tươi','vàng chanh','vàng gold','nâu đất','nâu camel',
  'xám tro','hồng pastel','tím than','đen tuyền','trắng ngà',
  'caro','kẻ sọc','hoa','chấm bi'
];

function containsColor(text) {
  const lower = text.toLowerCase();
  return COLOR_KEYWORDS.some(kw => lower.includes(kw));
}

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
  else if (url.includes('aliexpress.')) platform = 'AliExpress';
  else if (url.includes('alibaba.')) platform = 'Alibaba';
  else if (url.includes('taobao.')) platform = 'Taobao';
  else if (url.includes('tmall.')) platform = 'Tmall';
  else if (url.includes('jd.com')) platform = 'JD';
  else if (url.includes('temu.')) platform = 'Temu';
  else if (url.includes('shein.')) platform = 'Shein';
  else {
    try { platform = new URL(url).hostname.replace('www.', ''); } catch(e) {}
  }

  const title = document.title || '';

  const selectors = {
    price: [
      '.IZPeQz',
      '._3n5NQx', '.pqTWkA',
      '[class*="mainPrice"]', '[class*="main-price"]',
      '[class*="price--main"]', '[class*="finalPrice"]',
      '[class*="sale-price"]', '[class*="salePrice"]',
      '.pdp-v2-product-price-content-salePrice-amount',
      '.pdp-price_type_normal', '.pdp-price', '.price-box',
      '.product-price__current-price', '.product-price',
      '.a-price-whole',
      '.price-value', '[class*="price-value"]',
      '.ux-textspans',
      '[class*="price"]:not([class*="original"]):not([class*="label"]):not([class*="tag"]):not([class*="slash"])'
    ],
    rating: [
      '.F9RHbS.dQEiAI.jMXp4d',
      '.F9RHbS.dQEiAI',
      '[class*="rating-stars__stars"]', '[class*="shopee-rating-stars"]',
      '[class*="rating--number"]', '[class*="ratingCount"]',
      '.pdp-review-summary__overall-rating',
      '.review-rating__point',
      '.a-icon-alt', '[class*="a-star"]',
      '[class*="stars"]',
      '[class*="rating"]', '[class*="Rating"]', '[class*="star"]'
    ],
    reviewCount: [],
    sold: [
      '[class*="sold"]', '[class*="Sold"]',
      '[class*="historical_sold"]',
      '[class*="quantity_sold"]',
      '[class*="sales"]', '[class*="sold-count"]'
    ],
    variants: [
      '[class*="sku-prop"]', '[class*="skuProp"]', '[class*="product-sku"]',
      '[class*="option-selector"]', '[class*="ConfigurationSection"]',
      '[id*="variation_"]', '[class*="swatches"]',
      '[class*="product-variation"]', '[class*="variation-group"]',
      '[class*="section-variation"]', '[class*="variationGroup"]',
      '[class*="variant"]', '[class*="Variant"]',
      '[class*="attribute"]', '[class*="swatch"]'
    ]
  };

  function trySelectors(list, maxLen = 50) {
    for (const sel of list) {
      try {
        const el = document.querySelector(sel);
        if (el && el.innerText.trim()) {
          const text = el.innerText.trim();
          if (text.length > 0 && text.length < maxLen) return text;
        }
      } catch (e) {}
    }
    return '';
  }

  function extractVariants() {
    // Shopee 2026 - lấy TẤT CẢ variants bằng class ZivAAW
    const shopeeVariants = document.querySelectorAll('.ZivAAW');
    if (shopeeVariants.length > 0) {
      const allValues = [...shopeeVariants]
        .map(el => el.innerText.trim())
        .filter(Boolean);

      // Tách riêng: có màu vs không có màu
      const colorValues = allValues.filter(v => containsColor(v));
      const otherValues = allValues.filter(v => !containsColor(v));

      let result = '';
      if (colorValues.length > 0) {
        result += 'Màu sắc có sẵn: ' + colorValues.join(' | ');
      }
      if (otherValues.length > 0) {
        result += (result ? '\n' : '') + 'Phân loại khác (size/loại): ' + otherValues.join(' | ');
      }
      if (result) return result;
    }

    // Fallback các sàn khác
    const results = [];
    for (const sel of selectors.variants) {
      try {
        const els = document.querySelectorAll(sel);
        els.forEach(el => {
          const text = el.innerText.trim();
          if (text && text.length > 1 && text.length < 300 && !results.includes(text)) {
            results.push(text);
          }
        });
        if (results.length > 0) break;
      } catch(e) {}
    }

    if (results.length > 0) {
      // Với sàn khác cũng tách màu vs khác
      const colorItems = results.filter(v => containsColor(v));
      const otherItems = results.filter(v => !containsColor(v));
      let out = '';
      if (colorItems.length > 0) out += 'Màu sắc có sẵn: ' + colorItems.join(' | ');
      if (otherItems.length > 0) out += (out ? '\n' : '') + 'Phân loại khác: ' + otherItems.join('\n---\n');
      return out || results.join('\n---\n');
    }

    return '';
  }

  function extractReviewCount() {
    // Cấu trúc Shopee đã xác nhận từ DevTools:
    // <button><div class="F9RHbS">318</div><div class="x1i_He">đánh giá</div></button>
    // Logic: tìm button có đúng 2 child — 1 child là số thuần, 1 child là "đánh giá"
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const children = Array.from(btn.children);
      // Tìm child nào có text chính xác là "đánh giá" (trim, không lấy button to hơn)
      const labelEl = children.find(c =>
        /^đánh\s*giá$/i.test(c.innerText?.trim())
      );
      if (!labelEl) continue;
      // Sibling còn lại phải là số nguyên dương (có thể có dấu . phân cách nghìn)
      const numEl = children.find(c =>
        c !== labelEl && /^[\d.]+$/.test(c.innerText?.trim())
      );
      if (numEl) return numEl.innerText.trim();
    }

    // Fallback cho các sàn khác (Amazon, Lazada...): tìm text "X ratings/reviews"
    const reviewPattern = /^([\d,]+)\s*(ratings?|reviews?)/i;
    const candidates = document.querySelectorAll('a, span');
    for (const el of candidates) {
      if (el.children.length > 1) continue;
      const raw = el.innerText?.trim();
      if (!raw || raw.length > 40) continue;
      const m = raw.match(reviewPattern);
      if (m) return m[1];
    }

    return '';
  }

  const reviewCount = extractReviewCount();

  return {
    platform,
    url,
    title: title.replace(/\s*[-|]\s*(Shopee|Lazada|Tiki).*/i, '').trim(),
    price: trySelectors(selectors.price),
    rating: trySelectors(selectors.rating),
    reviewCount,
    sold: trySelectors(selectors.sold),
    variants: extractVariants(),
    capturedAt: new Date().toLocaleString('vi-VN')
  };
}

// Chụp full-page bằng cách cuộn + capture từng đoạn
async function captureFullPage() {
  isCapturing = true;

  chrome.runtime.sendMessage({ action: 'capture_progress', progress: 5, status: 'Chuẩn bị chụp...' });

  const originalScrollY = window.scrollY;

  try {
    const totalHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    window.scrollTo(0, 0);
    await sleep(500);

    chrome.runtime.sendMessage({ action: 'capture_progress', progress: 10, status: 'Bắt đầu cuộn trang...' });

    const segments = [];
    let scrollY = 0;
    const overlap = 50;

    while (scrollY < totalHeight) {
      window.scrollTo(0, scrollY);
      await sleep(300);
      scrollY += viewportHeight - overlap;
    }

    window.scrollTo(0, 0);
    await sleep(600);

    chrome.runtime.sendMessage({ action: 'capture_progress', progress: 20, status: 'Đang chụp màn hình...' });

    scrollY = 0;
    let segmentIndex = 0;
    const maxSegments = Math.min(Math.ceil(totalHeight / (viewportHeight - overlap)), 15);

    while (scrollY < totalHeight && segmentIndex < maxSegments) {
      window.scrollTo(0, scrollY);
      await sleep(400);

      const dataUrl = await new Promise(resolve => {
        chrome.runtime.sendMessage({ action: 'capture_tab' }, resolve);
      });

      if (dataUrl) {
        segments.push({ dataUrl, scrollY, viewportHeight, viewportWidth });
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

    const finalImage = await stitchImages(segments, totalHeight, viewportWidth, overlap);

    window.scrollTo(0, originalScrollY);

    chrome.runtime.sendMessage({ action: 'capture_progress', progress: 95, status: 'Trích xuất thông tin...' });

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
          let currentY = 0;
          images.forEach((im, idx) => {
            if (!im) return;
            const drawHeight = idx === images.length - 1 ? im.height : im.height - overlap;
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