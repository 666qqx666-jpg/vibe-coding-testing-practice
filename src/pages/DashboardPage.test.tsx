import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { AuthProvider } from '../context/AuthContext';
import { SCENARIO_KEYS } from '../mocks/handlers';
import { TOKEN_KEY } from '../api/axiosInstance';
import { productApi } from '../api/productApi';

function renderDashboardAt(path = '/dashboard') {
    localStorage.setItem(TOKEN_KEY, 'fake.jwt.token');
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AuthProvider>
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/admin" element={<div>Admin Placeholder</div>} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    );
}

describe('DashboardPage', () => {
    beforeEach(() => {
        localStorage.removeItem(SCENARIO_KEYS.products);
        localStorage.removeItem(SCENARIO_KEYS.userRole);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('版面與使用者資訊', () => {
        it('載入完成後應顯示標題「儀表板」、歡迎文案與使用者名稱', async () => {
            renderDashboardAt();
            expect(await screen.findByRole('heading', { name: '儀表板' })).toBeInTheDocument();
            expect(await screen.findByRole('heading', { name: /Welcome, dean/ })).toBeInTheDocument();
        });

        it('admin 角色應顯示「管理員」徽章與「管理後台」連結', async () => {
            renderDashboardAt();
            expect(await screen.findByText('管理員')).toBeInTheDocument();
            const adminLink = await screen.findByRole('link', { name: /管理後台/ });
            expect(adminLink).toHaveAttribute('href', '/admin');
        });

        it('user 角色應顯示「一般用戶」且不顯示管理後台連結', async () => {
            localStorage.setItem(SCENARIO_KEYS.userRole, 'user');
            renderDashboardAt();
            expect(await screen.findByText('一般用戶')).toBeInTheDocument();
            expect(screen.queryByRole('link', { name: /管理後台/ })).not.toBeInTheDocument();
        });

        it('頭像應顯示使用者名稱首字大寫', async () => {
            renderDashboardAt();
            const avatar = await screen.findByText('D');
            expect(avatar.closest('.avatar')).toBeTruthy();
        });
    });

    describe('商品列表', () => {
        it('成功取得商品後應顯示「商品列表」與 MSW 回傳的商品名稱', async () => {
            renderDashboardAt();
            expect(await screen.findByRole('heading', { name: '商品列表' })).toBeInTheDocument();
            expect(await screen.findByText('筆記型電腦')).toBeInTheDocument();
            expect(screen.getByText('無線滑鼠')).toBeInTheDocument();
            expect(screen.getByText('機械鍵盤')).toBeInTheDocument();
        });

        it('取得商品期間應顯示「載入商品中...」', async () => {
            vi.spyOn(productApi, 'getProducts').mockImplementation(() => new Promise(() => {}));
            renderDashboardAt();
            expect(await screen.findByText('載入商品中...')).toBeInTheDocument();
        });

        it('商品 API 回傳錯誤時應顯示後端 message', async () => {
            localStorage.setItem(SCENARIO_KEYS.products, 'server_error');
            renderDashboardAt();
            expect(await screen.findByText('伺服器錯誤，請稍後再試')).toBeInTheDocument();
        });
    });

    describe('登出', () => {
        it('點擊登出應導向登入頁', async () => {
            const user = userEvent.setup();
            renderDashboardAt();
            await screen.findByRole('heading', { name: '儀表板' });
            await user.click(screen.getByRole('button', { name: '登出' }));
            expect(await screen.findByText('Login Page')).toBeInTheDocument();
        });
    });
});
