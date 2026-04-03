# achievement-tracker

## Purpose

微小成就追蹤器，允許使用者記錄與回顧自己的小成就，以時間軸形式呈現。

## Requirements

### Requirement: 新增微小成就
系統 SHALL 允許使用者隨時新增一筆成就記錄，包含必填的成就描述與選填的個人標準說明。

#### Scenario: 成功新增成就（含標準）
- **WHEN** 使用者填寫成就標題與個人標準後提交
- **THEN** 系統儲存一筆 achievement，含 title 與 my_standard，顯示成功回饋

#### Scenario: 成功新增成就（僅標題）
- **WHEN** 使用者只填寫成就標題、略過個人標準後提交
- **THEN** 系統儲存一筆 achievement，my_standard 為 null，顯示成功回饋

#### Scenario: 標題為空時無法提交
- **WHEN** 使用者未填寫成就標題即嘗試提交
- **THEN** 系統顯示驗證提示，不儲存

#### Scenario: 個人標準輸入提示
- **WHEN** 使用者看到個人標準欄位
- **THEN** 欄位顯示 placeholder 提示：「為什麼這件事對你來說算是一個成就？（選填）」

---

### Requirement: 成就時間軸回顧
系統 SHALL 以時間軸形式展示使用者所有成就記錄，以時間倒序排列（最新在上），並可刪除個別記錄。

#### Scenario: 查看成就時間軸
- **WHEN** 使用者開啟成就回顧頁
- **THEN** 系統顯示所有成就，每筆顯示日期、成就標題、個人標準（若有）

#### Scenario: 無成就記錄
- **WHEN** 使用者尚未記錄任何成就
- **THEN** 系統顯示空狀態插圖與提示，鼓勵使用者記錄今天的第一個小成就

#### Scenario: 刪除成就記錄
- **WHEN** 使用者點擊單筆成就的刪除按鈕並確認
- **THEN** 系統呼叫 `DELETE /api/achievements/:id`，成功後從列表移除，不重新載入整頁
