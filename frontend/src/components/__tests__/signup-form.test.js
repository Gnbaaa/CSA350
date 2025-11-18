import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach } from 'vitest';
import { SignUpForm } from '../signup-form';
afterEach(() => {
    vi.restoreAllMocks();
});
describe('SignUpForm', () => {
    it('validates inputs before enabling submission', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                message: 'Account created',
                user: {
                    email: 'user@example.com',
                    fullName: 'Тест Хэрэглэгч'
                }
            })
        });
        vi.stubGlobal('fetch', mockFetch);
        const onSuccess = vi.fn();
        render(_jsx(SignUpForm, { onSuccess: onSuccess }));
        const submit = screen.getByRole('button', { name: /бүртгүүлэх/i });
        expect(submit).toBeDisabled();
        await userEvent.type(screen.getByLabelText(/имэйл/i), 'user@example.com');
        await userEvent.type(screen.getByLabelText(/нэр/i), 'Тест Хэрэглэгч');
        await userEvent.type(screen.getByLabelText(/нууц үг/i), 'StrongP@ssw0rd');
        expect(submit).toBeEnabled();
        await userEvent.click(submit);
        await waitFor(() => expect(mockFetch).toHaveBeenCalled());
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/signup', expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'user@example.com',
                fullName: 'Тест Хэрэглэгч',
                password: 'StrongP@ssw0rd'
            })
        }));
        await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
            email: 'user@example.com',
            fullName: 'Тест Хэрэглэгч'
        })));
    });
    it('shows validation feedback for invalid inputs', async () => {
        render(_jsx(SignUpForm, { onSuccess: vi.fn() }));
        const email = screen.getByLabelText(/имэйл/i);
        await userEvent.type(email, 'bad-email');
        await userEvent.tab();
        expect(screen.getByText(/зөв имэйл хаяг оруулна уу/i)).toBeVisible();
    });
});
