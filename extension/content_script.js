// content_script.js - Chạy trong trang sản phẩm, xử lý cuộn + chụp màn hình

let isCapturing = false;

// ── Message Listener ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'capture_page') {
    if (isCapturing) {
      sendResponse({ error: 'Đang chụp, vui lòng chờ...' });
      return true;
    }
    captureFullPage()
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ error: err.message }));
    return true; // giữ channel mở cho async
  }

  if (msg.action === 'extract_info') {
    const info = extractProductInfo();
    sendResponse(info);
    return true;
  }

  if (msg.action === 'ping') {
    sendResponse({ ok: true });
    return true;
  }
});

// ── Color Map: EN → VI ───────────────────────────────────────────────────────
const COLOR_MAP = [
  // Multi-word trước
  { en: 'off white',    vi: 'trắng kem' },
  { en: 'full black',   vi: 'đen toàn phần' },
  { en: 'light blue',   vi: 'xanh nhạt' },
  { en: 'dark blue',    vi: 'xanh đậm' },
  { en: 'sky blue',     vi: 'xanh trời' },
  { en: 'royal blue',   vi: 'xanh hoàng gia' },
  { en: 'navy blue',    vi: 'xanh navy' },
  { en: 'cobalt blue',  vi: 'xanh cobalt' },
  { en: 'dark green',   vi: 'xanh lá đậm' },
  { en: 'light green',  vi: 'xanh lá nhạt' },
  { en: 'forest green', vi: 'xanh rừng' },
  { en: 'dark red',     vi: 'đỏ đậm' },
  { en: 'light pink',   vi: 'hồng nhạt' },
  { en: 'hot pink',     vi: 'hồng đậm' },
  { en: 'light grey',   vi: 'xám nhạt' },
  { en: 'light gray',   vi: 'xám nhạt' },
  { en: 'dark grey',    vi: 'xám đậm' },
  { en: 'dark gray',    vi: 'xám đậm' },
  { en: 'cream white',  vi: 'trắng kem' },
  { en: 'white black',  vi: 'trắng đen' },
  { en: 'white blue',   vi: 'trắng xanh' },
  { en: 'white red',    vi: 'trắng đỏ' },
  { en: 'white pink',   vi: 'trắng hồng' },
  { en: 'white grey',   vi: 'trắng xám' },
  { en: 'white gray',   vi: 'trắng xám' },
  // Single-word
  { en: 'black',      vi: 'đen' },
  { en: 'white',      vi: 'trắng' },
  { en: 'red',        vi: 'đỏ' },
  { en: 'blue',       vi: 'xanh dương' },
  { en: 'green',      vi: 'xanh lá' },
  { en: 'yellow',     vi: 'vàng' },
  { en: 'orange',     vi: 'cam' },
  { en: 'purple',     vi: 'tím' },
  { en: 'pink',       vi: 'hồng' },
  { en: 'brown',      vi: 'nâu' },
  { en: 'gray',       vi: 'xám' },
  { en: 'grey',       vi: 'xám' },
  { en: 'silver',     vi: 'bạc' },
  { en: 'gold',       vi: 'vàng gold' },
  { en: 'cream',      vi: 'kem' },
  { en: 'beige',      vi: 'be' },
  { en: 'ivory',      vi: 'trắng ngà' },
  { en: 'navy',       vi: 'xanh navy' },
  { en: 'coral',      vi: 'cam san hô' },
  { en: 'mint',       vi: 'xanh mint' },
  { en: 'lilac',      vi: 'tím lilac' },
  { en: 'camel',      vi: 'nâu camel' },
  { en: 'khaki',      vi: 'xanh khaki' },
  { en: 'indigo',     vi: 'chàm' },
  { en: 'turquoise',  vi: 'xanh ngọc' },
  { en: 'maroon',     vi: 'đỏ đô' },
  { en: 'burgundy',   vi: 'đỏ burgundy' },
  { en: 'nude',       vi: 'nude' },
  { en: 'olive',      vi: 'xanh olive' },
  { en: 'rose',       vi: 'hồng đào' },
  { en: 'teal',       vi: 'xanh teal' },
  { en: 'charcoal',   vi: 'xám than' },
  { en: 'tan',        vi: 'nâu tan' },
  { en: 'sand',       vi: 'vàng cát' },
  { en: 'wine',       vi: 'đỏ rượu' },
  { en: 'rust',       vi: 'gỉ sét' },
  { en: 'mustard',    vi: 'vàng mù tạt' },
  { en: 'emerald',    vi: 'xanh ngọc lục' },
  { en: 'plum',       vi: 'tím mận' },
  { en: 'champagne',  vi: 'vàng champagne' },
  { en: 'copper',     vi: 'đồng' },
  { en: 'amber',      vi: 'hổ phách' },
  { en: 'peach',      vi: 'đào' },
  { en: 'lavender',   vi: 'tím lavender' },
  { en: 'cobalt',     vi: 'xanh cobalt' },
  { en: 'fuchsia',    vi: 'hồng fuchsia' },
  { en: 'sapphire',   vi: 'xanh sapphire' },
];

