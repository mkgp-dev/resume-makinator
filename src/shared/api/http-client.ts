import { API_BASE_URL } from '@/shared/config/api-config'

export class HttpClientError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'HttpClientError'
    this.status = status
    this.data = data
  }
}

export type HttpRequestOptions<TBody> = {
  path: string
  method?: 'POST'
  body?: TBody
  headers?: Record<string, string>
  baseUrl?: string
  apiKey?: string
  signal?: AbortSignal
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text.length > 0 ? text : null
}

export const httpClient = {
  async request<TResponse, TBody = unknown>(options: HttpRequestOptions<TBody>): Promise<TResponse> {
    const {
      path,
      method = 'POST',
      body,
      headers,
      baseUrl = API_BASE_URL,
      apiKey,
      signal,
    } = options

    const trimmedApiKey = apiKey?.trim()
    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(trimmedApiKey ? { Authorization: `Bearer ${trimmedApiKey}` } : {}),
      ...headers,
    }

    const targetPath = path.startsWith('/') ? path : `/${path}`
    const response = await fetch(`${baseUrl}${targetPath}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })

    const responseBody = await parseResponseBody(response)

    if (!response.ok) {
      throw new HttpClientError(`HTTP ${response.status}`, response.status, responseBody)
    }

    return responseBody as TResponse
  },

  post<TResponse, TBody = unknown>(options: Omit<HttpRequestOptions<TBody>, 'method'>): Promise<TResponse> {
    return httpClient.request<TResponse, TBody>({
      ...options,
      method: 'POST',
    })
  },
}
