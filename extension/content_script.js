// ── Color map: EN → VI ───────────────────────────────────────────────────────
// Sắp xếp multi-word trước để match đúng hơn
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
  { en: 'black',       vi: 'đen' },
  { en: 'white',       vi: 'trắng' },
  { en: 'red',         vi: 'đỏ' },
  { en: 'blue',        vi: 'xanh dương' },
  { en: 'green',       vi: 'xanh lá' },
  { en: 'yellow',      vi: 'vàng' },
  { en: 'orange',      vi: 'cam' },
  { en: 'purple',      vi: 'tím' },
  { en: 'pink',        vi: 'hồng' },
  { en: 'brown',       vi: 'nâu' },
  { en: 'gray',        vi: 'xám' },
  { en: 'grey',        vi: 'xám' },
  { en: 'silver',      vi: 'bạc' },
  { en: 'gold',        vi: 'vàng gold' },
  { en: 'cream',       vi: 'kem' },
  { en: 'beige',       vi: 'be' },
  { en: 'ivory',       vi: 'trắng ngà' },
  { en: 'navy',        vi: 'xanh navy' },
  { en: 'coral',       vi: 'cam san hô' },
  { en: 'mint',        vi: 'xanh mint' },
  { en: 'lilac',       vi: 'tím lilac' },
  { en: 'camel',       vi: 'nâu camel' },
  { en: 'khaki',       vi: 'xanh khaki' },
  { en: 'indigo',      vi: 'chàm' },
  { en: 'turquoise',   vi: 'xanh ngọc' },
  { en: 'maroon',      vi: 'đỏ đô' },
  { en: 'burgundy',    vi: 'đỏ burgundy' },
  { en: 'nude',        vi: 'nude' },
  { en: 'olive',       vi: 'xanh olive' },
  { en: 'rose',        vi: 'hồng đào' },
  { en: 'teal',        vi: 'xanh teal' },
  { en: 'charcoal',    vi: 'xám than' },
  { en: 'tan',         vi: 'nâu tan' },
  { en: 'sand',        vi: 'vàng cát' },
  { en: 'wine',        vi: 'đỏ rượu' },
  { en: 'rust',        vi: 'gỉ sét' },
  { en: 'mustard',     vi: 'vàng mù tạt' },
  { en: 'emerald',     vi: 'xanh ngọc lục' },
  { en: 'plum',        vi: 'tím mận' },
  { en: 'champagne',   vi: 'vàng champagne' },
  { en: 'copper',      vi: 'đồng' },
  { en: 'amber',       vi: 'hổ phách' },
  { en: 'peach',       vi: 'đào' },
  { en: 'lavender',    vi: 'tím lavender' },
  { en: 'cobalt',      vi: 'xanh cobalt' },
  { en: 'fuchsia',     vi: 'hồng fuchsia' },
  { en: 'sapphire',    vi: 'xanh sapphire' },
];

/**
 * Tìm TẤT CẢ màu trong một chuỗi text và trả về danh sách tiếng Việt
 * Ví dụ: "KT1 White Pink" → ["trắng", "hồng"]
 *         "KT1 Full Black" → ["đen toàn phần"]  ← match multi-word "full black" trước
 *         "Samba Đỏ 1:1"  → []  ← đã là tiếng Việt, không cần map
 */
function findAllColors(text) {
  const lower = text.toLowerCase();
  const found = [];
  const usedRanges = []; // track vị trí đã dùng để không match chồng

  for (const { en, vi } of COLOR_MAP) {
    let idx = lower.indexOf(en);
    while (idx !== -1) {
      // Kiểm tra không overlap với match trước
      const end = idx + en.length;
      const overlaps = usedRanges.some(([s, e]) => idx < e && end > s);

      if (!overlaps) {
        // Chỉ thêm tiếng Việt nếu text gốc chưa có sẵn tiếng Việt tương đương
        if (!found.includes(vi)) {
          found.push(vi);
        }
        usedRanges.push([idx, end]);
      }
      idx = lower.indexOf(en, idx + 1);
    }
  }

  return found;
}

