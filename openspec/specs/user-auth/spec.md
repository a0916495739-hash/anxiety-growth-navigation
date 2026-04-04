# user-auth

## Purpose

使用者認證系統，支援訪客模式（UUID guest_token）與 Email 帳號，並提供訪客資料完整遷移至正式帳號的能力。

## Requirements

### Requirement: 訪客模式
系統 SHALL 允許使用者在不建立帳號的情況下，以訪客身份使用所有核心功能。訪客身份以 UUID guest_token 識別，儲存於瀏覽器 localStorage，並隨每個 API 請求以 header 傳送。

#### Scenario: 首次訪問取得 guest_token
- **WHEN** 使用者首次開啟 App 且 localStorage 中無 guest_token
- **THEN** 前端呼叫 `POST /api/auth/guest`，後端回傳一組新的 UUID guest_token，前端儲存至 localStorage

#### Scenario: 訪客再次訪問
- **WHEN** 使用者再次開啟 App 且 localStorage 已有 guest_token
- **THEN** 前端直接使用既有 guest_token，不重新申請

#### Scenario: 訪客資料與帳號隔離
- **WHEN** 使用者以訪客身份記錄資料
- **THEN** 所有資料以 guest_token 關聯儲存，與其他帳號資料完全隔離

---

### Requirement: Email 帳號註冊
系統 SHALL 允許使用者以 Email + 密碼建立正式帳號。密碼 SHALL 以 bcrypt 雜湊儲存，不得明文保存。

#### Scenario: 成功註冊
- **WHEN** 使用者提交有效 Email 與密碼（至少 8 字元）
- **THEN** 系統建立帳號，回傳 JWT，並設定 httpOnly cookie

#### Scenario: 重複 Email 註冊
- **WHEN** 使用者提交已存在的 Email
- **THEN** 系統回傳 409 錯誤，訊息說明 Email 已被使用

#### Scenario: 密碼過短
- **WHEN** 使用者提交少於 8 字元的密碼
- **THEN** 系統回傳 422 錯誤，訊息說明密碼長度不足

---

### Requirement: Email 帳號登入
系統 SHALL 允許已註冊使用者以 Email + 密碼登入，並取得 JWT。

#### Scenario: 成功登入
- **WHEN** 使用者提交正確的 Email 與密碼
- **THEN** 系統回傳 JWT，設定 httpOnly cookie，前端導向主頁

#### Scenario: 帳號不存在或密碼錯誤
- **WHEN** 使用者提交不存在的 Email 或錯誤密碼
- **THEN** 系統回傳 401 錯誤，不區分帳號不存在或密碼錯誤（防止帳號枚舉）

---

### Requirement: 訪客資料完整遷移
系統 SHALL 在訪客完成帳號建立後，將其所有訪客資料（情緒記錄、成就、衝突）完整遷移至新帳號。遷移 SHALL 在單一資料庫 transaction 內完成。

#### Scenario: 訪客註冊時資料遷移
- **WHEN** 訪客提交有效的 Email 與密碼完成註冊，且 request header 帶有 guest_token
- **THEN** 系統在同一 transaction 內：建立帳號、將所有 guest_token 資料更新為新 user_id、清除 guest_token 關聯，全部成功後回傳 JWT

#### Scenario: 遷移失敗回滾
- **WHEN** 遷移過程中發生任何資料庫錯誤
- **THEN** 整個 transaction 回滾，帳號不建立，訪客資料保持原狀，系統回傳 500 錯誤

#### Scenario: 無訪客資料時直接註冊
- **WHEN** 使用者未帶 guest_token 即完成註冊
- **THEN** 系統正常建立帳號，不執行遷移邏輯

---

### Requirement: JWT 認證保護 API
系統 SHALL 要求所有非公開 API（除了 `/api/auth/*` 與 guest 初始化外）驗證 JWT 或 guest_token。

#### Scenario: 有效 JWT 存取受保護資源
- **WHEN** 請求帶有有效的 httpOnly cookie JWT
- **THEN** 系統允許存取，並以 JWT 中的 user_id 識別使用者

#### Scenario: 無效或過期 JWT
- **WHEN** 請求帶有無效或過期的 JWT
- **THEN** 系統回傳 401 錯誤

#### Scenario: 以 guest_token 存取受保護資源
- **WHEN** 請求帶有有效的 guest_token header 且無 JWT
- **THEN** 系統允許存取，以 guest_token 識別訪客資料範圍

---

### Requirement: 帳號設定與個人檔案頁
系統 SHALL 提供登入使用者一個帳號設定頁（`/account`），包含個人檔案（顯示名稱）、修改密碼與登出。

#### Scenario: 查看帳號資訊
- **WHEN** 登入使用者開啟帳號設定頁
- **THEN** 系統顯示 Avatar（名稱首字母）、顯示名稱（若有）、Email，資料來自 `GET /api/auth/me`

#### Scenario: 修改顯示名稱
- **WHEN** 登入使用者輸入顯示名稱（1–30 字元）並儲存
- **THEN** 系統呼叫 `PUT /api/auth/profile`，更新 `users.display_name`，並同步更新 AppContext 中的 displayName，首頁 nav 立即反映

#### Scenario: 顯示名稱驗證
- **WHEN** 使用者提交超過 30 字元的顯示名稱
- **THEN** 系統回傳 422 錯誤，不更新

#### Scenario: 修改密碼成功
- **WHEN** 登入使用者提交目前密碼與新密碼（至少 8 字元）
- **THEN** 系統呼叫 `PUT /api/auth/password`，驗證通過後更新密碼雜湊，顯示成功訊息，清空欄位

#### Scenario: 目前密碼不正確
- **WHEN** 登入使用者提交錯誤的目前密碼
- **THEN** 系統回傳 401，顯示「目前密碼不正確」錯誤訊息，不更新密碼

#### Scenario: 登出後跳轉登入頁
- **WHEN** 登入使用者點擊「登出」按鈕
- **THEN** 系統呼叫 `POST /api/auth/logout` 清除 JWT cookie、重置 AppContext 狀態（isLoggedIn=false、displayName=null），導向 `/login`

#### Scenario: 未登入使用者訪問設定頁
- **WHEN** 未登入使用者直接訪問 `/account`
- **THEN** 系統導向首頁

---

### Requirement: 登入狀態持久化
系統 SHALL 在頁面重整後正確恢復登入狀態，不閃爍訪客畫面。

#### Scenario: 頁面重整恢復登入
- **WHEN** 已登入使用者重整頁面
- **THEN** 系統在 JWT 驗證完成前顯示載入畫面，驗證成功後直接顯示登入狀態，不出現訪客橫幅閃爍
