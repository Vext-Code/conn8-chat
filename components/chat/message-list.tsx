'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Message } from '@/lib/types'
import { Bot, User, File as FileIcon, Download } from 'lucide-react'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { TypingIndicator } from './typing-indicator'

interface MessageListProps {
  messages: Message[]
  isBotTyping: boolean
}

function AttachmentPreview({ message }: { message: Message }) {
  if (!message.attachment_url || !message.attachment_type) return null
// ... (sisa kode AttachmentPreview tetap sama)
// ...
}

export function MessageList({ messages, isBotTyping }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isBotTyping])

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="space-y-4 py-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Mulai percakapan dengan mengirim pesan pertama Anda!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'bot' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}
                <AttachmentPreview message={message} />
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.created_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-green-100">
                    <User className="h-4 w-4 text-green-600" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        {isBotTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}

