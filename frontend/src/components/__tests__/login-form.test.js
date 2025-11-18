import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach } from 'vitest';
import { LoginForm } from '../login-form';
afterEach(() => {
    vi.restoreAllMocks();
});
describe('LoginForm', () => {
    it('submits credentials and handles success state', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                message: 'Authenticated',
                token: 'token',
                user: {
                    email: 'user@example.com',
                    role: 'citizen',
                    fullName: 'Test User'
                }
            })
        });
        vi.stubGlobal('fetch', mockFetch);
        const onSuccess = vi.fn();
        render(_jsx(LoginForm, { onSuccess: onSuccess }));
        await userEvent.type(screen.getByLabelText(/имэйл/i), 'user@example.com');
        await userEvent.type(screen.getByLabelText(/нууц үг/i), 'StrongP@ssw0rd');
        await userEvent.click(screen.getByRole('button', { name: /нэвтрэх/i }));
        await waitFor(() => expect(mockFetch).toHaveBeenCalled());
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'user@example.com',
                password: 'StrongP@ssw0rd'
            })
        }));
        await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
            token: 'token',
            role: 'citizen',
            email: 'user@example.com',
            fullName: 'Test User'
        })));
    });
    it('shows server error feedback', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Invalid credentials' })
        });
        vi.stubGlobal('fetch', mockFetch);
        render(_jsx(LoginForm, { onSuccess: vi.fn() }));
        await userEvent.type(screen.getByLabelText(/имэйл/i), 'user@example.com');
        await userEvent.type(screen.getByLabelText(/нууц үг/i), 'StrongP@ssw0rd');
        await userEvent.click(screen.getByRole('button', { name: /нэвтрэх/i }));
        await waitFor(() => {
            expect(screen.getByText(/нэвтрэхэд алдаа гарлаа/i)).toBeVisible();
        });
    });
});
