import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminPage } from './AdminPage';
import { AuthProvider } from '../context/AuthContext';
import { SCENARIO_KEYS } from '../mocks/handlers';
import { TOKEN_KEY } from '../api/axiosInstance';

function renderAdminAt(path = '/admin') {
    localStorage.setItem(TOKEN_KEY, 'fake.jwt.token');
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AuthProvider>
                <Routes>
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/dashboard" element={<div>Dashboard Placeholder</div>} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    );
}

describe('AdminPage', () => {
    beforeEach(() => {
        localStorage.removeItem(SCENARIO_KEYS.userRole);
    });

    describe('版面與導覽', () => {
        it('應顯示「管理後台」標題與「返回」連結（指向 /dashboard）', async () => {
            renderAdminAt();
            expect(await screen.findByRole('heading', { name: '🛠️ 管理後台' })).toBeInTheDocument();
            const back = screen.getByRole('link', { name: '← 返回' });
            expect(back).toHaveAttribute('href', '/dashboard');
        });

        it('應顯示管理員專屬說明區塊與三項 feature 文案', async () => {
            renderAdminAt();
            expect(await screen.findByRole('heading', { name: '管理員專屬頁面' })).toBeInTheDocument();
            expect(screen.getByText('只有 admin 角色可以訪問')).toBeInTheDocument();
            expect(screen.getByText('user 角色會被重定向')).toBeInTheDocument();
            expect(screen.getByText('受路由守衛保護')).toBeInTheDocument();
        });
    });

    describe('角色徽章', () => {
        it('預設（MSW admin）應顯示「管理員」', async () => {
            renderAdminAt();
            expect(await screen.findByText('管理員')).toBeInTheDocument();
        });

        it('user 角色時應顯示「一般用戶」', async () => {
            localStorage.setItem(SCENARIO_KEYS.userRole, 'user');
            renderAdminAt();
            expect(await screen.findByText('一般用戶')).toBeInTheDocument();
        });
    });

    describe('登出', () => {
        it('點擊登出應導向登入頁', async () => {
            const user = userEvent.setup();
            renderAdminAt();
            await screen.findByRole('heading', { name: '🛠️ 管理後台' });
            await user.click(screen.getByRole('button', { name: '登出' }));
            expect(await screen.findByText('Login Page')).toBeInTheDocument();
        });
    });

    describe('返回儀表板', () => {
        it('點擊返回應顯示儀表板 placeholder', async () => {
            const user = userEvent.setup();
            renderAdminAt();
            await user.click(await screen.findByRole('link', { name: '← 返回' }));
            expect(await screen.findByText('Dashboard Placeholder')).toBeInTheDocument();
        });
    });
});
