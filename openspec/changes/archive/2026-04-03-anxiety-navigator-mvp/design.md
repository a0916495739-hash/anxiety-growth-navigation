## Context

全新專案，無既有程式碼需要遷移。目標是以最小工程量實現可驗證的 MVP，優先確保核心功能完整可用，而非技術架構的完美性。

技術棧已確定：
- 前端：React（Vite）
- 後端：Express (Node.js)
- 資料庫：PostgreSQL
- 本地開發：Docker Compose（後端 + 資料庫）

## Goals / Non-Goals

**Goals:**
- 以 Docker Compose 一鍵啟動後端 API + PostgreSQL
- 實作四張核心資料表與對應 RESTful API
- 實作訪客模式（guest_token）與帳號系統（Email + 密碼）
- 訪客資料完整遷移至正式帳號
- 實作三個核心功能的前後端完整流程
- 前端純規則被動提示（無推播）

**Non-Goals:**
- 手機推播通知
- 社群分享功能
- 第三方登入（Google、Apple）
- 資料分析 dashboard（除了應該 vs 想要的來源圓餅圖）
- AI / NLP 情緒分析
- 生產環境部署（MVP 僅本地開發）

## Decisions

### D1：訪客模式實作方式

**決定**：後端生成 UUID 作為 `guest_token`，存於前端 `localStorage`。所有 API 請求帶上 `guest_token` 或 JWT（登入後）。

**理由**：
- 無需使用者任何操作即可開始記錄，降低進入門檻
- 遷移時只需將 `guest_token` 對應的所有資料 `UPDATE user_id = <new_user_id>`

**替代方案考量**：
- 純 localStorage 儲存（不上後端）→ 跨裝置無法同步，且遷移困難，捨棄
- Session-based → 需要 server-side session store，複雜度較高，捨棄

---

### D2：認證機制

**決定**：JWT（JSON Web Token），存於 `httpOnly cookie`

**理由**：
- 防止 XSS 竊取 token
- Stateless，無需 session store
- MVP 足夠，後續可升級至 refresh token 機制

**替代方案考量**：
- localStorage 存 JWT → XSS 風險，捨棄
- Session + Redis → 複雜度過高，MVP 不適用

---

### D3：情緒除噪器的雙模式設計

**決定**：每次進入功能時顯示模式選擇畫面，不記憶上次選擇

**理由**：
- 使用者每次情緒狀態不同，強制記憶偏好反而限制彈性
- 引導式與自由書寫共用同一張資料表，mode 欄位區分

**資料表設計**（emotion_records）：
```
id            UUID PRIMARY KEY
user_id       UUID REFERENCES users(id)
mode          ENUM('guided', 'free')
intensity     SMALLINT (1-5, guided 模式才有)
trigger_event TEXT    (guided 模式才有)
protection    TEXT    (guided 模式才有，Step 3 的洞察)
raw_emotion   TEXT    (free 模式為全文，guided 模式為 Step 2 補充)
reflection    TEXT    (兩種模式的最終洞察/總結)
emotion_tags  TEXT[]
created_at    TIMESTAMPTZ DEFAULT NOW()
```

---

### D4：被動提示系統（前端規則引擎）

**決定**：純前端狀態，每次完成操作後由 React context 計算是否觸發提示卡

**觸發規則（MVP）**：
```
規則 1：今日情緒記錄數 >= 3
  → 顯示提示卡：「要不要記錄一件今天做到的小事？」
  → 按鈕直接進入成就新增頁

規則 2：情緒除噪器轉化流程完成
  → 轉化完成頁尾顯示按鈕：「這是某個衝突造成的嗎？」
  → 點擊進入應該 vs 想要新增頁
```

**理由**：
- 完全不需後端，無需排程服務
- 規則簡單清晰，MVP 後可逐步複雜化

---

### D5：應該 vs 想要圖表

**決定**：使用 `recharts`（React 圖表庫）繪製 source 欄位的圓餅圖，資料從後端 API 聚合

**API 設計**：
```
GET /api/conflicts/stats
Response: { family: 3, peers: 5, society: 2, self: 1 }
```

---

### D6：資料庫遷移工具

**決定**：使用 `node-postgres`（`pg`）直接執行 SQL migration 檔案，不引入 ORM

**理由**：
- MVP 資料模型穩定，ORM 帶來的彈性在此階段不必要
- 減少依賴，降低學習曲線
- SQL migration 檔案版本控制清晰

---

### D7：專案目錄結構

```
/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.js          # Express app 入口
│   │   ├── routes/           # API 路由
│   │   ├── middleware/       # auth middleware
│   │   ├── db/
│   │   │   ├── pool.js       # pg 連線池
│   │   │   └── migrations/   # SQL 檔案
│   │   └── controllers/      # 業務邏輯
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── pages/
    │   ├── components/
    │   ├── context/          # 全域狀態（含提示規則引擎）
    │   └── api/              # API 呼叫封裝
    └── package.json
```

## Risks / Trade-offs

| 風險 | 緩解策略 |
|------|----------|
| 訪客資料遷移時若網路中斷，可能遺失部分資料 | 遷移用單一 DB transaction，全部成功或全部回滾 |
| emotion_records 引導/自由模式共用資料表，nullable 欄位較多 | 在後端 controller 做欄位驗證，避免資料不一致 |
| guest_token 儲存在 localStorage，清除瀏覽器資料會遺失 | 在 UX 上提醒使用者「建立帳號以保存資料」 |
| MVP 無 HTTPS，JWT cookie 安全性較低 | 本地開發環境可接受；生產部署前需加 HTTPS |
| recharts bundle size 約 300KB | MVP 可接受，後續可考慮 tree-shaking 或替換輕量庫 |

## Open Questions

- 情緒標籤（emotion_tags）是使用者自由輸入，還是從預設清單選擇？MVP 建議：預設清單 + 允許自訂輸入
- feeling_tags（應該 vs 想要）同上，建議相同策略
- 成就的時間軸回顧要不要支援搜尋或篩選？MVP 建議：只做時間軸，不做篩選