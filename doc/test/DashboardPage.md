---
page: DashboardPage
source: src/pages/DashboardPage.tsx
---

> 狀態：初始為 [ ]、完成為 [x]  
> 測試類型：前端元素、Mock API、導航與 function 邏輯  
> **本次驗證**（2026-04-01）：`vitest run --run` → `DashboardPage.test.tsx` **8/8 通過**；專案合計 **24/24 通過**

---

## [x] 【前端元素】應顯示標題「儀表板」、「登出」按鈕與「商品列表」標題

**範例輸入**：已登入並進入 `/dashboard`  
**期待輸出**：`h1`「儀表板」、`button`「登出」、`h3`「商品列表」可見

---

## [x] 【前端元素】應顯示歡迎標題「Welcome, {username} 👋」、頭像首字與角色徽標（管理員或一般用戶）

**範例輸入**：MSW `/api/me` 回傳 `username: dean`、`role: admin`  
**期待輸出**：`h2` 含「Welcome, dean 👋」；頭像區顯示「D」；角色徽標為「管理員」

---

## [x] 【前端元素】當使用者角色為 admin 時導覽應顯示「🛠️ 管理後台」連結

**範例輸入**：`msw_user_role` 為 `admin`  
**期待輸出**：`link`「🛠️ 管理後台」存在且指向 `/admin`

---

## [x] 【前端元素】當使用者角色為 user 時導覽不應顯示「🛠️ 管理後台」連結

**範例輸入**：`msw_user_role` 為 `user`  
**期待輸出**：畫面無「🛠️ 管理後台」連結

---

## [x] 【Mock API】載入商品期間應顯示「載入商品中...」

**範例輸入**：`msw_delay` 設為足夠長毫秒數，已登入並進入 `/dashboard`  
**期待輸出**：出現「載入商品中...」與 loading 區塊；延遲結束後列表出現

---

## [x] 【Mock API】商品 API 成功時應在列表中顯示商品名稱與價格

**範例輸入**：預設 `products` 情境為 success  
**期待輸出**：可見「筆記型電腦」及含 `NT$` 與金額之價格文案（對應 mock 資料）

---

## [x] 【Mock API】商品 API 回傳錯誤時應顯示錯誤訊息「伺服器錯誤，請稍後再試」

**範例輸入**：`localStorage` 設定 `msw_products_scenario` 為 `server_error`  
**期待輸出**：`.error-container`（或錯誤區）顯示「伺服器錯誤，請稍後再試」

---

## [x] 【導航與 function 邏輯】點擊「登出」應清除登入狀態並導向登入路由

**範例輸入**：在 `/dashboard` 點擊「登出」  
**期待輸出**：路由顯示登入路由替身；`localStorage` 無 token

---
