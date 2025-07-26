export interface Chat {
  id: string
  user_id: string
  title: string
  webhook_url?: string
  created_at: string
}

export interface Message {
  id: string
  chat_id: string
  role: 'user' | 'bot'
  content: string | null
  attachment_url?: string | null
  attachment_type?: string | null
  created_at: string
}

export interface CreateChatRequest {
  title?: string
  webhook_url?: string
}

export interface SendMessageRequest {
  chatId: string
  content: string
}