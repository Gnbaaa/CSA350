import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { getErrorMessage, handleApiError, getFieldErrors } from '../utils/error-handler';
const signupSchema = z.object({
    email: z.string().email({ message: 'Зөв имэйл хаяг оруулна уу.' }),
    fullName: z.string().min(2, { message: 'Нэр хамгийн багадаа 2 тэмдэгт байна.' }),
    password: z.string().min(8, { message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байна.' })
});
export function SignUpForm({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [errorMap, setErrorMap] = useState({});
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isValid = useMemo(() => signupSchema.safeParse({ email, fullName, password }).success, [email, fullName, password]);
    function syncErrors(field) {
        const result = signupSchema.safeParse({ email, fullName, password });
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
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, fullName, password })
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
        onSuccess?.({ email: payload.user.email, fullName: payload.user.fullName });
        setEmail('');
        setFullName('');
        setPassword('');
    }
    return (_jsxs("form", { className: "space-y-5", onSubmit: handleSubmit, noValidate: true, children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-slate-700", htmlFor: "signup-email", children: "\u0418\u043C\u044D\u0439\u043B" }), _jsx("input", { id: "signup-email", name: "email", type: "email", value: email, onChange: (event) => setEmail(event.target.value), onBlur: () => syncErrors('email'), className: "input", "aria-invalid": Boolean(errorMap.email), "aria-describedby": errorMap.email ? 'signup-email-error' : undefined, placeholder: "example@email.mn" }), errorMap.email ? (_jsx("p", { id: "signup-email-error", className: "text-xs text-rose-600", children: errorMap.email })) : null] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-slate-700", htmlFor: "signup-full-name", children: "\u041D\u044D\u0440" }), _jsx("input", { id: "signup-full-name", name: "fullName", type: "text", value: fullName, onChange: (event) => setFullName(event.target.value), onBlur: () => syncErrors('fullName'), className: "input", "aria-invalid": Boolean(errorMap.fullName), "aria-describedby": errorMap.fullName ? 'signup-name-error' : undefined, placeholder: "\u0411\u0430\u0442\u0431\u043E\u043B\u0434 \u0413\u044D\u0440\u044D\u043B" }), errorMap.fullName ? (_jsx("p", { id: "signup-name-error", className: "text-xs text-rose-600", children: errorMap.fullName })) : null] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-slate-700", htmlFor: "signup-password", children: "\u041D\u0443\u0443\u0446 \u04AF\u0433" }), _jsx("input", { id: "signup-password", name: "password", type: "password", value: password, onChange: (event) => setPassword(event.target.value), onBlur: () => syncErrors('password'), className: "input", "aria-invalid": Boolean(errorMap.password), "aria-describedby": errorMap.password ? 'signup-password-error' : undefined, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), errorMap.password ? (_jsx("p", { id: "signup-password-error", className: "text-xs text-rose-600", children: errorMap.password })) : null] }), serverError ? (_jsx("div", { className: "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600", children: serverError })) : null, _jsx("button", { type: "submit", className: "primary-button", disabled: !isValid || isSubmitting, children: isSubmitting ? 'Бүртгэж байна…' : 'Бүртгүүлэх' })] }));
}