/**
 * Normalize một variant text:
 * - Nếu có màu tiếng Anh → thêm tiếng Việt vào sau
 * - Nếu đã là tiếng Việt → giữ nguyên
 *
 * Ví dụ:
 *   "KT1 Full Black"   → "KT1 Full Black (đen toàn phần)"
 *   "KT1 White Pink"   → "KT1 White Pink (trắng, hồng)"
 *   "Samba Đỏ 1:1"     → "Samba Đỏ 1:1"
 *   "KT1 Cream White"  → "KT1 Cream White (trắng kem)"
 */
function normalizeColorText(text) {
  const colors = findAllColors(text);
  if (colors.length === 0) return text;
  return `${text} (${colors.join(', ')})`;
}

// ── Review count: tìm đúng selector, không đoán mò ───────────────────────────

/**
 * Chiến lược: tìm element chứa text "Đánh Giá" hoặc "đánh giá"
 * rồi lấy số đi kèm — đây là cách đáng tin nhất vì không phụ thuộc class
 */
function extractReviewCount() {
  // Cách 1: tìm element có text chứa "Đánh Giá" (Shopee style)
  const allEls = document.querySelectorAll('*');
  for (const el of allEls) {
    // Chỉ lấy text node trực tiếp, không lấy container lớn
    if (el.children.length > 2) continue;
    const text = el.innerText?.trim() || '';
    if (/\d.*đánh\s*giá/i.test(text) && text.length < 50) {
      return text;
    }
  }

  // Cách 2: class Shopee cụ thể — element ngay cạnh rating stars
  // Trên Shopee, rating section thường là: [stars] [4.9] [997 Đánh Giá] [1.1k Đã Bán]
  // Tìm element .F9RHbS mà KHÔNG có class rating (dQEiAI) VÀ text chứa số
  const candidates = document.querySelectorAll('.F9RHbS:not(.dQEiAI)');
  for (const el of candidates) {
    const text = el.innerText?.trim() || '';
    // Phải chứa số và có từ "đánh giá" hoặc chỉ là số thuần (vd: "997")
    if (/đánh\s*giá/i.test(text) || /^\d[\d.,]*$/.test(text)) {
      return text;
    }
  }

  // Cách 3: fallback các sàn khác
  const fallbackSelectors = [
    '[class*="rating-count"]',
    '[class*="reviewCount"]',
    '[class*="review-count"]',
    '[class*="rating--number"]',
    '.pdp-review-summary__overall-rating',
    '.review-rating__point',
  ];
  for (const sel of fallbackSelectors) {
    try {
      const el = document.querySelector(sel);
      if (el?.innerText?.trim()) return el.innerText.trim();
    } catch(e) {}
  }

  return '';
}

// ── extractVariants giữ nguyên logic cũ, chỉ thêm normalizeColorText ─────────
function extractVariants() {
  const shopeeVariants = document.querySelectorAll('.ZivAAW');
  if (shopeeVariants.length > 0) {
    const allValues = [...shopeeVariants]
      .map(el => el.innerText.trim())
      .filter(Boolean)
      .map(normalizeColorText); // ← thêm map màu

    const COLOR_KEYWORDS = [
      'trắng','đen','đỏ','xanh','vàng','cam','tím','hồng','nâu','xám','bạc','kem',
      'be','bò','rêu','olive','navy','nude','gold','silver','beige','ivory','coral',
      'mint','lilac','camel','khaki','indigo','turquoise','maroon','burgundy',
      'white','black','red','blue','green','yellow','orange','purple','pink',
      'brown','gray','grey','cream','rose','teal','charcoal','tan','sand',
    ];
    function hasColor(v) {
      const l = v.toLowerCase();
      return COLOR_KEYWORDS.some(kw => l.includes(kw));
    }

    const colorValues = allValues.filter(hasColor);
    const otherValues = allValues.filter(v => !hasColor(v));

    let result = '';
    if (colorValues.length > 0) result += 'Màu sắc có sẵn: ' + colorValues.join(' | ');
    if (otherValues.length > 0) result += (result ? '\n' : '') + 'Phân loại khác: ' + otherValues.join(' | ');
    if (result) return result;
  }

  // Fallback các sàn khác (giữ nguyên logic cũ + thêm normalizeColorText)
  const variantSelectors = [
    '[class*="sku-prop"]','[class*="skuProp"]','[class*="product-sku"]',
    '[class*="option-selector"]','[class*="ConfigurationSection"]',
    '[id*="variation_"]','[class*="swatches"]',
    '[class*="product-variation"]','[class*="variation-group"]',
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

  return results.join('\n---\n');
}