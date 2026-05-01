// content_script.js - Chạy trong trang sản phẩm, xử lý cuộn + chụp màn hình

let isCapturing = false;

// Lắng nghe message từ popup/background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "capture_page") {
    if (isCapturing) {
      sendResponse({ error: "Đang chụp, vui lòng chờ..." });
      return;
    }
    captureFullPage()
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ error: err.message }));
    return true; // async
  }

  if (msg.action === "extract_info") {
    // Dùng async để chờ shopName render xong
    extractProductInfoAsync()
      .then((info) => sendResponse(info))
      .catch(() => sendResponse(extractProductInfo()));
    return true; // async
  }

  if (msg.action === "ping") {
    sendResponse({ ok: true });
  }
});

// Danh sách từ màu sắc tiếng Việt + tiếng Anh phổ biến
const COLOR_KEYWORDS = [
  "trắng",
  "đen",
  "đỏ",
  "xanh",
  "vàng",
  "cam",
  "tím",
  "hồng",
  "nâu",
  "xám",
  "bạc",
  "kem",
  "be",
  "bò",
  "rêu",
  "olive",
  "navy",
  "nude",
  "gold",
  "silver",
  "beige",
  "ivory",
  "coral",
  "mint",
  "lilac",
  "camel",
  "khaki",
  "indigo",
  "turquoise",
  "maroon",
  "burgundy",
  "white",
  "black",
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "brown",
  "gray",
  "grey",
  "trắng sữa",
  "xanh lá",
  "xanh dương",
  "xanh navy",
  "xanh rêu",
  "xanh ngọc",
  "đỏ đô",
  "đỏ tươi",
  "vàng chanh",
  "vàng gold",
  "nâu đất",
  "nâu camel",
  "xám tro",
  "hồng pastel",
  "tím than",
  "đen tuyền",
  "trắng ngà",
  "caro",
  "kẻ sọc",
  "hoa",
  "chấm bi",
];

function containsColor(text) {
  const lower = text.toLowerCase();
  return COLOR_KEYWORDS.some((kw) => lower.includes(kw));
}

// Chờ shopName render xong với retry
async function extractShopNameAsync(retries = 8, delay = 500) {
  const shopSelectors = [
    ".PYEGyz .fV3TIn",
    ".fV3TIn",
    ".VlDGOl",
    '[class*="shop-name"]',
    '[class*="shopName"]',
    '[class*="seller-name"]',
    '[class*="sellerName"]',
    ".pdp-shop-name",
  ];

  for (let i = 0; i < retries; i++) {
    for (const sel of shopSelectors) {
      try {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          const text = (el?.innerText || el?.textContent || "").trim();
          if (text.length > 0 && text.length < 100) return text;
        }
      } catch (e) {}
    }
    // Chưa tìm thấy → chờ rồi thử lại
    await new Promise((r) => setTimeout(r, delay));
  }
  return "";
}

