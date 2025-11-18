import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { z } from 'zod';
const ngoSchema = z.object({
    email: z.string().email({ message: 'Зөв имэйл хаяг оруулна уу.' }),
    organizationName: z.string().min(2, { message: 'Байгууллагын нэр хамгийн багадаа 2 тэмдэгт байна.' }),
    password: z.string().min(8, { message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байна.' })
});
export function NgoRegistrationForm({ token, onSuccess }) {
    const [email, setEmail] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [password, setPassword] = useState('');
    const [errorMap, setErrorMap] = useState({});
    const [serverMessage, setServerMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isValid = useMemo(() => ngoSchema.safeParse({ email, organizationName, password }).success, [email, organizationName, password]);
    function syncErrors(field) {
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
    async function handleSubmit(event) {
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
    return (_jsxs("form", { className: "space-y-5", onSubmit: handleSubmit, noValidate: true, children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-slate-700", htmlFor: "ngo-name", children: "\u0422\u0411\u0411-\u0438\u0439\u043D \u043D\u044D\u0440" }), _jsx("input", { id: "ngo-name", name: "organizationName", type: "text", value: organizationName, onChange: (event) => setOrganizationName(event.target.value), onBlur: () => syncErrors('organizationName'), className: "input", placeholder: "Happy Paws Shelter", "aria-invalid": Boolean(errorMap.organizationName), "aria-describedby": errorMap.organizationName ? 'ngo-name-error' : undefined }), errorMap.organizationName ? (_jsx("p", { id: "ngo-name-error", className: "text-xs text-rose-600", children: errorMap.organizationName })) : null] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-slate-700", htmlFor: "ngo-email", children: "\u0418\u043C\u044D\u0439\u043B" }), _jsx("input", { id: "ngo-email", name: "email", type: "email", value: email, onChange: (event) => setEmail(event.target.value), onBlur: () => syncErrors('email'), className: "input", placeholder: "contact@ngo.mn", "aria-invalid": Boolean(errorMap.email), "aria-describedby": errorMap.email ? 'ngo-email-error' : undefined }), errorMap.email ? (_jsx("p", { id: "ngo-email-error", className: "text-xs text-rose-600", children: errorMap.email })) : null] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-slate-700", htmlFor: "ngo-password", children: "\u0422\u04AF\u0440 \u043D\u0443\u0443\u0446 \u04AF\u0433" }), _jsx("input", { id: "ngo-password", name: "password", type: "password", value: password, onChange: (event) => setPassword(event.target.value), onBlur: () => syncErrors('password'), className: "input", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", "aria-invalid": Boolean(errorMap.password), "aria-describedby": errorMap.password ? 'ngo-password-error' : undefined }), errorMap.password ? (_jsx("p", { id: "ngo-password-error", className: "text-xs text-rose-600", children: errorMap.password })) : null] }), serverMessage ? (_jsx("div", { className: "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700", children: serverMessage })) : null, _jsx("button", { className: "primary-button", type: "submit", disabled: !isValid || isSubmitting, children: isSubmitting ? 'Бүртгэж байна…' : 'ТББ бүртгэх' })] }));
}
