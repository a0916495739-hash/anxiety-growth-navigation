## ADDED Requirements

### Requirement: 新增衝突時刻記錄
系統 SHALL 允許使用者記錄一個「應該」與「想要」的衝突時刻，包含衝突內容、期望來源、feeling tags 與當下選擇。

#### Scenario: 成功新增衝突記錄
- **WHEN** 使用者填寫 should_content、want_content、source 並提交
- **THEN** 系統儲存一筆 conflict 記錄，回傳成功，顯示完成畫面

#### Scenario: should_content 為必填
- **WHEN** 使用者未填寫「我應該要...」欄位即嘗試提交
- **THEN** 系統顯示驗證提示，不儲存

#### Scenario: want_content 為必填
- **WHEN** 使用者未填寫「但我想要...」欄位即嘗試提交
- **THEN** 系統顯示驗證提示，不儲存

#### Scenario: 選擇期望來源
- **WHEN** 使用者在 source 欄位選擇來源
- **THEN** 系統顯示四個選項：家人（family）、同儕/朋友（peers）、社會期待（society）、自我要求（self），使用者 SHALL 選擇其中一個

#### Scenario: 記錄當下選擇（chosen）
- **WHEN** 使用者選擇「今天我選擇了...」
- **THEN** 系統顯示四個選項：應該（should）、想要（want）、都沒有（neither）、還沒決定（pending），此欄位為選填，預設為 pending

---

### Requirement: 情緒標籤（feeling_tags）
系統 SHALL 允許使用者在衝突記錄中加入 feeling_tags，描述衝突引發的情緒感受。

#### Scenario: 選擇 feeling_tags
- **WHEN** 使用者在衝突記錄表單中操作 feeling_tags 欄位
- **THEN** 系統提供預設標籤清單（如：自由、壓力、期待、委屈、迷茫），可多選，可自訂輸入

#### Scenario: 略過 feeling_tags
- **WHEN** 使用者不選擇任何 feeling_tag 即提交
- **THEN** 系統儲存 feeling_tags=[]，不阻擋提交

---

### Requirement: 應該來源分佈圖表
系統 SHALL 提供圓餅圖，呈現使用者所有衝突記錄中「應該」來源（source）的分佈比例。

#### Scenario: 查看來源分佈圖
- **WHEN** 使用者開啟應該 vs 想要的統計頁
- **THEN** 系統以圓餅圖顯示 family / peers / society / self 各佔的百分比，並附上各類別的數量

#### Scenario: 記錄不足以繪製圖表
- **WHEN** 使用者尚未有任何衝突記錄
- **THEN** 系統顯示空狀態提示，說明「記錄幾個衝突時刻後，你就能看到你的應該主要來自哪裡」

---

### Requirement: 衝突記錄歷史查看
系統 SHALL 以時間倒序列表呈現所有衝突記錄。

#### Scenario: 查看衝突歷史
- **WHEN** 使用者開啟衝突歷史頁
- **THEN** 系統顯示每筆記錄的日期、should/want 內容摘要、來源、chosen 結果
