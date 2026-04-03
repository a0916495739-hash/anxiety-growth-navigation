# onboarding

## Purpose

新手引導流程，讓第一次使用 App 的使用者快速了解三個核心功能，降低使用門檻。

## Requirements

### Requirement: 首次進入顯示引導彈窗
系統 SHALL 在使用者首次進入 App 時，自動顯示一個 4 步驟引導彈窗，介紹三個核心功能與 App 精神。

#### Scenario: 首次進入顯示 Onboarding
- **WHEN** 使用者首次開啟 App（localStorage 中無 `onboarding_done` 標記）
- **THEN** 系統在首頁上方顯示半透明遮罩 + 引導彈窗，共 4 步：情緒除噪器、微小成就系統、應該 vs 想要、準備好了

#### Scenario: 已看過不再顯示
- **WHEN** 使用者曾完成或略過引導流程（localStorage 已有 `onboarding_done=1`）
- **THEN** 系統不顯示引導彈窗，直接顯示首頁

#### Scenario: 略過引導
- **WHEN** 使用者在引導流程中點擊「略過」按鈕
- **THEN** 系統立即關閉彈窗，在 localStorage 寫入 `onboarding_done=1`，不再顯示

#### Scenario: 完成引導
- **WHEN** 使用者看完所有步驟並點擊「開始使用」
- **THEN** 系統關閉彈窗，在 localStorage 寫入 `onboarding_done=1`

### Requirement: 引導步驟內容
每個引導步驟 SHALL 包含 emoji 圖示、功能名稱、說明文字，以及進度指示點（dot indicator）。

#### Scenario: 步驟進度指示
- **WHEN** 使用者在任一步驟中
- **THEN** 底部顯示 4 個進度點，當前步驟的點拉伸為膠囊形（寬 20px），其餘為圓點（寬 6px）
