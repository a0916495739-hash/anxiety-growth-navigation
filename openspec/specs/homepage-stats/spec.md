# homepage-stats

## Purpose

首頁週報摘要，讓使用者在首頁即可看到本週的使用成果，提升持續使用的動力。

## Requirements

### Requirement: 本週數據摘要區塊
系統 SHALL 在首頁顯示使用者本週（過去 7 天）的使用統計，包含情緒記錄次數、小成就數量、衝突釐清次數。

#### Scenario: 有本週資料時顯示摘要
- **WHEN** 使用者開啟首頁，且過去 7 天至少有一筆任何類型的記錄
- **THEN** 系統顯示「本週你做到了」摘要卡，呈現各類別非零的計數

#### Scenario: 計數為零的類別不顯示
- **WHEN** 某個類別（如成就）本週無記錄
- **THEN** 該類別的統計數字不顯示在摘要卡中

#### Scenario: 無本週資料時不顯示摘要
- **WHEN** 使用者過去 7 天無任何記錄
- **THEN** 系統不顯示摘要卡，首頁只顯示功能入口

#### Scenario: API 端點
- **WHEN** 前端載入首頁
- **THEN** 前端呼叫 `GET /api/stats`，後端回傳 `{ emotions: N, achievements: N, conflicts: N }`（各為過去 7 天計數）
