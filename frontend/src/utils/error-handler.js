/**
 * Backend-аас ирсэн алдааны мэдээллийг боловсруулах
 */
/**
 * API алдааны мэдээллийг хэрэглэгчдэд ойлгомжтой текст болгон хувиргах
 */
export function getErrorMessage(error) {
    // String бол шууд буцаах
    if (typeof error === 'string') {
        return error;
    }
    // Error объект бол
    if (error instanceof Error) {
        return error.message;
    }
    // ApiError бол
    const apiError = error;
    // Validation алдаа бол дэлгэрэнгүй мэдээлэл харуулах
    if (apiError.statusCode === 400 && apiError.details?.issues) {
        const issues = apiError.details.issues;
        if (issues.length === 1) {
            return issues[0].message;
        }
        return issues.map(issue => `${issue.field}: ${issue.message}`).join(', ');
    }
    // Монгол хэл дээрх алдааны мэдээлэл
    const errorMessages = {
        'Баталгаажуулалтын алдаа': 'Оруулсан мэдээлэл буруу байна',
        'Нэвтрэх эрхгүй': 'Нэвтрэх эрхгүй байна',
        'Имэйл эсвэл нууц үг буруу байна': 'Имэйл эсвэл нууц үг буруу байна',
        'Энэ имэйл хаяг аль хэдийн бүртгэлтэй байна': 'Энэ имэйл хаяг аль хэдийн бүртгэлтэй байна',
        'Дотоод серверийн алдаа': 'Серверийн алдаа гарлаа. Дараа дахин оролдоно уу',
        'API endpoint олдсонгүй': 'Хуудас олдсонгүй'
    };
    // Тодорхой мэдээлэл байвал ашиглах
    if (apiError.error && errorMessages[apiError.error]) {
        return errorMessages[apiError.error];
    }
    // Ерөнхий алдааны мэдээлэл
    return apiError.error || 'Алдаа гарлаа. Дараа дахин оролдоно уу';
}
/**
 * API response-оос алдааны мэдээлэл гаргах
 */
export async function handleApiError(response) {
    let errorData;
    try {
        errorData = await response.json();
    }
    catch {
        // JSON parse хийж чадахгүй бол ерөнхий алдаа
        errorData = {
            error: 'Серверийн алдаа',
            statusCode: response.status
        };
    }
    return errorData;
}
/**
 * Field-level алдааны мэдээллийг гаргах
 */
export function getFieldErrors(error) {
    const fieldErrors = {};
    if (error.details?.issues) {
        for (const issue of error.details.issues) {
            fieldErrors[issue.field] = issue.message;
        }
    }
    return fieldErrors;
}
