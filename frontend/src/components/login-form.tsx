import { FormEvent, useMemo, useState } from 'react';
import { z } from 'zod';

interface LoginFormProps {
  onSuccess?: (payload: { token: string }) => void;
}

const loginSchema = z.object({
  email: z.string().email({ message: 'Имэйл буруу байна.' }),
  password: z.string().min(8, { message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байна.' })
});

const invalidCredentialsMessage = 'Нэвтрэхэд алдаа гарлаа';

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => loginSchema.safeParse({ email, password }).success, [email, password]);

  function handleBlur(field: 'email' | 'password') {
    const result = loginSchema.safeParse({ email, password });
    if (result.success) {
      setErrorMap({});
      return;
    }

    const issue = result.error.issues.find((candidate) => candidate.path[0] === field);
    if (issue) {
      setErrorMap((prev) => ({ ...prev, [field]: issue.message }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError('');
    setIsSubmitting(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    setIsSubmitting(false);

    const payload = await response.json();

    if (!response.ok) {
      const message = payload.error === 'Invalid credentials' ? invalidCredentialsMessage : payload.error;
      setServerError(message ?? invalidCredentialsMessage);
      return;
    }

    onSuccess?.({ token: payload.token });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2 text-left">
        <label className="text-sm font-medium text-slate-700" htmlFor="login-email">
          Имэйл
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => handleBlur('email')}
          className="input"
          aria-invalid={Boolean(errorMap.email)}
          aria-describedby={errorMap.email ? 'login-email-error' : undefined}
          placeholder="example@email.mn"
        />
        {errorMap.email ? (
          <p id="login-email-error" className="text-xs text-rose-600">
            {errorMap.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700" htmlFor="login-password">
            Нууц үг
          </label>
          <button
            type="button"
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            onClick={() => setServerError('')}
          >
            Нууц үг мартсан уу?
          </button>
        </div>
        <input
          id="login-password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => handleBlur('password')}
          className="input"
          aria-invalid={Boolean(errorMap.password)}
          aria-describedby={errorMap.password ? 'login-password-error' : undefined}
          placeholder="••••••••"
        />
        {errorMap.password ? (
          <p id="login-password-error" className="text-xs text-rose-600">
            {errorMap.password}
          </p>
        ) : null}
      </div>

      {serverError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {serverError}
        </div>
      ) : null}

      <button type="submit" className="primary-button" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Нэвтэрч байна…' : 'Нэвтрэх'}
      </button>
    </form>
  );
}

