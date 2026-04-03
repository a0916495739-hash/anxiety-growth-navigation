## 1. 專案基礎建設

- [x] 1.1 建立 monorepo 目錄結構：`/backend`、`/frontend`、根目錄 `docker-compose.yml`
- [x] 1.2 建立 `.env.example`，定義必要環境變數（DATABASE_URL, JWT_SECRET, PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB）
- [x] 1.3 建立 `backend/Dockerfile`（Node.js + nodemon 熱重載）
- [x] 1.4 建立 `docker-compose.yml`，包含 postgres（named volume）與 backend 服務，port 映射 3001:3001 / 5432:5432
- [ ] 1.5 驗證 `docker compose up` 可成功啟動兩個服務

## 2. 後端初始化

- [x] 2.1 初始化 `backend/package.json`，安裝依賴：express, pg, bcrypt, jsonwebtoken, cors, dotenv, uuid
- [x] 2.2 建立 `backend/src/index.js`：Express app、CORS、JSON middleware、啟動監聽
- [x] 2.3 建立 `backend/src/db/pool.js`：pg 連線池，讀取 DATABASE_URL
- [x] 2.4 建立 migration 檔案 `backend/src/db/migrations/001_init.sql`，建立四張資料表（users, emotion_records, achievements, conflicts）
- [x] 2.5 建立 migration 執行腳本，在 backend 啟動時自動執行 SQL migration
- [ ] 2.6 驗證資料表正確建立（docker exec 進入 psql 確認）

## 3. 帳號系統後端

- [x] 3.1 建立 `POST /api/auth/guest`：生成 UUID guest_token，儲存至 users 表，回傳 token
- [x] 3.2 建立 `POST /api/auth/register`：Email + 密碼（bcrypt hash）建立帳號，支援 guest_token header 觸發資料遷移，回傳 JWT（httpOnly cookie）
- [x] 3.3 建立 `POST /api/auth/login`：驗證 Email + 密碼，回傳 JWT（httpOnly cookie）
- [x] 3.4 建立 `POST /api/auth/logout`：清除 httpOnly cookie
- [x] 3.5 建立 auth middleware：驗證 JWT cookie 或 guest_token header，注入 req.userId / req.guestToken
- [x] 3.6 實作訪客資料遷移邏輯（單一 DB transaction：UPDATE emotion_records, achievements, conflicts 的 user_id）

## 4. 情緒除噪器後端

- [x] 4.1 建立 `POST /api/emotions`：儲存情緒記錄（支援 guided/free 兩種 mode），驗證必填欄位
- [x] 4.2 建立 `GET /api/emotions`：回傳使用者所有情緒記錄，時間倒序
- [x] 4.3 建立 `GET /api/emotions/today/count`：回傳使用者當日情緒記錄數量

## 5. 微小成就系統後端

- [x] 5.1 建立 `POST /api/achievements`：儲存成就記錄（title 必填，my_standard 選填）
- [x] 5.2 建立 `GET /api/achievements`：回傳使用者所有成就，時間倒序

## 6. 應該 vs 想要後端

- [x] 6.1 建立 `POST /api/conflicts`：儲存衝突記錄（should_content, want_content, source 必填）
- [x] 6.2 建立 `GET /api/conflicts`：回傳使用者所有衝突記錄，時間倒序
- [x] 6.3 建立 `GET /api/conflicts/stats`：回傳 source 欄位分佈統計 `{ family, peers, society, self }`

## 7. 前端初始化

- [x] 7.1 使用 Vite 建立 React 專案（`/frontend`），安裝依賴：react-router-dom, axios, recharts
- [x] 7.2 建立 `/frontend/src/api/` 目錄，封裝各 API 呼叫函式（auth, emotions, achievements, conflicts）
- [x] 7.3 建立 `AppContext`（React context），管理：登入狀態、guest_token、當日情緒計數
- [x] 7.4 建立路由結構（react-router-dom）：首頁、情緒除噪器、成就、應該 vs 想要、登入、註冊

## 8. 帳號系統前端

- [x] 8.1 實作 App 啟動時的 guest_token 初始化邏輯（localStorage 讀取或呼叫 API 取得）
- [x] 8.2 建立登入頁面（Email + 密碼表單、API 呼叫、錯誤提示）
- [x] 8.3 建立註冊頁面（Email + 密碼表單、帶入 guest_token、API 呼叫、錯誤提示）
- [x] 8.4 實作登出功能（呼叫 logout API、清除 localStorage guest_token、重導向）

## 9. 情緒除噪器前端

- [x] 9.1 建立模式選擇畫面（引導式 / 自由書寫兩個選項）
- [x] 9.2 建立引導式三步驟流程（Step 1 強度選擇、Step 2 觸發事件、Step 3 保護洞察）
- [x] 9.3 建立自由書寫模式（開放文字輸入、空白驗證）
- [x] 9.4 建立情緒標籤選擇元件（預設清單 + 自訂輸入，可多選）
- [x] 9.5 建立情緒記錄完成頁（顯示成就提示卡（當日 >=3 次時）與衝突提示按鈕）
- [x] 9.6 建立情緒記錄歷史頁（時間倒序列表、空狀態）

## 10. 微小成就系統前端

- [x] 10.1 建立成就新增頁（title 必填、my_standard 選填含 placeholder、提交 API）
- [x] 10.2 建立成就時間軸回顧頁（時間倒序列表、空狀態）

## 11. 應該 vs 想要前端

- [x] 11.1 建立衝突新增頁（should/want 文字輸入、source 下拉選擇、feeling_tags 選擇、chosen 選擇）
- [x] 11.2 建立 feeling_tags 選擇元件（預設清單 + 自訂輸入，可多選）
- [x] 11.3 建立衝突歷史頁（時間倒序列表、空狀態）
- [x] 11.4 建立來源分佈統計頁（Recharts 圓餅圖，呼叫 `/api/conflicts/stats`，空狀態提示）

## 12. 被動提示系統前端

- [x] 12.1 在 AppContext 實作當日情緒計數邏輯（記錄成功後 +1，跨日重置）
- [x] 12.2 建立提示卡元件（含關閉按鈕與跳轉按鈕）
- [x] 12.3 在情緒記錄完成頁整合提示邏輯（當日 >=3 次顯示成就提示卡）
- [x] 12.4 在情緒記錄完成頁加入「這是某個衝突造成的嗎？」次要按鈕

## 13. 整合測試

- [ ] 13.1 測試完整訪客流程：取得 guest_token → 記錄情緒 → 記錄成就 → 記錄衝突
- [ ] 13.2 測試訪客 → 註冊帳號 → 資料完整遷移（確認三張資料表資料均保留）
- [ ] 13.3 測試登入/登出/再登入流程
- [ ] 13.4 測試被動提示觸發（連續記錄 3 次情緒）
- [ ] 13.5 測試應該 vs 想要圓餅圖正確顯示各來源分佈