// Trích xuất thông tin sản phẩm từ DOM (sync - dùng khi đã có shopName)
function extractProductInfo(shopNameOverride = null) {
  const url = window.location.href;
  let platform = "unknown";
  if (url.includes("shopee.vn")) platform = "Shopee";
  else if (url.includes("lazada.vn")) platform = "Lazada";
  else if (url.includes("tiki.vn")) platform = "Tiki";
  else if (url.includes("sendo.vn")) platform = "Sendo";
  else if (url.includes("amazon.")) platform = "Amazon";
  else if (url.includes("ebay.")) platform = "eBay";
  else if (url.includes("aliexpress.")) platform = "AliExpress";
  else if (url.includes("alibaba.")) platform = "Alibaba";
  else if (url.includes("taobao.")) platform = "Taobao";
  else if (url.includes("tmall.")) platform = "Tmall";
  else if (url.includes("jd.com")) platform = "JD";
  else if (url.includes("temu.")) platform = "Temu";
  else if (url.includes("shein.")) platform = "Shein";
  else {
    try {
      platform = new URL(url).hostname.replace("www.", "");
    } catch (e) {}
  }

  const title = document.title || "";

  const selectors = {
    price: [
      ".IZPeQz",
      "._3n5NQx",
      ".pqTWkA",
      '[class*="mainPrice"]',
      '[class*="main-price"]',
      '[class*="price--main"]',
      '[class*="finalPrice"]',
      '[class*="sale-price"]',
      '[class*="salePrice"]',
      ".pdp-v2-product-price-content-salePrice-amount",
      ".pdp-price_type_normal",
      ".pdp-price",
      ".price-box",
      ".product-price__current-price",
      ".product-price",
      ".a-price-whole",
      ".price-value",
      '[class*="price-value"]',
      ".ux-textspans",
      '[class*="price"]:not([class*="original"]):not([class*="label"]):not([class*="tag"]):not([class*="slash"])',
    ],
    rating: [
      ".F9RHbS.dQEiAI.jMXp4d",
      ".F9RHbS.dQEiAI",
      '[class*="rating-stars__stars"]',
      '[class*="shopee-rating-stars"]',
      '[class*="rating--number"]',
      '[class*="ratingCount"]',
      ".pdp-review-summary__overall-rating",
      ".review-rating__point",
      ".a-icon-alt",
      '[class*="a-star"]',
      '[class*="stars"]',
      '[class*="rating"]',
      '[class*="Rating"]',
      '[class*="star"]',
    ],
    reviewCount: [],
    sold: [
      '[class*="sold"]',
      '[class*="Sold"]',
      '[class*="historical_sold"]',
      '[class*="quantity_sold"]',
      '[class*="sales"]',
      '[class*="sold-count"]',
    ],
    variants: [
      '[class*="sku-prop"]',
      '[class*="skuProp"]',
      '[class*="product-sku"]',
      '[class*="option-selector"]',
      '[class*="ConfigurationSection"]',
      '[id*="variation_"]',
      '[class*="swatches"]',
      '[class*="product-variation"]',
      '[class*="variation-group"]',
      '[class*="section-variation"]',
      '[class*="variationGroup"]',
      '[class*="variant"]',
      '[class*="Variant"]',
      '[class*="attribute"]',
      '[class*="swatch"]',
    ],
  };

  function trySelectors(list, maxLen = 50) {
    for (const sel of list) {
      try {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          const text = (el.innerText || el.textContent || "").trim();
          if (text.length > 0 && text.length < maxLen) return text;
        }
      } catch (e) {}
    }
    return "";
  }

  function extractVariants() {
    // Shopee 2026 - lấy TẤT CẢ variants bằng class ZivAAW
    const shopeeVariants = document.querySelectorAll(".ZivAAW");
    if (shopeeVariants.length > 0) {
      const allValues = [...shopeeVariants]
        .map((el) => el.innerText.trim())
        .filter(Boolean);

      const colorValues = allValues.filter((v) => containsColor(v));
      const otherValues = allValues.filter((v) => !containsColor(v));

      let result = "";
      if (colorValues.length > 0) {
        result += "Màu sắc có sẵn: " + colorValues.join(" | ");
      }
      if (otherValues.length > 0) {
        result +=
          (result ? "\n" : "") +
          "Phân loại khác (size/loại): " +
          otherValues.join(" | ");
      }
      if (result) return result;
    }

    // Fallback các sàn khác
    const results = [];
    for (const sel of selectors.variants) {
      try {
        const els = document.querySelectorAll(sel);
        els.forEach((el) => {
          const text = el.innerText.trim();
          if (
            text &&
            text.length > 1 &&
            text.length < 300 &&
            !results.includes(text)
          ) {
            results.push(text);
          }
        });
        if (results.length > 0) break;
      } catch (e) {}
    }

    if (results.length > 0) {
      const colorItems = results.filter((v) => containsColor(v));
      const otherItems = results.filter((v) => !containsColor(v));
      let out = "";
      if (colorItems.length > 0)
        out += "Màu sắc có sẵn: " + colorItems.join(" | ");
      if (otherItems.length > 0)
        out +=
          (out ? "\n" : "") + "Phân loại khác: " + otherItems.join("\n---\n");
      return out || results.join("\n---\n");
    }

    return "";
  }

  function extractReviewCount() {
    const labelEl = document.querySelector(".x1i_He");
    if (labelEl && /^đánh\s*giá$/i.test(labelEl.innerText?.trim())) {
      const numEl =
        labelEl.previousElementSibling ||
        labelEl.parentElement?.querySelector(".F9RHbS");
      if (numEl && /^[\d.,kKmM]+$/.test(numEl.innerText?.trim())) {
        return numEl.innerText.trim();
      }
    }

    const reviewBtns = document.querySelectorAll("button");
    for (const btn of reviewBtns) {
      const labelChild = btn.querySelector(".x1i_He");
      if (!labelChild) continue;
      if (!/^đánh\s*giá$/i.test(labelChild.innerText?.trim())) continue;
      const numChild = btn.querySelector(".F9RHbS");
      if (numChild && /^[\d.,kKmM]+$/.test(numChild.innerText?.trim())) {
        return numChild.innerText.trim();
      }
    }

    // Fallback cho các sàn khác (Amazon, Lazada...)
    const reviewPattern = /^([\d,]+)\s*(ratings?|reviews?)/i;
    const candidates = document.querySelectorAll("a, span");
    for (const el of candidates) {
      if (el.children.length > 1) continue;
      const raw = el.innerText?.trim();
      if (!raw || raw.length > 40) continue;
      const m = raw.match(reviewPattern);
      if (m) return m[1];
    }

    return "";
  }

  // Sync fallback cho shopName (dùng khi không có override)
  function extractShopNameSync() {
    const shopSelectors = [
      ".PYEGyz .fV3TIn",
      ".fV3TIn",
      ".VlDGOl",
      '[class*="shop-name"]',
      '[class*="shopName"]',
      '[class*="seller-name"]',
      '[class*="sellerName"]',
      ".pdp-shop-name",
    ];
    for (const sel of shopSelectors) {
      try {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          const text = (el?.innerText || el?.textContent || "").trim();
          if (text.length > 0 && text.length < 100) return text;
        }
      } catch (e) {}
    }
    return "";
  }

  const reviewCount = extractReviewCount();

  return {
    platform,
    url,
    title: title.replace(/\s*[-|]\s*(Shopee|Lazada|Tiki).*/i, "").trim(),
    price: trySelectors(selectors.price),
    rating: trySelectors(selectors.rating),
    reviewCount,
    sold: trySelectors(selectors.sold),
    shopName: shopNameOverride !== null ? shopNameOverride : extractShopNameSync(),
    variants: extractVariants(),
    capturedAt: new Date().toLocaleString("vi-VN"),
  };
}

