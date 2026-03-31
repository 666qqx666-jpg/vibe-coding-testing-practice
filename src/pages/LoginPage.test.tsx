import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { SCENARIO_KEYS } from '../mocks/handlers';
import { server } from '../mocks/server';
import { authApi } from '../api/authApi';
import { TOKEN_KEY } from '../api/axiosInstance';

function renderLoginAt(path = '/login') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    );
}

describe('LoginPage', () => {
    describe('前端元素', () => {
        afterEach(() => {
            vi.unstubAllEnvs();
        });

        it('應顯示標題「歡迎回來」、副標「請登入以繼續」、電子郵件與密碼標籤及對應 placeholder', () => {
            renderLoginAt();
            expect(screen.getByRole('heading', { name: '歡迎回來' })).toBeInTheDocument();
            expect(screen.getByText('請登入以繼續')).toBeInTheDocument();
            expect(screen.getByLabelText('電子郵件')).toHaveAttribute('placeholder', 'you@example.com');
            expect(screen.getByLabelText('密碼')).toHaveAttribute(
                'placeholder',
                '至少 8 個字元，需包含英數'
            );
            expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
        });

        it('當 `VITE_API_URL` 未設定時應顯示頁尾測試帳號說明', () => {
            vi.stubEnv('VITE_API_URL', '');
            renderLoginAt();
            expect(
                screen.getByText('測試帳號：任意 email 格式 / 密碼需包含英數且8位以上')
            ).toBeInTheDocument();
        });
    });

    describe('表單驗證', () => {
        it('提交空或格式錯誤的 Email 應顯示「請輸入有效的 Email 格式」且不出發登入請求', async () => {
            const user = userEvent.setup();
            const loginSpy = vi.spyOn(authApi, 'login');
            renderLoginAt();

            await user.click(screen.getByRole('button', { name: '登入' }));
            expect(await screen.findByText('請輸入有效的 Email 格式')).toBeInTheDocument();
            expect(loginSpy).not.toHaveBeenCalled();

            const email = screen.getByLabelText('電子郵件');
            await user.clear(email);
            await user.type(email, 'not-an-email');
            await user.type(screen.getByLabelText('密碼'), 'abc12345');
            await user.click(screen.getByRole('button', { name: '登入' }));
            expect(screen.getAllByText('請輸入有效的 Email 格式').length).toBeGreaterThan(0);
            expect(loginSpy).not.toHaveBeenCalled();
        });

        it('密碼少於 8 字元應顯示「密碼必須至少 8 個字元」', async () => {
            const user = userEvent.setup();
            renderLoginAt();
            await user.type(screen.getByLabelText('電子郵件'), 'a@b.co');
            await user.type(screen.getByLabelText('密碼'), 'ab12');
            await user.click(screen.getByRole('button', { name: '登入' }));
            expect(await screen.findByText('密碼必須至少 8 個字元')).toBeInTheDocument();
        });

        it('密碼長度足夠但缺少字母或數字應顯示「密碼必須包含英文字母和數字」', async () => {
            const user = userEvent.setup();
            renderLoginAt();
            await user.type(screen.getByLabelText('電子郵件'), 'a@b.co');
            await user.type(screen.getByLabelText('密碼'), 'abcdefgh');
            await user.click(screen.getByRole('button', { name: '登入' }));
            expect(
                await screen.findByText('密碼必須包含英文字母和數字')
            ).toBeInTheDocument();

            await user.clear(screen.getByLabelText('密碼'));
            await user.type(screen.getByLabelText('密碼'), '12345678');
            await user.click(screen.getByRole('button', { name: '登入' }));
            expect(
                await screen.findByText('密碼必須包含英文字母和數字')
            ).toBeInTheDocument();
        });
    });

    describe('權限與導頁', () => {
        it('透過 `auth:unauthorized` 事件帶入過期訊息時應在錯誤橫幅顯示該文案', async () => {
            renderLoginAt();
            await act(async () => {
                window.dispatchEvent(
                    new CustomEvent('auth:unauthorized', { detail: '登入已過期，請重新登入' })
                );
            });
            const banner = await screen.findByRole('alert');
            expect(banner).toHaveTextContent('登入已過期，請重新登入');
        });

        it('當 `localStorage` 已有 token 且 `/api/me` 成功時應自動導向 `/dashboard`', async () => {
            localStorage.setItem(TOKEN_KEY, 'fake.jwt.token');
            renderLoginAt('/login');
            expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
        });
    });

    describe('Mock API', () => {
        beforeEach(() => {
            localStorage.removeItem(SCENARIO_KEYS.login);
            localStorage.removeItem(SCENARIO_KEYS.delay);
        });

        it('表單通過驗證且登入成功應導向儀表板並顯示成功後的畫面', async () => {
            const user = userEvent.setup();
            renderLoginAt();
            await user.type(screen.getByLabelText('電子郵件'), 'user@test.com');
            await user.type(screen.getByLabelText('密碼'), 'pass1234');
            await user.click(screen.getByRole('button', { name: '登入' }));
            expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
        });

        it('登入 API 回傳 401 且帶 `message` 時應在錯誤橫幅顯示該訊息', async () => {
            const user = userEvent.setup();
            localStorage.setItem(SCENARIO_KEYS.login, 'invalid_password');
            renderLoginAt();
            await user.type(screen.getByLabelText('電子郵件'), 'user@test.com');
            await user.type(screen.getByLabelText('密碼'), 'pass1234');
            await user.click(screen.getByRole('button', { name: '登入' }));
            const banner = await screen.findByRole('alert');
            expect(banner).toHaveTextContent('密碼錯誤');
        });

        it('登入 API 回傳 401 且 body 無 `message` 欄位時應顯示「登入失敗，請稍後再試」', async () => {
            const user = userEvent.setup();
            server.use(
                http.post('/api/login', () =>
                    HttpResponse.json({}, { status: 401 })
                )
            );
            renderLoginAt();
            await user.type(screen.getByLabelText('電子郵件'), 'user@test.com');
            await user.type(screen.getByLabelText('密碼'), 'pass1234');
            await user.click(screen.getByRole('button', { name: '登入' }));
            const banner = await screen.findByRole('alert');
            expect(banner).toHaveTextContent('登入失敗，請稍後再試');
        });

        it('送出登入期間應顯示載入狀態並停用輸入與提交按鈕', async () => {
            const user = userEvent.setup();
            localStorage.setItem(SCENARIO_KEYS.delay, '300');
            renderLoginAt();
            const email = screen.getByLabelText('電子郵件');
            const password = screen.getByLabelText('密碼');
            await user.type(email, 'user@test.com');
            await user.type(password, 'pass1234');
            await user.click(screen.getByRole('button', { name: '登入' }));

            const submit = screen.getByRole('button', { name: /登入中/ });
            expect(submit).toBeDisabled();
            expect(email).toBeDisabled();
            expect(password).toBeDisabled();
            expect(within(submit).getByText('登入中...')).toBeInTheDocument();

            await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument());
            expect(email).not.toBeDisabled();
        });
    });
});
