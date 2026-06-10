/** 将接口/异常对象格式化为可展示的字符串，避免 toast 显示 [object Object] */
export const formatApiError = (error: unknown): string => {
  if (error == null) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object') {
    const e = error as Record<string, unknown>;
    const msg = e.msg ?? e.message ?? (e.data as Record<string, unknown> | undefined)?.msg;
    if (typeof msg === 'string' && msg) return msg;
    if (typeof e.code === 'string' || typeof e.code === 'number') return String(e.code);
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
};
