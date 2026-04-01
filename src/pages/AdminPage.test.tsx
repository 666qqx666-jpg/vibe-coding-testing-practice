import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminPage } from './AdminPage';
import { AuthProvider } from '../context/AuthContext';
import { SCENARIO_KEYS } from '../mocks/handlers';
import { TOKEN_KEY } from '../api/axiosInstance';

function renderAdminAt(path = '/admin', role: 'admin' | 'user' = 'admin') {
    localStorage.setItem(TOKEN_KEY, 'fake.jwt.token');
    localStorage.setItem(SCENARIO_KEYS.userRole, role);
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AuthProvider>
                <Routes>
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/dashboard" element={<div>Dashboard Stub</div>} />
                    <Route path="/login" element={<div>Login Stub</div>} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    );
}

describe('AdminPage', () => {
    beforeEach(() => {
        localStorage.removeItem(SCENARIO_KEYS.userRole);
    });

    describe('前端元素', () => {
        it('應顯示標題「🛠️ 管理後台」、「← 返回」連結、區塊標題「管理員專屬頁面」及三項說明文字', async () => {
            renderAdminAt();
            expect(await screen.findByRole('heading', { name: '🛠️ 管理後台' })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: '← 返回' })).toHaveAttribute('href', '/dashboard');
            expect(screen.getByRole('heading', { name: '管理員專屬頁面' })).toBeInTheDocument();
            expect(screen.getByText('只有 admin 角色可以訪問')).toBeInTheDocument();
            expect(screen.getByText('user 角色會被重定向')).toBeInTheDocument();
            expect(screen.getByText('受路由守衛保護')).toBeInTheDocument();
        });

        it('當使用者角色為 admin 時頂部角色徽標應顯示「管理員」', async () => {
            renderAdminAt('/admin', 'admin');
            expect(await screen.findByText('管理員')).toBeInTheDocument();
            const header = screen.getByRole('banner');
            expect(header).toHaveTextContent('管理員');
        });

        it('當使用者角色為 user 時頂部角色徽標應顯示「一般用戶」', async () => {
            renderAdminAt('/admin', 'user');
            expect(await screen.findByText('一般用戶')).toBeInTheDocument();
            const header = screen.getByRole('banner');
            expect(header).toHaveTextContent('一般用戶');
        });
    });

    describe('導航與 function 邏輯', () => {
        it('點擊「登出」應清除登入狀態並導向登入路由', async () => {
            const user = userEvent.setup();
            renderAdminAt();
            await screen.findByRole('heading', { name: '🛠️ 管理後台' });
            await user.click(screen.getByRole('button', { name: '登出' }));
            expect(await screen.findByText('Login Stub')).toBeInTheDocument();
            expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
        });

        it('點擊「← 返回」應導向儀表板路由', async () => {
            const user = userEvent.setup();
            renderAdminAt();
            await screen.findByRole('heading', { name: '🛠️ 管理後台' });
            await user.click(screen.getByRole('link', { name: '← 返回' }));
            expect(await screen.findByText('Dashboard Stub')).toBeInTheDocument();
        });
    });
});
