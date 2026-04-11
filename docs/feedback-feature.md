# 使用者意見回饋功能說明

## 這個功能在做什麼？

讓登入的用戶在「帳號設定」頁面，打一段文字、按「送出回饋」，  
這段文字就會存進資料庫，開發者（你）之後可以去查看。

---

## 三個檔案做了什麼？

### 第一個：資料庫 — 準備一張「留言本」

**檔案：** `backend/src/db/migrations/004_add_feedback.sql`

```sql
CREATE TABLE IF NOT EXISTS feedback (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

白話版：在資料庫建一張表格，長這樣：

| id | user_id | content | created_at |
|---|---|---|---|
| 1 | 42 | 這個 App 很好用！ | 2026-04-11 10:30 |
| 2 | 87 | 希望可以加深色模式 | 2026-04-11 11:00 |

- `id` → 每筆資料的編號，自動填
- `user_id` → 是哪個用戶送的
- `content` → 他寫的文字
- `created_at` → 什麼時候送的，自動填

---

### 第二個：後端 — 接收資料的窗口

**檔案：** `backend/src/routes/feedback.js`

```js
router.post('/', auth, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Login required' });
  }

  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }
  if (content.trim().length > 2000) {
    return res.status(422).json({ error: '意見回饋最多 2000 字' });
  }

  try {
    await pool.query(
      'INSERT INTO feedback (user_id, content) VALUES ($1, $2)',
      [req.userId, content.trim()]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '提交失敗，請稍後再試' });
  }
});
```

白話版：後端就像便利商店收銀台，前端把資料送過來，它做三件事：

1. **查身份** — 沒登入？拒絕，回傳「請先登入」
2. **檢查內容** — 空白？拒絕。超過 2000 字？拒絕
3. **寫進資料庫** — 沒問題就存進去，回傳「成功」

---

### 第三個：前端 — 使用者看到的畫面

**檔案：** `frontend/src/pages/Account.jsx`（送出邏輯的部分）

```js
async function handleSubmitFeedback(e) {
  e.preventDefault();
  if (feedbackLoading || !feedbackText.trim()) return;

  setFeedbackMsg(null);
  setFeedbackLoading(true);

  try {
    await submitFeedback(feedbackText.trim());
    setFeedbackMsg({ type: 'success', text: '已送出，謝謝你的回饋！' });
    setFeedbackText('');
  } catch {
    setFeedbackMsg({ type: 'error', text: '送出失敗，請再試一次' });
  } finally {
    setFeedbackLoading(false);
  }
}
```

白話版：使用者按下「送出」按鈕後，發生了這些事：

```
按下送出
  ↓
按鈕變成「送出中…」（避免重複點）
  ↓
把文字傳給後端
  ↓
  ├─ 成功 → 顯示綠色「已送出！」，清空文字框
  └─ 失敗 → 顯示紅色「請再試一次」
  ↓
按鈕恢復正常
```

---

## 完整流程（從頭到尾一次看懂）

```
[你] 在文字框打字，按「送出回饋」
        ↓
[前端] 把文字包成一個請求，傳給後端
        ↓
[後端] 確認你有登入，內容沒問題
        ↓
[資料庫] 新增一筆記錄
        ↓
[前端] 顯示「已送出！」
```

---

## 錯誤怎麼處理？

| 狀況 | 誰擋下來 | 用戶看到什麼 |
|---|---|---|
| 文字框是空的 | 前端（按鈕是灰的） | 按不下去 |
| 沒有登入 | 後端 | 「請先登入」 |
| 超過 2000 字 | 後端 | 「最多 2000 字」 |
| 網路斷了 | 前端 catch | 「送出失敗，請再試一次」 |
| 資料庫壞了 | 後端 try/catch | 「提交失敗，請稍後再試」 |

---

*文件最後更新：2026-04-11*
