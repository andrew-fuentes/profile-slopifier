const knownErrors = new Map<string, string>([
  ['INSUFFICIENT_BALANCE', 'The account has insufficient credits.'],
  ['KEY_BUDGET_EXHAUSTED', 'The API key has exhausted its budget.'],
  ['QUEST_POLLEN_ONLY', 'This model requires paid credits.'],
  ['CONTENT_POLICY_VIOLATION', 'The provider blocked the request under its content policy.'],
  ['BAD_REQUEST', 'The provider rejected the generation request.'],
  ['INVALID_ARGUMENT', 'The provider rejected the generation request.'],
  ['API_KEY_INVALID', 'The configured API key is invalid.'],
  ['UNAUTHENTICATED', 'The provider rejected the configured API key.'],
  ['PERMISSION_DENIED', 'The configured API key lacks access.'],
  ['RESOURCE_EXHAUSTED', 'The API quota or rate limit was reached.'],
  ['NOT_FOUND', 'The configured model or endpoint is unavailable.'],
  ['UNAVAILABLE', 'The provider is temporarily unavailable.'],
]);

const statusMessages = new Map<number, string>([
  [400, 'The provider rejected the generation request.'],
  [401, 'The provider rejected the configured API key.'],
  [402, 'The account balance or key budget could not cover this request.'],
  [403, 'The configured API key lacks access.'],
  [404, 'The configured model or endpoint is unavailable.'],
  [422, 'The provider could not process the generation request.'],
  [429, 'The API quota or rate limit was reached.'],
]);

export class ProviderHttpError extends Error {
  constructor(
    provider: string,
    readonly upstreamStatus: number,
    readonly upstreamCode: string | undefined,
  ) {
    const message = (upstreamCode && knownErrors.get(upstreamCode)) ||
      statusMessages.get(upstreamStatus) || 'The provider could not complete the request.';
    super(`${provider}: ${message}`);
  }
}

export async function readProviderError(provider: string, response: Response) {
  const body = await response.json().catch(() => null) as {
    error?: { code?: unknown; status?: unknown; details?: { reason?: unknown }[] };
  } | null;
  const details = body?.error?.details;
  const code = [
    body?.error?.code,
    ...(Array.isArray(details) ? details.map(detail => detail?.reason) : []),
    body?.error?.status,
  ].find((value): value is string => typeof value === 'string' && knownErrors.has(value));
  return new ProviderHttpError(provider, response.status, code);
}
