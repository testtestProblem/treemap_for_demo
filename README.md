# EquityView 📊 — Interactive Market Treemap & Performance Dashboard

這是一個高精度的互動式股市熱力圖（Market Heatmap）與投資組合分析儀表板應用程式，專為桌上型與行動端提供頂級的視覺體驗。本專案將複雜的市場層級數據以簡潔優雅的 **Elegant Dark Theme (深色極簡風格)** 呈現。

本文件旨在為後續接手的開發工程師或 AI Agent（Cortex/Antigravity）提供快速、精準的專案結構、核心架構與底層框架指南。

---

## 🚀 核心功能與互動邏輯

1. **D3 互動式樹狀熱力圖 (Stock Treemap)**
   - **滾輪縮放與拖拽 (Zoom & Pan)**：支援滑鼠滾輪任意無極縮放（Scale Extent: 1x 至 8x），當放大時自動切換游標（`grab` / `grabbing`）。
   - **邊界碰撞阻尼 (Boundary Clamping)**：利用 D3 Zoom 的 `translateExtent` 與 `extent` 嚴格將拖拽範圍限制在畫布比例內，防止內容超出邊界丟失。
   - **重設視角**：點擊左上角「EQUITYVIEW」標誌即可觸發導航狀態重置。此時將會還原所有篩選器、關閉側邊欄，並藉由 `resetTrigger` 讓 D3 熱力圖完美還原到初始尺寸及位置（Identity Transform）。

2. **自適應側邊控制台 (Collapsible Sidebar)**
   - **無縫版面調整**：預設為收合狀態以確保主畫布的最佳空曠感。開啟後主內容區會重新調度寬度，D3 畫布透過 `ResizeObserver` 偵測流體大小改變並瞬間執行平滑無失真重繪，100% 避免數據重疊與溢出。

3. **策略性超額報酬儀表板 (Strategic Alpha Dashboard)**
   - **模擬回測數據 (Year 2026)**：精準預測與展示個人 Portfolio 與 QQQ (Nasdaq-100 Benchmark) 的超額報酬 Alpha 走勢。
   - **多維度時間跨度篩選**：支援 `1M`, `3M`, `YTD`, `1Y` 動態時段切換。切換時數據點依解析度調整（月度/週度/日度），KPI 數值在切換時會觸發 **Spring-physics 動態彈簧滾動效能**。
   - **高對比度趨勢折線圖**：採用 `Recharts` 繪製高精度的平滑貝茲曲線（`monotone`），「My Portfolio」為翠綠色高亮粗線，「QQQ Benchmark」為低調暗灰色細線。

4. **色彩階梯篩選 (Color Tier Filters)**
   - 底部設有極簡風的七階漲跌幅過濾 Legend。點擊單個 Tiers 可針對特定走勢區間（如 Extreme Loss `< -5%` 或 Extreme Gain `> +5%`）進行動態遮罩切換，以過濾特定波幅。

---

## 📁 專案目錄結構

```bash
/
├── .env.example            # 環境變數範例檔
├── .gitignore              # 忽略打包及暫存資料
├── index.html              # 單頁面入口
├── metadata.json           # 應用程式元數據與硬體權限配置
├── tsconfig.json           # TS 編譯設定
├── vite.config.ts          # Vite 快置編譯腳本
├── package.json            # 依賴版本與命令控制
└── src/
    ├── main.tsx            # React 進入點
    ├── App.tsx             # 頂層 App 元件。管控側邊欄、儀表板、過濾 Tiers 及全域 Home 重置狀態。
    ├── index.css            # 全域 Tailwind CSS 4 設定
    │
    ├── components/
    │   ├── StockTreemap.tsx       # 使用 D3.js 原生建立的樹狀比例圖，接管 DOM 渲染、Zoom、Pan、Label 計算。
    │   └── PortfolioDashboard.tsx # 以 Recharts 和 Motion 驅動的高階折線與卡片數據分析儀表板。
    │
    └── services/
        └── stockService.ts        # 股市模擬數據、層級解析、區間分級及波動定義的底層邏輯。
```

---

## 🛠️ 技術棧與底層框架 (Tech Stack)

| 技術 / 套件 (Package) | 主要作用 (Purpose) |
| :--- | :--- |
| **React 19** | 元件狀態渲染、生命週期追蹤。 |
| **Vite** | 極速本地開發伺服器與 Rollup 生產打包（Hot Module Replacement 已由平台接管）。 |
| **Tailwind CSS v4** | 使用 `@tailwindcss/vite` 與 `@import "tailwindcss";` 系統，全 CSS-driven 設定，提供系統化間距。 |
| **D3.js (`d3`)** | 接管樹型圖分層幾何圖形運算（`d3.hierarchy`, `d3.treemap`）、縮放阻尼控制。 |
| **Recharts** | 高效能 SVG 折線與網格圖表，支援 Tooltip 遮罩與動態過濾。 |
| **Motion (`motion/react`)** | 支援物理彈簧插值動畫（Spring UI）、`AnimatePresence` 退出動畫，打造頂級轉場。 |
| **Lucide React** | 統一規格的 SVG 圖示庫。 |

---

## 🧑‍💻 工程師與 Agent 二次開發指南

當你（無論是人類工程師還是 AI Agent）進行功能擴展或調試時，請注意以下最佳實踐：

### 1. D3 與 React 生命週期的融合
在修訂 `/src/components/StockTreemap.tsx` 時：
- `StockTreemap` 使用了一個 `ResizeObserver` 機制動態測量容器，並將結果存於 `dimensions`。
- D3 的 SVG 繪製全權委託在 `useEffect` 中，該 Effect 會監聽 `[data, dimensions, resetTrigger]` 的變動。
- 當 `resetTrigger` 改變時，Effect 內會主動調用 `svg.call(zoom.transform, d3.zoomIdentity)` 還原無雜訊視角。
- 當你需要變更點擊股票元件的行為時，請尋找 `nodes.on('click', ...)` 的事件綁定。

### 2. Time-Range 與 模擬 YTD 資料結構
在修訂 `/src/components/PortfolioDashboard.tsx` 時：
- `generateSimulationData` 函式是根據 `timeRange` ('1M' | '3M' | 'YTD' | '1Y') 動態輸出相應時間標籤和走勢。
- KPI 的變化數值運用了 `<AnimatePresence mode="wait">` 以及彈簧配置（`type: "spring"`），以實現在 Range 切換時，數值能有精緻的從下方滑入且淡入淡出的飛越效果。

### 3. 開發常用指令
- **啟動本地開發伺服器** (已固定綁定至 `3000` 埠口與 `0.0.0.0` 主機網卡)：
  ```bash
  npm run dev
  ```
- **代碼型態與規範靜態檢查** (Linter)：
  ```bash
  npm run lint
  ```
- **生產環境優化編譯**：
  ```bash
  npm run build
  ```

---

*“Simplicity is the ultimate sophistication. 本專案注重無多餘雜質、高機能性的工程美學。”*