function findAllColors(text) {
  const lower = text.toLowerCase();
  const found = [];
  const usedRanges = [];
  for (const { en, vi } of COLOR_MAP) {
    let idx = lower.indexOf(en);
    while (idx !== -1) {
      const end = idx + en.length;
      const overlaps = usedRanges.some(([s, e]) => idx < e && end > s);
      if (!overlaps) {
        if (!found.includes(vi)) found.push(vi);
        usedRanges.push([idx, end]);
      }
      idx = lower.indexOf(en, idx + 1);
    }
  }
  return found;
}

function normalizeColorText(text) {
  const colors = findAllColors(text);
  if (colors.length === 0) return text;
  return `${text} (${colors.join(', ')})`;
}

// ── Color Keywords (dùng để detect có phải màu không) ───────────────────────
const COLOR_KEYWORDS = [
  'trắng','đen','đỏ','xanh','vàng','cam','tím','hồng','nâu','xám','bạc','kem',
  'be','bò','rêu','olive','navy','nude','gold','silver','beige','ivory','coral',
  'mint','lilac','camel','khaki','indigo','turquoise','maroon','burgundy',
  'white','black','red','blue','green','yellow','orange','purple','pink',
  'brown','gray','grey','cream','rose','teal','charcoal','tan','sand',
  'caro','kẻ sọc','hoa','chấm bi','wine','rust','mustard','emerald','plum',
];

function containsColor(text) {
  const lower = text.toLowerCase();
  return COLOR_KEYWORDS.some(kw => lower.includes(kw));
}

// ── Extract Review Count ─────────────────────────────────────────────────────
function extractReviewCount() {
  // Cách 1: tìm element có text chứa số + "đánh giá"
  const allEls = document.querySelectorAll('*');
  for (const el of allEls) {
    if (el.children.length > 2) continue;
    const text = el.innerText?.trim() || '';
    if (/\d.*đánh\s*giá/i.test(text) && text.length < 50) {
      return text;
    }
  }
  // Cách 2: class Shopee
  const candidates = document.querySelectorAll('.F9RHbS:not(.dQEiAI)');
  for (const el of candidates) {
    const text = el.innerText?.trim() || '';
    if (/đánh\s*giá/i.test(text) || /^\d[\d.,]*$/.test(text)) {
      return text;
    }
  }
  // Cách 3: fallback các sàn khác
  const fallbackSelectors = [
    '[class*="rating-count"]','[class*="reviewCount"]',
    '[class*="review-count"]','[class*="rating--number"]',
    '.pdp-review-summary__overall-rating','.review-rating__point',
  ];
  for (const sel of fallbackSelectors) {
    try {
      const el = document.querySelector(sel);
      if (el?.innerText?.trim()) return el.innerText.trim();
    } catch(e) {}
  }
  return '';
}

// ── Extract Variants ─────────────────────────────────────────────────────────
function extractVariants() {
  const shopeeVariants = document.querySelectorAll('.ZivAAW');
  if (shopeeVariants.length > 0) {
    const allValues = [...shopeeVariants]
      .map(el => el.innerText.trim())
      .filter(Boolean)
      .map(normalizeColorText);

    const colorValues = allValues.filter(v => containsColor(v));
    const otherValues = allValues.filter(v => !containsColor(v));

    let result = '';
    if (colorValues.length > 0) result += 'Màu sắc có sẵn: ' + colorValues.join(' | ');
    if (otherValues.length > 0) result += (result ? '\n' : '') + 'Phân loại khác (size/loại): ' + otherValues.join(' | ');
    if (result) return result;
  }

  const variantSelectors = [
    '[class*="sku-prop"]','[class*="skuProp"]','[class*="product-sku"]',
    '[class*="option-selector"]','[class*="ConfigurationSection"]',
    '[id*="variation_"]','[class*="swatches"]',
    '[class*="product-variation"]','[class*="variation-group"]',
    '[class*="section-variation"]','[class*="variationGroup"]',
    '[class*="variant"]','[class*="Variant"]',
    '[class*="attribute"]','[class*="swatch"]'
  ];

  const results = [];
  for (const sel of variantSelectors) {
    try {
      document.querySelectorAll(sel).forEach(el => {
        const text = el.innerText.trim();
        if (text && text.length > 1 && text.length < 300 && !results.includes(text)) {
          results.push(normalizeColorText(text));
        }
      });
      if (results.length > 0) break;
    } catch(e) {}
  }

  if (results.length > 0) {
    const colorItems = results.filter(v => containsColor(v));
    const otherItems = results.filter(v => !containsColor(v));
    let out = '';
    if (colorItems.length > 0) out += 'Màu sắc có sẵn: ' + colorItems.join(' | ');
    if (otherItems.length > 0) out += (out ? '\n' : '') + 'Phân loại khác: ' + otherItems.join('\n---\n');
    return out || results.join('\n---\n');
  }

  return '';
}

