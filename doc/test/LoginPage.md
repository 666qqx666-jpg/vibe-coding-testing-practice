---
page: LoginPage
source: src/pages/LoginPage.tsx
---

> 狀態：初始為 [ ]、完成為 [x]  
> 測試類型：前端元素、表單驗證、Mock API、權限與導頁  
> **本次驗證**（2026-04-01）：`vitest run --run` → `LoginPage.test.tsx` **11/11 通過**；專案合計 **24/24 通過**

---

## [x] 【前端元素】應顯示標題「歡迎回來」、副標「請登入以繼續」、電子郵件與密碼標籤及對應 placeholder

**範例輸入**：進入登入頁  
**期待輸出**：畫面可見 `h1` 為「歡迎回來」、`#email` / `#password` 存在且 placeholder 分別為 `you@example.com` 與「至少 8 個字元，需包含英數」；提交按鈕文案為「登入」

---

## [x] 【前端元素】當 `VITE_API_URL` 未設定時應顯示頁尾測試帳號說明

**範例輸入**：`import.meta.env.VITE_API_URL` 為空（與執行環境一致）  
**期待輸出**：`.login-footer` 內出現「測試帳號：任意 email 格式 / 密碼需包含英數且8位以上」

---

## [x] 【表單驗證】提交空或格式錯誤的 Email 應顯示「請輸入有效的 Email 格式」且不出發登入請求

**範例輸入**：Email 留空或 `not-an-email`，密碼填 `abc12345`（符合長度與英數）後提交  
**期待輸出**：出現 `.field-error` 文案為「請輸入有效的 Email 格式」；`input#email` 具 `error` class

---

## [x] 【表單驗證】密碼少於 8 字元應顯示「密碼必須至少 8 個字元」

**範例輸入**：Email `a@b.co`，密碼 `ab12`  
**期待輸出**：`.field-error` 含「密碼必須至少 8 個字元」

---

## [x] 【表單驗證】密碼長度足夠但缺少字母或數字應顯示「密碼必須包含英文字母和數字」

**範例輸入**：Email `a@b.co`，密碼 `abcdefgh`（僅字母）或 `12345678`（僅數字）  
**期待輸出**：對應欄位錯誤為「密碼必須包含英文字母和數字」

---

## [x] 【權限與導頁】透過 `auth:unauthorized` 事件帶入過期訊息時應在錯誤橫幅顯示該文案

**範例輸入**：`window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: '登入已過期，請重新登入' }))`  
**期待輸出**：`role="alert"` 區塊顯示「登入已過期，請重新登入」

---

## [x] 【權限與導頁】當 `localStorage` 已有 token 且 `/api/me` 成功時應自動導向 `/dashboard`

**範例輸入**：寫入 `auth_token`、MSW `me` 為 `success`，從 `/login` 進入頁面  
**期待輸出**：最終畫面為儀表板路由對應內容（pathname `/dashboard`）

---

## [x] 【Mock API】表單通過驗證且登入成功應導向儀表板並顯示成功後的畫面

**範例輸入**：MSW `login` 情境為 `success`；Email `user@test.com`、密碼 `pass1234`  
**期待輸出**：路由切換至 `/dashboard` 對應的測試替身內容

---

## [x] 【Mock API】登入 API 回傳 401 且帶 `message` 時應在錯誤橫幅顯示該訊息

**範例輸入**：`localStorage` 設定 `msw_login_scenario` 為 `invalid_password`  
**期待輸出**：`role="alert"` 顯示「密碼錯誤」

---

## [x] 【Mock API】登入 API 回傳 401 且 body 無 `message` 欄位時應顯示「登入失敗，請稍後再試」

**範例輸入**：`server.use` 覆寫 `POST /api/login` 回傳 `401` 與空 JSON `{}`  
**期待輸出**：`role="alert"` 顯示「登入失敗，請稍後再試」

---

## [x] 【Mock API】送出登入期間應顯示載入狀態並停用輸入與提交按鈕

**範例輸入**：MSW `delay` 設為足夠長的毫秒數後還原；合法帳密後點擊登入  
**期待輸出**：按鈕出現「登入中...」、`#email`/`#password`/submit 為 `disabled`，請求結束後恢復

---
