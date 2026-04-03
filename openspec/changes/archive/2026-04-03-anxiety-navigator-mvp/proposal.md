## Why

20 幾歲的年輕人長期暴露在社群媒體的比較文化中，容易積累自我否定的焦慮感，卻缺乏輕量、私人的工具來梳理情緒、肯定自我、釐清內外在期望的衝突。本 MVP 以「數位私人日記」的形式，提供三個互相連結的工具，幫助使用者從焦慮走向自我理解。

## What Changes

- 建立全新的 React 前端 + Express 後端 + PostgreSQL 資料庫架構，以 Docker Compose 提供本地開發環境
- 新增**情緒除噪器**：使用者每次可選擇引導式（三步驟反思）或自由書寫模式記錄並轉化負面情緒
- 新增**微小成就系統**：隨時記錄生活中的小事，支援使用者自訂成就標準
- 新增**應該 vs 想要**：記錄內外在期望的衝突時刻，並以圖表呈現「應該」的來源分佈
- 新增**訪客模式**：無需帳號即可體驗所有功能，註冊後資料完整遷移
- 新增**被動提示系統**：純前端規則，在適當時機以 in-app 提示卡引導使用者跨功能使用

## Capabilities

### New Capabilities

- `user-auth`: 帳號系統，含訪客模式（guest_token）、Email 註冊/登入、訪客資料遷移至正式帳號
- `emotion-recorder`: 情緒除噪器，支援引導式（強度＋觸發事件＋保護洞察）與自由書寫兩種模式，含情緒標籤
- `achievement-tracker`: 微小成就系統，自訂標準（選填）、隨時新增、時間軸回顧
- `should-vs-want`: 衝突時刻記錄，含來源分類（family/peers/society/self）、feeling tags、選擇結果、來源分佈圓餅圖
- `passive-prompts`: 前端規則引擎，偵測使用者行為（如當日第3次記錄情緒）並觸發跨功能 in-app 提示卡
- `docker-dev-env`: Docker Compose 本地開發環境，包含 Express API 服務與 PostgreSQL 資料庫

### Modified Capabilities

（無，本次為全新專案）

## Impact

- 全新 monorepo 結構：`/frontend`（React）、`/backend`（Express）、`docker-compose.yml`
- 後端提供 RESTful API，涵蓋認證、情緒記錄、成就、衝突四大資源
- 資料庫：PostgreSQL，四張核心資料表（users, emotion_records, achievements, conflicts）
- 前端不含在 Docker 中，以本地 dev server 啟動
- 無第三方社群整合，資料完全私人
