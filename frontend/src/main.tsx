import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LoginForm } from './components/login-form';
import { NgoRegistrationForm } from './components/ngo-registration-form';
import { SignUpForm } from './components/signup-form';
import './index.css';

interface AuthUser {
  token: string;
  role: 'admin' | 'ngo' | 'citizen';
  email: string;
  fullName: string;
}

type Mode = 'login' | 'signup';

function App() {
  const [mode, setMode] = useState<Mode>('login');
  const [statusMessage, setStatusMessage] = useState('');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  function handleLoginSuccess(payload: AuthUser) {
    setAuthUser(payload);
    const roleLabel = payload.role === 'admin' ? 'Админ' : payload.role === 'ngo' ? 'ТББ' : 'Хэрэглэгч';
    setStatusMessage(`${roleLabel} амжилттай нэвтэрлээ: ${payload.email}`);
  }

  function handleSignupSuccess(user: { email: string; fullName: string }) {
    setStatusMessage(`${user.fullName} (${user.email}) бүртгэгдлээ. Одоо нэвтэрнэ үү!`);
    setMode('login');
  }

  function handleLogout() {
    setAuthUser(null);
    setStatusMessage('Амжилттай гарлаа.');
  }

  const modeButtons = useMemo(
    () => (
      <nav className="grid grid-cols-2 gap-2 rounded-xl bg-emerald-50 p-1 text-sm font-medium">
        <button
          type="button"
          className={`rounded-lg px-3 py-2 transition ${
            mode === 'login' ? 'bg-white text-emerald-700 shadow' : 'text-emerald-500 hover:text-emerald-700'
          }`}
          onClick={() => setMode('login')}
        >
          Нэвтрэх
        </button>
        <button
          type="button"
          className={`rounded-lg px-3 py-2 transition ${
            mode === 'signup' ? 'bg-white text-emerald-700 shadow' : 'text-emerald-500 hover:text-emerald-700'
          }`}
          onClick={() => setMode('signup')}
        >
          Бүртгүүлэх
        </button>
      </nav>
    ),
    [mode]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6">
      <section className="card w-full max-w-2xl space-y-6">
        <header className="space-y-3 text-center">
          <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            Нийтэд суурилсан тэжээвэр амьтан үрчлүүлэх платформ
          </div>
          <h1 className="text-3xl font-semibold text-emerald-700">
            {authUser
              ? `${authUser.fullName} (${authUser.role === 'admin' ? 'Админ' : authUser.role === 'ngo' ? 'ТББ' : 'Хэрэглэгч'})`
              : mode === 'login'
              ? 'Нэвтрэх'
              : 'Бүртгэл үүсгэх'}
          </h1>
          <p className="text-sm text-slate-600">
            {authUser
              ? authUser.role === 'admin'
                ? 'Админ самбараас шинэ төрийн бус байгууллагыг бүртгэнэ үү.'
                : 'Та амжилттай нэвтэрлээ. Үргэлжлүүлэн платформыг ашиглана уу.'
              : mode === 'login'
              ? 'Үрчлэлтийн платформ руу нэвтрэхийн тулд имэйл болон нууц үгээ оруулна уу.'
              : 'Шинэ хэрэглэгч үү? Доорх мэдээллээ үнэн зөв бөглөж бүртгэл үүсгэнэ үү.'}
          </p>
        </header>

        {authUser ? null : modeButtons}

        {authUser ? (
          <div className="space-y-6">
            {authUser.role === 'admin' ? (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-emerald-700 text-left">Төрийн бус байгууллага бүртгэх</h2>
                <NgoRegistrationForm
                  token={authUser.token}
                  onSuccess={(ngo) =>
                    setStatusMessage(`${ngo.organizationName} (${ngo.email}) бүртгэл амжилттай.`)
                  }
                />
              </section>
            ) : (
              <p className="rounded-lg bg-white/80 p-4 text-sm text-slate-600 shadow-inner">
                Танай эрх ${authUser.role === 'ngo' ? 'Төрийн бус байгууллага' : 'Ердийн хэрэглэгч'} төрөлтэй байна. Админтай
                холбогдож нэмэлт эрх хүсэх боломжтой.
              </p>
            )}

            <div className="flex items-center justify-between">
              {statusMessage ? (
                <span className="text-xs text-emerald-700">{statusMessage}</span>
              ) : (
                <span className="text-xs text-slate-500">Нууцлалын үүднээс токен зөвхөн энэ сешнд хадгалагдана.</span>
              )}
              <button
                type="button"
                className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                onClick={handleLogout}
              >
                Гарах
              </button>
            </div>
          </div>
        ) : (
          <>
            {mode === 'login' ? (
              <LoginForm onSuccess={handleLoginSuccess} />
            ) : (
              <SignUpForm onSuccess={handleSignupSuccess} />
            )}

            {statusMessage ? (
              <p className="rounded-lg bg-emerald-50 px-4 py-2 text-center text-xs text-emerald-700">
                {statusMessage}
              </p>
            ) : null}

            <p className="text-center text-xs text-slate-500">
              {mode === 'login' ? (
                <>
                  Шинэ хэрэглэгч үү?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    Бүртгэл үүсгэх
                  </button>
                </>
              ) : (
                <>
                  Аль хэдийн бүртгэлтэй юу?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    Нэвтрэх
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </section>
    </div>
  );
}

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

