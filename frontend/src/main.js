import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LoginForm } from './components/login-form';
import { NgoRegistrationForm } from './components/ngo-registration-form';
import { SignUpForm } from './components/signup-form';
import './index.css';
function App() {
    const [mode, setMode] = useState('login');
    const [statusMessage, setStatusMessage] = useState('');
    const [authUser, setAuthUser] = useState(null);
    function handleLoginSuccess(payload) {
        setAuthUser(payload);
        const roleLabel = payload.role === 'admin' ? 'Админ' : payload.role === 'ngo' ? 'ТББ' : 'Хэрэглэгч';
        setStatusMessage(`${roleLabel} амжилттай нэвтэрлээ: ${payload.email}`);
    }
    function handleSignupSuccess(user) {
        setStatusMessage(`${user.fullName} (${user.email}) бүртгэгдлээ. Одоо нэвтэрнэ үү!`);
        setMode('login');
    }
    function handleLogout() {
        setAuthUser(null);
        setStatusMessage('Амжилттай гарлаа.');
    }
    const modeButtons = useMemo(() => (_jsxs("nav", { className: "grid grid-cols-2 gap-2 rounded-xl bg-emerald-50 p-1 text-sm font-medium", children: [_jsx("button", { type: "button", className: `rounded-lg px-3 py-2 transition ${mode === 'login' ? 'bg-white text-emerald-700 shadow' : 'text-emerald-500 hover:text-emerald-700'}`, onClick: () => setMode('login'), children: "\u041D\u044D\u0432\u0442\u0440\u044D\u0445" }), _jsx("button", { type: "button", className: `rounded-lg px-3 py-2 transition ${mode === 'signup' ? 'bg-white text-emerald-700 shadow' : 'text-emerald-500 hover:text-emerald-700'}`, onClick: () => setMode('signup'), children: "\u0411\u04AF\u0440\u0442\u0433\u04AF\u04AF\u043B\u044D\u0445" })] })), [mode]);
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6", children: _jsxs("section", { className: "card w-full max-w-2xl space-y-6", children: [_jsxs("header", { className: "space-y-3 text-center", children: [_jsx("div", { className: "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700", children: "\u041D\u0438\u0439\u0442\u044D\u0434 \u0441\u0443\u0443\u0440\u0438\u043B\u0441\u0430\u043D \u0442\u044D\u0436\u044D\u044D\u0432\u044D\u0440 \u0430\u043C\u044C\u0442\u0430\u043D \u04AF\u0440\u0447\u043B\u04AF\u04AF\u043B\u044D\u0445 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C" }), _jsx("h1", { className: "text-3xl font-semibold text-emerald-700", children: authUser
                                ? `${authUser.fullName} (${authUser.role === 'admin' ? 'Админ' : authUser.role === 'ngo' ? 'ТББ' : 'Хэрэглэгч'})`
                                : mode === 'login'
                                    ? 'Нэвтрэх'
                                    : 'Бүртгэл үүсгэх' }), _jsx("p", { className: "text-sm text-slate-600", children: authUser
                                ? authUser.role === 'admin'
                                    ? 'Админ самбараас шинэ төрийн бус байгууллагыг бүртгэнэ үү.'
                                    : 'Та амжилттай нэвтэрлээ. Үргэлжлүүлэн платформыг ашиглана уу.'
                                : mode === 'login'
                                    ? 'Үрчлэлтийн платформ руу нэвтрэхийн тулд имэйл болон нууц үгээ оруулна уу.'
                                    : 'Шинэ хэрэглэгч үү? Доорх мэдээллээ үнэн зөв бөглөж бүртгэл үүсгэнэ үү.' })] }), authUser ? null : modeButtons, authUser ? (_jsxs("div", { className: "space-y-6", children: [authUser.role === 'admin' ? (_jsxs("section", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold text-emerald-700 text-left", children: "\u0422\u04E9\u0440\u0438\u0439\u043D \u0431\u0443\u0441 \u0431\u0430\u0439\u0433\u0443\u0443\u043B\u043B\u0430\u0433\u0430 \u0431\u04AF\u0440\u0442\u0433\u044D\u0445" }), _jsx(NgoRegistrationForm, { token: authUser.token, onSuccess: (ngo) => setStatusMessage(`${ngo.organizationName} (${ngo.email}) бүртгэл амжилттай.`) })] })) : (_jsxs("p", { className: "rounded-lg bg-white/80 p-4 text-sm text-slate-600 shadow-inner", children: ["\u0422\u0430\u043D\u0430\u0439 \u044D\u0440\u0445 $", authUser.role === 'ngo' ? 'Төрийн бус байгууллага' : 'Ердийн хэрэглэгч', " \u0442\u04E9\u0440\u04E9\u043B\u0442\u044D\u0439 \u0431\u0430\u0439\u043D\u0430. \u0410\u0434\u043C\u0438\u043D\u0442\u0430\u0439 \u0445\u043E\u043B\u0431\u043E\u0433\u0434\u043E\u0436 \u043D\u044D\u043C\u044D\u043B\u0442 \u044D\u0440\u0445 \u0445\u04AF\u0441\u044D\u0445 \u0431\u043E\u043B\u043E\u043C\u0436\u0442\u043E\u0439."] })), _jsxs("div", { className: "flex items-center justify-between", children: [statusMessage ? (_jsx("span", { className: "text-xs text-emerald-700", children: statusMessage })) : (_jsx("span", { className: "text-xs text-slate-500", children: "\u041D\u0443\u0443\u0446\u043B\u0430\u043B\u044B\u043D \u04AF\u04AF\u0434\u043D\u044D\u044D\u0441 \u0442\u043E\u043A\u0435\u043D \u0437\u04E9\u0432\u0445\u04E9\u043D \u044D\u043D\u044D \u0441\u0435\u0448\u043D\u0434 \u0445\u0430\u0434\u0433\u0430\u043B\u0430\u0433\u0434\u0430\u043D\u0430." })), _jsx("button", { type: "button", className: "rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50", onClick: handleLogout, children: "\u0413\u0430\u0440\u0430\u0445" })] })] })) : (_jsxs(_Fragment, { children: [mode === 'login' ? (_jsx(LoginForm, { onSuccess: handleLoginSuccess })) : (_jsx(SignUpForm, { onSuccess: handleSignupSuccess })), statusMessage ? (_jsx("p", { className: "rounded-lg bg-emerald-50 px-4 py-2 text-center text-xs text-emerald-700", children: statusMessage })) : null, _jsx("p", { className: "text-center text-xs text-slate-500", children: mode === 'login' ? (_jsxs(_Fragment, { children: ["\u0428\u0438\u043D\u044D \u0445\u044D\u0440\u044D\u0433\u043B\u044D\u0433\u0447 \u04AF\u04AF?", ' ', _jsx("button", { type: "button", onClick: () => setMode('signup'), className: "font-medium text-emerald-700 hover:text-emerald-800", children: "\u0411\u04AF\u0440\u0442\u0433\u044D\u043B \u04AF\u04AF\u0441\u0433\u044D\u0445" })] })) : (_jsxs(_Fragment, { children: ["\u0410\u043B\u044C \u0445\u044D\u0434\u0438\u0439\u043D \u0431\u04AF\u0440\u0442\u0433\u044D\u043B\u0442\u044D\u0439 \u044E\u0443?", ' ', _jsx("button", { type: "button", onClick: () => setMode('login'), className: "font-medium text-emerald-700 hover:text-emerald-800", children: "\u041D\u044D\u0432\u0442\u0440\u044D\u0445" })] })) })] }))] }) }));
}
const root = document.getElementById('root');
if (root) {
    createRoot(root).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
}
