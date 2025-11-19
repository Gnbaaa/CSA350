/**
 * Backend-аас ирсэн алдааны мэдээллийг боловсруулах
 */

export interface ApiError {
  error: string;
  statusCode: number;
  details?: {
    issues?: Array<{ field: string; message: string }>;
    [key: string]: unknown;
  };
}

/**
 * API алдааны мэдээллийг хэрэглэгчдэд ойлгомжтой текст болгон хувиргах
 */
export function getErrorMessage(error: ApiError | Error | string): string {
  // String бол шууд буцаах
  if (typeof error === 'string') {
    return error;
  }

  // Error объект бол
  if (error instanceof Error) {
    return error.message;
  }

  // ApiError бол
  const apiError = error as ApiError;

  // Validation алдаа бол дэлгэрэнгүй мэдээлэл харуулах
  if (apiError.statusCode === 400 && apiError.details?.issues) {
    const issues = apiError.details.issues;
    if (issues.length === 1) {
      return issues[0].message;
    }
    return issues.map(issue => `${issue.field}: ${issue.message}`).join(', ');
  }

  // Монгол хэл дээрх алдааны мэдээлэл
  const errorMessages: Record<string, string> = {
    'Баталгаажуулалтын алдаа': 'Оруулсан мэдээлэл буруу байна',
    'Нэвтрэх эрхгүй': 'Нэвтрэх эрхгүй байна',
    'Имэйл эсвэл нууц үг буруу байна': 'Имэйл эсвэл нууц үг буруу байна',
    'Invalid credentials': 'Нэвтрэхэд алдаа гарлаа',
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
export async function handleApiError(response: Response): Promise<ApiError> {
  let errorData: ApiError;

  try {
    const jsonData = await response.json();
    errorData = {
      error: jsonData.error || 'Алдаа гарлаа',
      statusCode: jsonData.statusCode || response.status || 500,
      details: jsonData.details
    };
  } catch {
    // JSON parse хийж чадахгүй бол ерөнхий алдаа
    errorData = {
      error: 'Серверийн алдаа',
      statusCode: response.status || 500
    };
  }

  return errorData;
}

/**
 * Field-level алдааны мэдээллийг гаргах
 */
export function getFieldErrors(error: ApiError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (error.details?.issues) {
    for (const issue of error.details.issues) {
      fieldErrors[issue.field] = issue.message;
    }
  }

  return fieldErrors;
}

