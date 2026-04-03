## ADDED Requirements

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