// ── Extract Product Info ─────────────────────────────────────────────────────
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
      '.IZPeQz','._3n5NQx','.pqTWkA',
      '[class*="mainPrice"]','[class*="main-price"]',
      '[class*="price--main"]','[class*="finalPrice"]',
      '[class*="sale-price"]','[class*="salePrice"]',
      '.pdp-v2-product-price-content-salePrice-amount',
      '.pdp-price_type_normal','.pdp-price','.price-box',
      '.product-price__current-price','.product-price',
      '.a-price-whole','.price-value','[class*="price-value"]',
      '.ux-textspans',
      '[class*="price"]:not([class*="original"]):not([class*="label"]):not([class*="tag"]):not([class*="slash"])'
    ],
    rating: [
      '.F9RHbS.dQEiAI.jMXp4d','.F9RHbS.dQEiAI',
      '[class*="rating-stars__stars"]','[class*="shopee-rating-stars"]',
      '[class*="rating--number"]','[class*="ratingCount"]',
      '.pdp-review-summary__overall-rating','.review-rating__point',
      '.a-icon-alt','[class*="a-star"]',
      '[class*="stars"]','[class*="rating"]','[class*="Rating"]','[class*="star"]'
    ],
    sold: [
      '[class*="sold"]','[class*="Sold"]',
      '[class*="historical_sold"]','[class*="quantity_sold"]',
      '[class*="sales"]','[class*="sold-count"]'
    ],
  };

  function trySelectors(list, maxLen = 50) {
    for (const sel of list) {
      try {
        const el = document.querySelector(sel);
        if (el && el.innerText.trim()) {
          const text = el.innerText.trim();
          if (text.length > 0 && text.length < maxLen) return text;
        }
      } catch(e) {}
    }
    return '';
  }

  return {
    platform,
    url,
    title: title.replace(/\s*[-|]\s*(Shopee|Lazada|Tiki).*/i, '').trim(),
    price:       trySelectors(selectors.price),
    rating:      trySelectors(selectors.rating),
    reviewCount: extractReviewCount(),
    sold:        trySelectors(selectors.sold),
    variants:    extractVariants(),
    capturedAt:  new Date().toLocaleString('vi-VN')
  };
}

// ── Capture Full Page ────────────────────────────────────────────────────────
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
    const viewportWidth  = window.innerWidth;

    window.scrollTo(0, 0);
    await sleep(500);

    chrome.runtime.sendMessage({ action: 'capture_progress', progress: 10, status: 'Bắt đầu cuộn trang...' });

    // Pre-scroll để load lazy images
    const overlap = 50;
    let scrollY = 0;
    while (scrollY < totalHeight) {
      window.scrollTo(0, scrollY);
      await sleep(300);
      scrollY += viewportHeight - overlap;
    }

    window.scrollTo(0, 0);
    await sleep(600);

    chrome.runtime.sendMessage({ action: 'capture_progress', progress: 20, status: 'Đang chụp màn hình...' });

    // Chụp từng đoạn
    scrollY = 0;
    let segmentIndex = 0;
    const maxSegments = Math.min(Math.ceil(totalHeight / (viewportHeight - overlap)), 15);
    const segments = [];

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

// ── Stitch Images ────────────────────────────────────────────────────────────
async function stitchImages(segments, totalHeight, viewportWidth, overlap) {
  return new Promise((resolve) => {
    if (segments.length === 0) { resolve(''); return; }

    const canvas = document.createElement('canvas');
    canvas.width  = viewportWidth;
    canvas.height = Math.min(totalHeight, segments.length * (segments[0]?.viewportHeight || 900));
    const ctx = canvas.getContext('2d');

    let loadedCount = 0;
    const images = [];

    segments.forEach((seg, i) => {
      const img = new Image();
      img.onload = () => {
        images[i] = img;
        loadedCount++;
        if (loadedCount === segments.length) {
          let currentY = 0;
          images.forEach((im, idx) => {
            if (!im) return;
            ctx.drawImage(im, 0, currentY);
            const drawHeight = idx === images.length - 1 ? im.height : im.height - overlap;
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

// ── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}