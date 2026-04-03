## ADDED Requirements

### Requirement: 情緒記錄模式選擇
系統 SHALL 在使用者每次進入情緒除噪器時，提供引導式與自由書寫兩種模式供選擇，不記憶上次選擇。

#### Scenario: 進入情緒除噪器
- **WHEN** 使用者開啟情緒除噪器功能
- **THEN** 系統顯示模式選擇畫面，包含「引導我思考」與「自由書寫」兩個選項

---

### Requirement: 引導式情緒記錄
系統 SHALL 以三步驟引導使用者反思情緒：Step 1 強度評分、Step 2 觸發事件、Step 3 情緒的保護作用。

#### Scenario: 完成引導式記錄
- **WHEN** 使用者依序填寫三個步驟並提交
- **THEN** 系統儲存一筆 emotion_record，mode='guided'，含 intensity、trigger_event、protection 欄位，並顯示完成畫面

#### Scenario: Step 1 情緒強度
- **WHEN** 使用者在 Step 1 選擇情緒強度
- **THEN** 系統顯示 1 至 5 的選項（1=很輕微，5=非常強烈），使用者 SHALL 選擇其中一個才能繼續

#### Scenario: Step 2 觸發事件
- **WHEN** 使用者在 Step 2 描述觸發事件
- **THEN** 系統顯示文字輸入框，提示「是什麼事情引發了這個情緒？」，此欄位為選填，使用者可跳過

#### Scenario: Step 3 情緒保護
- **WHEN** 使用者在 Step 3 思考情緒的保護作用
- **THEN** 系統顯示文字輸入框，提示「這個情緒在保護你什麼？」，此欄位為選填，使用者可跳過

---

### Requirement: 自由書寫情緒記錄
系統 SHALL 提供無引導的開放文字輸入，讓使用者自由書寫情緒。

#### Scenario: 完成自由書寫記錄
- **WHEN** 使用者在自由書寫模式輸入文字並提交
- **THEN** 系統儲存一筆 emotion_record，mode='free'，raw_emotion 欄位儲存全文，其餘引導欄位為 null

#### Scenario: 空白提交
- **WHEN** 使用者未輸入任何文字即嘗試提交
- **THEN** 系統顯示提示，要求至少輸入一些內容，不儲存

---

### Requirement: 情緒標籤
系統 SHALL 允許使用者在完成情緒記錄前，選擇或輸入情緒標籤（emotion_tags）。

#### Scenario: 從預設清單選擇標籤
- **WHEN** 使用者在記錄流程的標籤步驟點選預設標籤
- **THEN** 選中的標籤高亮顯示，可多選

#### Scenario: 自訂標籤輸入
- **WHEN** 使用者輸入預設清單以外的標籤文字並確認
- **THEN** 自訂標籤加入選中列表，與預設標籤一同儲存

#### Scenario: 略過標籤
- **WHEN** 使用者不選擇任何標籤即提交
- **THEN** 系統儲存 emotion_tags=[]，不阻擋提交

---

### Requirement: 情緒記錄歷史查看
系統 SHALL 允許使用者查看自己過去的情緒記錄，以時間倒序排列。

#### Scenario: 查看歷史列表
- **WHEN** 使用者開啟情緒記錄歷史頁
- **THEN** 系統顯示過去所有記錄，每筆顯示日期、模式、情緒強度（引導模式）、前50字內容

#### Scenario: 無歷史記錄
- **WHEN** 使用者尚未有任何情緒記錄
- **THEN** 系統顯示空狀態提示，鼓勵使用者開始記錄
