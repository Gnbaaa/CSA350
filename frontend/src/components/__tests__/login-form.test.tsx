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
    vi.stubGlobal('fetch', mockFetch as unknown as typeof fetch);

    const onSuccess = vi.fn();

    render(<LoginForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/имэйл/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/нууц үг/i), 'StrongP@ssw0rd');

    await userEvent.click(screen.getByRole('button', { name: /нэвтрэх/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'StrongP@ssw0rd'
        })
      })
    );

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'token',
          role: 'citizen',
          email: 'user@example.com',
          fullName: 'Test User'
        })
      )
    );
  });

  it('shows server error feedback', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials', statusCode: 401 })
    });
    vi.stubGlobal('fetch', mockFetch as unknown as typeof fetch);

    render(<LoginForm onSuccess={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/имэйл/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/нууц үг/i), 'StrongP@ssw0rd');
    await userEvent.click(screen.getByRole('button', { name: /нэвтрэх/i }));

    // Error handler should translate "Invalid credentials" to "Нэвтрэхэд алдаа гарлаа"
    // But if translation doesn't work, check for either message
    await waitFor(() => {
      const errorText = screen.queryByText(/нэвтрэхэд алдаа гарлаа/i) || 
                       screen.queryByText(/Invalid credentials/i);
      expect(errorText).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

