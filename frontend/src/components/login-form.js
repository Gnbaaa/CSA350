import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { getErrorMessage, handleApiError, getFieldErrors } from '../utils/error-handler';
const loginSchema = z.object({
    email: z.string().email({ message: 'Имэйл буруу байна.' }),
    password: z.string().min(8, { message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байна.' })
});
const invalidCredentialsMessage = 'Нэвтрэхэд алдаа гарлаа';
export function LoginForm({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMap, setErrorMap] = useState({});
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isValid = useMemo(() => loginSchema.safeParse({ email, password }).success, [email, password]);
    function handleBlur(field) {
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
    async function handleSubmit(event) {
        event.preventDefault();
        setServerError('');
        setIsSubmitting(true);
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        setIsSubmitting(false);
        if (!response.ok) {
            const apiError = await handleApiError(response);
            const errorMessage = getErrorMessage(apiError);
            setServerError(errorMessage);
            // Field-level алдаанууд байвал тэдгээрийг харуулах
            const fieldErrors = getFieldErrors(apiError);
            if (Object.keys(fieldErrors).length > 0) {
                setErrorMap(fieldErrors);
            }
            return;
        }
        const payload = await response.json();
        onSuccess?.({
            token: payload.token,
            role: payload.user.role,
            email: payload.user.email,
            fullName: payload.user.fullName
        });
    }
    return (_jsxs("form", { className: "space-y-5", onSubmit: handleSubmit, noValidate: true, children: [_jsxs("div", { className: "space-y-2 text-left", children: [_jsx("label", { className: "text-sm font-medium text-slate-700", htmlFor: "login-email", children: "\u0418\u043C\u044D\u0439\u043B" }), _jsx("input", { id: "login-email", name: "email", type: "email", value: email, onChange: (event) => setEmail(event.target.value), onBlur: () => handleBlur('email'), className: "input", "aria-invalid": Boolean(errorMap.email), "aria-describedby": errorMap.email ? 'login-email-error' : undefined, placeholder: "example@email.mn" }), errorMap.email ? (_jsx("p", { id: "login-email-error", className: "text-xs text-rose-600", children: errorMap.email })) : null] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "text-sm font-medium text-slate-700", htmlFor: "login-password", children: "\u041D\u0443\u0443\u0446 \u04AF\u0433" }), _jsx("button", { type: "button", className: "text-xs font-medium text-emerald-700 hover:text-emerald-800", onClick: () => setServerError(''), children: "\u041D\u0443\u0443\u0446 \u04AF\u0433 \u043C\u0430\u0440\u0442\u0441\u0430\u043D \u0443\u0443?" })] }), _jsx("input", { id: "login-password", name: "password", type: "password", value: password, onChange: (event) => setPassword(event.target.value), onBlur: () => handleBlur('password'), className: "input", "aria-invalid": Boolean(errorMap.password), "aria-describedby": errorMap.password ? 'login-password-error' : undefined, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), errorMap.password ? (_jsx("p", { id: "login-password-error", className: "text-xs text-rose-600", children: errorMap.password })) : null] }), serverError ? (_jsx("div", { className: "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600", children: serverError })) : null, _jsx("button", { type: "submit", className: "primary-button", disabled: !isValid || isSubmitting, children: isSubmitting ? 'Нэвтэрч байна…' : 'Нэвтрэх' })] }));
}
