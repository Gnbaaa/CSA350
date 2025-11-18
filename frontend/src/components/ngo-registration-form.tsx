import { FormEvent, useMemo, useState } from 'react';
import { z } from 'zod';

interface NgoRegistrationFormProps {
  token: string;
  onSuccess?: (payload: { email: string; organizationName: string }) => void;
}

const ngoSchema = z.object({
  email: z.string().email({ message: 'Зөв имэйл хаяг оруулна уу.' }),
  organizationName: z.string().min(2, { message: 'Байгууллагын нэр хамгийн багадаа 2 тэмдэгт байна.' }),
  password: z.string().min(8, { message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байна.' })
});

export function NgoRegistrationForm({ token, onSuccess }: NgoRegistrationFormProps) {
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(
    () => ngoSchema.safeParse({ email, organizationName, password }).success,
    [email, organizationName, password]
  );

  function syncErrors(field: 'email' | 'organizationName' | 'password') {
    const result = ngoSchema.safeParse({ email, organizationName, password });
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
    setServerMessage('');
    setIsSubmitting(true);

    const response = await fetch('/api/admin/ngos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email, organizationName, password })
    });

    setIsSubmitting(false);

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setServerMessage(payload.error ?? 'Бүртгэх явцад алдаа гарлаа.');
      return;
    }

    setServerMessage('Төрийн бус байгууллагын бүртгэл амжилттай үүслээ.');
    onSuccess?.({ email: payload.user.email, organizationName: payload.user.fullName });
    setEmail('');
    setOrganizationName('');
    setPassword('');
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="ngo-name">
          ТББ-ийн нэр
        </label>
        <input
          id="ngo-name"
          name="organizationName"
          type="text"
          value={organizationName}
          onChange={(event) => setOrganizationName(event.target.value)}
          onBlur={() => syncErrors('organizationName')}
          className="input"
          placeholder="Happy Paws Shelter"
          aria-invalid={Boolean(errorMap.organizationName)}
          aria-describedby={errorMap.organizationName ? 'ngo-name-error' : undefined}
        />
        {errorMap.organizationName ? (
          <p id="ngo-name-error" className="text-xs text-rose-600">
            {errorMap.organizationName}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="ngo-email">
          Имэйл
        </label>
        <input
          id="ngo-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => syncErrors('email')}
          className="input"
          placeholder="contact@ngo.mn"
          aria-invalid={Boolean(errorMap.email)}
          aria-describedby={errorMap.email ? 'ngo-email-error' : undefined}
        />
        {errorMap.email ? (
          <p id="ngo-email-error" className="text-xs text-rose-600">
            {errorMap.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="ngo-password">
          Түр нууц үг
        </label>
        <input
          id="ngo-password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => syncErrors('password')}
          className="input"
          placeholder="••••••••"
          aria-invalid={Boolean(errorMap.password)}
          aria-describedby={errorMap.password ? 'ngo-password-error' : undefined}
        />
        {errorMap.password ? (
          <p id="ngo-password-error" className="text-xs text-rose-600">
            {errorMap.password}
          </p>
        ) : null}
      </div>

      {serverMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {serverMessage}
        </div>
      ) : null}

      <button className="primary-button" type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Бүртгэж байна…' : 'ТББ бүртгэх'}
      </button>
    </form>
  );
}









