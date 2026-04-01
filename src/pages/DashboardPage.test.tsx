import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { AuthProvider } from '../context/AuthContext';
import { SCENARIO_KEYS } from '../mocks/handlers';
import { TOKEN_KEY } from '../api/axiosInstance';

function renderDashboardAt(role: 'admin' | 'user' = 'admin') {
    localStorage.setItem(TOKEN_KEY, 'fake.jwt.token');
    localStorage.setItem(SCENARIO_KEYS.userRole, role);
    return render(
        <MemoryRouter initialEntries={['/dashboard']}>
            <AuthProvider>
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/admin" element={<div>Admin Stub</div>} />
                    <Route path="/login" element={<div>Login Stub</div>} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    );
}

describe('DashboardPage', () => {
    beforeEach(() => {
        localStorage.removeItem(SCENARIO_KEYS.userRole);
        localStorage.removeItem(SCENARIO_KEYS.products);
        localStorage.removeItem(SCENARIO_KEYS.delay);
    });

    describe('前端元素', () => {
        it('應顯示標題「儀表板」、「登出」按鈕與「商品列表」標題', async () => {
            renderDashboardAt();
            expect(await screen.findByRole('heading', { name: '儀表板' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: '商品列表' })).toBeInTheDocument();
        });

        it('應顯示歡迎標題「Welcome, {username} 👋」、頭像首字與角色徽標（管理員或一般用戶）', async () => {
            renderDashboardAt('admin');
            expect(await screen.findByRole('heading', { name: /Welcome, dean/ })).toHaveTextContent(
                'Welcome, dean 👋'
            );
            const welcomeCard = screen.getByRole('heading', { name: /Welcome, dean/ }).closest('.welcome-card');
            expect(welcomeCard).not.toBeNull();
            const welcomeEl = welcomeCard as HTMLElement;
            expect(within(welcomeEl).getByText('D')).toBeInTheDocument();
            expect(within(welcomeEl).getByText('管理員')).toBeInTheDocument();
        });

        it('當使用者角色為 admin 時導覽應顯示「🛠️ 管理後台」連結', async () => {
            renderDashboardAt('admin');
            await screen.findByRole('heading', { name: /Welcome, dean/ });
            const link = screen.getByRole('link', { name: '🛠️ 管理後台' });
            expect(link).toHaveAttribute('href', '/admin');
        });

        it('當使用者角色為 user 時導覽不應顯示「🛠️ 管理後台」連結', async () => {
            renderDashboardAt('user');
            await screen.findByRole('heading', { name: /Welcome, dean/ });
            expect(screen.queryByRole('link', { name: '🛠️ 管理後台' })).not.toBeInTheDocument();
        });
    });

    describe('Mock API', () => {
        it('載入商品期間應顯示「載入商品中...」', async () => {
            localStorage.setItem(SCENARIO_KEYS.delay, '400');
            renderDashboardAt();
            expect(await screen.findByText('載入商品中...')).toBeInTheDocument();
            await waitFor(() => {
                expect(screen.getByText('筆記型電腦')).toBeInTheDocument();
            });
        });

        it('商品 API 成功時應在列表中顯示商品名稱與價格', async () => {
            renderDashboardAt();
            expect(await screen.findByText('筆記型電腦')).toBeInTheDocument();
            const card = screen.getByText('筆記型電腦').closest('.product-card');
            expect(card).not.toBeNull();
            expect(within(card as HTMLElement).getByText(/NT\$\s*25[.,\u202f]000/)).toBeInTheDocument();
        });

        it('商品 API 回傳錯誤時應顯示錯誤訊息「伺服器錯誤，請稍後再試」', async () => {
            localStorage.setItem(SCENARIO_KEYS.products, 'server_error');
            renderDashboardAt();
            expect(
                await screen.findByText('伺服器錯誤，請稍後再試')
            ).toBeInTheDocument();
            expect(document.querySelector('.error-container')).toHaveTextContent(
                '伺服器錯誤，請稍後再試'
            );
        });
    });

    describe('導航與 function 邏輯', () => {
        it('點擊「登出」應清除登入狀態並導向登入路由', async () => {
            const user = userEvent.setup();
            renderDashboardAt();
            await screen.findByRole('heading', { name: '儀表板' });
            await user.click(screen.getByRole('button', { name: '登出' }));
            expect(await screen.findByText('Login Stub')).toBeInTheDocument();
            expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
        });
    });
});
