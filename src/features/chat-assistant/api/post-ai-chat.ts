import { aiChatRequestSchema, aiChatResponseSchema, type AiChatRequest, type AiChatResponse } from '@/features/chat-assistant/model/ai-contract'
import { httpClient } from '@/shared/api/http-client'

type PostAiChatOptions = {
  apiKey?: string
  signal?: AbortSignal
}

export async function postAiChat(request: AiChatRequest, options: PostAiChatOptions = {}): Promise<AiChatResponse> {
  const payload = aiChatRequestSchema.parse(request)

  const response = await httpClient.post<unknown, AiChatRequest>({
    path: '/ai/chat',
    body: payload,
    apiKey: options.apiKey,
    signal: options.signal,
  })

  return aiChatResponseSchema.parse(response)
}
