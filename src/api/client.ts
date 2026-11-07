/**
 * The HTTP boundary.
 *
 * Everything the app knows about the network lives here: the base URL, the
 * bearer token, and the API's one error shape. Pages never call `fetch`.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/** The API's error shape: `{ detail, code }`, or FastAPI's 422 list. */
export class ApiError extends Error {
  readonly status: number
  /** A machine code such as `BAD_CREDENTIALS`, when the API sends one. */
  readonly code: string | null
  /** Per-field messages from a 422, keyed by field name. */
  readonly fields: Record<string, string> | undefined

  constructor(
    status: number,
    code: string | null,
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }

  /** True when the token is missing, expired or rejected. */
  get isUnauthorized(): boolean {
    return this.status === 401
  }
}

/** Where the token lives between reloads. */
const TOKEN_KEY = 'nelp.token.v1'

let token: string | null = readToken()
const listeners = new Set<() => void>()

function readToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return token
}

export function setToken(next: string | null): void {
  token = next
  try {
    if (next) window.localStorage.setItem(TOKEN_KEY, next)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage can be refused in a private window. The session then lasts
    // only as long as the tab, which is better than failing to sign in.
  }
  for (const listener of listeners) listener()
}

export function onTokenChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  /** Extra headers, such as the `Idempotency-Key` a payment intent needs. */
  headers?: Record<string, string>
  /** Sends `FormData` as multipart instead of JSON, for uploads. */
  form?: FormData
  signal?: AbortSignal
  /** Skips the bearer token, for the public endpoints. */
  anonymous?: boolean
}

/**
 * One request.
 *
 * A 401 clears the stored token, so a session that has expired on the server
 * does not leave the app showing a signed-in shell it cannot fill.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { ...options.headers }
  if (!options.form) headers['Content-Type'] = 'application/json'
  if (!options.anonymous && token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.form ?? (options.body === undefined ? undefined : JSON.stringify(options.body)),
      signal: options.signal,
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw new ApiError(
      0,
      'NETWORK',
      'We could not reach Nelp. Check your connection and try again.',
    )
  }

  if (response.status === 204) return undefined as T

  const payload = await readBody(response)

  if (!response.ok) {
    if (response.status === 401) setToken(null)
    throw toApiError(response.status, payload)
  }

  return payload as T
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

interface ErrorBody {
  detail?: unknown
  code?: string
}

/** Turns both error shapes the API can send into one thing pages can show. */
function toApiError(status: number, payload: unknown): ApiError {
  const body = (payload ?? {}) as ErrorBody

  // FastAPI's validation failures: a list of per-field problems.
  if (Array.isArray(body.detail)) {
    const fields: Record<string, string> = {}
    for (const item of body.detail as { loc?: unknown[]; msg?: string }[]) {
      const name = String(item.loc?.[item.loc.length - 1] ?? '')
      if (name && item.msg) fields[name] = item.msg
    }
    const first = Object.values(fields)[0]
    return new ApiError(
      status,
      'VALIDATION',
      first ?? 'Some details are not right. Check the form and try again.',
      fields,
    )
  }

  const detail =
    typeof body.detail === 'string' ? body.detail : defaultMessage(status)
  return new ApiError(status, body.code ?? null, detail)
}

function defaultMessage(status: number): string {
  if (status === 401) return 'Please sign in again.'
  if (status === 403) return 'You do not have access to that.'
  if (status === 404) return 'We could not find that.'
  if (status >= 500) return 'Nelp is having trouble. Try again in a moment.'
  return 'Something went wrong.'
}

/** Builds a query string, dropping anything unset. */
export function query(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}
