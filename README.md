# 抗焦慮成長導航

心理健康 App，幫助 20 幾歲的年輕人面對社群比較焦慮。

## 功能

- **情緒除噪器**：引導式或自由書寫，記錄並轉化負面情緒
- **微小成就系統**：記錄生活中的小事，累積成就感
- **應該 vs 想要**：釐清外在期望與內在渴望的衝突

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | React + Vite |
| 後端 | Express (Node.js) |
| 資料庫 | PostgreSQL 16 |
| 本地開發環境 | Docker Compose（僅 DB + pgAdmin） |

---

## 本地開發啟動步驟

### 前置需求

- [Node.js](https://nodejs.org/) 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. 複製環境變數

```bash
cp .env.example .env
```

> `.env` 已包含預設開發值，無需修改即可直接使用。

### 2. 啟動 PostgreSQL + pgAdmin（Docker）

```bash
docker compose up -d
```

確認服務啟動：

```bash
docker compose ps
```

應看到 `postgres` 與 `pgadmin` 狀態均為 `healthy` / `running`。

### 3. 啟動後端（本機）

```bash
cd backend
npm install     # 首次執行才需要
npm run dev
```

後端啟動時會自動執行 DB migration，建立所有資料表。
API 服務運行於 `http://localhost:3001`

### 4. 啟動前端（本機，另開終端機）

```bash
cd frontend
npm install     # 首次執行才需要
npm run dev
```

前端運行於 `http://localhost:5173`

---

## 服務一覽

| 服務 | 網址 | 說明 |
|------|------|------|
| 前端 | http://localhost:5173 | React App |
| 後端 API | http://localhost:3001 | Express API |
| pgAdmin | http://localhost:5050 | 資料庫管理介面 |
| PostgreSQL | localhost:5432 | 資料庫（直接連線） |

### pgAdmin 登入

- **帳號**：`admin@local.dev`
- **密碼**：`admin`

首次進入後，新增 Server 連線：

| 欄位 | 值 |
|------|----|
| Host | `host.docker.internal` |
| Port | `5432` |
| Database | `anxiety_navigator` |
| Username | `appuser` |
| Password | `apppassword` |

---

## 專案結構

```
/
├── .env.example          # 環境變數範本
├── docker-compose.yml    # Postgres + pgAdmin
├── backend/
│   ├── src/
│   │   ├── index.js               # Express 入口
│   │   ├── middleware/auth.js     # JWT / guest_token 驗證
│   │   ├── routes/
│   │   │   ├── auth.js            # 帳號、訪客、遷移
│   │   │   ├── emotions.js        # 情緒除噪器 API
│   │   │   ├── achievements.js    # 微小成就 API
│   │   │   └── conflicts.js       # 應該 vs 想要 API
│   │   └── db/
│   │       ├── pool.js            # PostgreSQL 連線池
│   │       ├── migrate.js         # Migration 執行腳本
│   │       └── migrations/
│   │           └── 001_init.sql   # 資料表建立
│   └── package.json
└── frontend/
    └── src/
        ├── App.jsx                # 路由設定
        ├── context/AppContext.jsx # 全域狀態（登入、guest_token、計數）
        ├── api/                   # API 呼叫封裝
        ├── components/            # 共用元件（TagSelector、PromptCard）
        └── pages/                 # 各功能頁面
```

## API 端點

### 認證
| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/auth/guest` | 取得訪客 token |
| POST | `/api/auth/register` | 註冊（可帶訪客 token 遷移資料） |
| POST | `/api/auth/login` | 登入 |
| POST | `/api/auth/logout` | 登出 |

### 情緒除噪器
| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/emotions` | 新增記錄 |
| GET | `/api/emotions` | 取得歷史 |
| GET | `/api/emotions/today/count` | 今日記錄數 |

### 微小成就
| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/achievements` | 新增成就 |
| GET | `/api/achievements` | 取得歷史 |

### 應該 vs 想要
| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/conflicts` | 新增衝突記錄 |
| GET | `/api/conflicts` | 取得歷史 |
| GET | `/api/conflicts/stats` | 來源分佈統計 |

## 停止服務

```bash
docker compose down
```

保留資料庫資料。若要完全清除（包含資料）：

```bash
docker compose down -v
```
