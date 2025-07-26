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

  const isImage = message.attachment_type.startsWith('image/')
  const isAudio = message.attachment_type.startsWith('audio/')
  const isVideo = message.attachment_type.startsWith('video/')

  return (
    <div className="mt-2">
      {isImage ? (
        <Link href={message.attachment_url} target="_blank" rel="noopener noreferrer">
          <img
            src={message.attachment_url}
            alt="Lampiran gambar"
            className="max-w-xs max-h-64 rounded-lg object-cover"
          />
        </Link>
      ) : isAudio ? (
        <audio controls src={message.attachment_url} className="w-full max-w-xs" />
      ) : isVideo ? (
        <video controls src={message.attachment_url} className="max-w-xs max-h-64 rounded-lg" />
      ) : (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-black/10 dark:bg-white/10">
          <FileIcon className="h-8 w-8 flex-shrink-0" />
          <div className="flex-grow min-w-0">
            <p className="text-sm truncate">
              {message.attachment_url.split('/').pop()?.split('_').slice(1).join('_') || 'File terlampir'}
            </p>
          </div>
          <Button asChild size="icon" variant="ghost">
            <Link href={message.attachment_url} target="_blank" download>
              <Download className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
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
                <span className="text-xs opacity-70 mt-1 block text-right">
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

