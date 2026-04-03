# docker-dev-env

## Purpose

Docker 本地開發環境設定，提供一鍵啟動後端 API 與資料庫的能力，並管理環境變數。

## Requirements

### Requirement: Docker Compose 本地開發環境
系統 SHALL 提供 `docker-compose.yml`，以單一指令啟動後端 Express API 服務與 PostgreSQL 資料庫，供本地開發使用。

#### Scenario: 一鍵啟動開發環境
- **WHEN** 開發者在專案根目錄執行 `docker compose up`
- **THEN** PostgreSQL 資料庫與 Express API 服務均成功啟動，API 可於 `localhost:3001` 存取，資料庫於 `localhost:5432` 存取

#### Scenario: 資料庫持久化
- **WHEN** 開發者停止並重新啟動 Docker Compose
- **THEN** 資料庫資料持久保存（使用 Docker named volume）

#### Scenario: 後端程式碼熱重載
- **WHEN** 開發者修改後端程式碼
- **THEN** Express 服務自動重啟（使用 nodemon），無需手動重啟 container

---

### Requirement: 資料庫自動初始化
系統 SHALL 在 PostgreSQL 容器首次啟動時，自動執行 SQL migration 建立所有資料表。

#### Scenario: 首次啟動建立資料表
- **WHEN** PostgreSQL 容器為全新狀態（無既有資料）
- **THEN** 系統自動執行 migration SQL，建立 users、emotion_records、achievements、conflicts 四張資料表

#### Scenario: 已有資料時跳過初始化
- **WHEN** PostgreSQL 容器已有資料庫資料
- **THEN** 不重複執行 migration，保留既有資料

---

### Requirement: 環境變數管理
系統 SHALL 以 `.env` 檔案管理環境變數，提供 `.env.example` 作為範本，`.env` 不進版本控制。

#### Scenario: 開發者首次設定環境
- **WHEN** 開發者複製 `.env.example` 為 `.env` 並填入必要值
- **THEN** Docker Compose 與後端服務正確讀取環境變數啟動

#### Scenario: 必要環境變數
- **WHEN** 系統啟動
- **THEN** 以下變數 SHALL 存在：`DATABASE_URL`、`JWT_SECRET`、`PORT`（後端）、`POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DB`