// Async version — chờ shopName render rồi mới trả về
async function extractProductInfoAsync() {
  const shopName = await extractShopNameAsync();
  return extractProductInfo(shopName);
}

// Chụp full-page bằng cách cuộn + capture từng đoạn
async function captureFullPage() {
  isCapturing = true;

  chrome.runtime.sendMessage({
    action: "capture_progress",
    progress: 5,
    status: "Chuẩn bị chụp...",
  });

  const originalScrollY = window.scrollY;

  try {
    let totalHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
    );
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    window.scrollTo(0, 0);
    await sleep(500);

    chrome.runtime.sendMessage({
      action: "capture_progress",
      progress: 10,
      status: "Bắt đầu cuộn trang...",
    });

    const segments = [];
    let scrollY = 0;
    const overlap = 50;
    let preScrollCount = 0;

    while (scrollY < totalHeight && preScrollCount < 40) {
      window.scrollTo(0, scrollY);
      await sleep(350);
      totalHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      );
      scrollY += viewportHeight - overlap;
      preScrollCount++;
    }

    window.scrollTo(0, 0);
    await sleep(600);

    chrome.runtime.sendMessage({
      action: "capture_progress",
      progress: 20,
      status: "Đang chụp màn hình...",
    });

    scrollY = 0;
    let segmentIndex = 0;
    const maxSegments = Math.min(
      Math.ceil(totalHeight / (viewportHeight - overlap)),
      40,
    );

    while (scrollY < totalHeight && segmentIndex < maxSegments) {
      window.scrollTo(0, scrollY);
      await sleep(400);

      const widget = document.getElementById("shopbot-root");
      if (widget) widget.style.opacity = "0";
      await sleep(50);

      const dataUrl = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "capture_tab" }, resolve);
      });

      if (widget) widget.style.opacity = "1";

      if (dataUrl) {
        segments.push({ dataUrl, scrollY, viewportHeight, viewportWidth });
      }

      const progress = 20 + Math.round((segmentIndex / maxSegments) * 60);
      chrome.runtime.sendMessage({
        action: "capture_progress",
        progress,
        status: `Đang chụp... (${segmentIndex + 1}/${maxSegments})`,
      });

      scrollY += viewportHeight - overlap;
      segmentIndex++;
    }

    chrome.runtime.sendMessage({
      action: "capture_progress",
      progress: 85,
      status: "Đang ghép ảnh...",
    });

    const finalImage = await stitchImages(
      segments,
      totalHeight,
      viewportWidth,
      overlap,
    );

    window.scrollTo(0, originalScrollY);

    chrome.runtime.sendMessage({
      action: "capture_progress",
      progress: 95,
      status: "Trích xuất thông tin...",
    });

    // Dùng async version để đảm bảo shopName đã render
    const productInfo = await extractProductInfoAsync();

    chrome.runtime.sendMessage({
      action: "capture_progress",
      progress: 100,
      status: "Hoàn thành!",
    });

    isCapturing = false;
    return {
      success: true,
      imageData: finalImage,
      productInfo,
      totalHeight,
      segments: segments.length,
    };
  } catch (err) {
    window.scrollTo(0, originalScrollY);
    isCapturing = false;
    throw err;
  }
}

async function stitchImages(segments, totalHeight, viewportWidth, overlap) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = viewportWidth;
    canvas.height = Math.min(
      totalHeight,
      segments.length * (segments[0]?.viewportHeight || 900),
    );
    const ctx = canvas.getContext("2d");

    let loadedCount = 0;
    const images = [];

    if (segments.length === 0) {
      resolve("");
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
            const drawHeight =
              idx === images.length - 1 ? im.height : im.height - overlap;
            ctx.drawImage(im, 0, currentY);
            currentY += drawHeight;
          });
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === segments.length) {
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        }
      };
      img.src = seg.dataUrl;
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}