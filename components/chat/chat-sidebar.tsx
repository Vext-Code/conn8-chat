'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'
import { Chat } from '@/lib/types'
import { CreateChatForm } from './create-chat-form'

interface ChatSidebarProps {
  activeChatId: string
  chats: Chat[]
}

export function ChatSidebar({ activeChatId, chats }: ChatSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-muted/50">
      <div className="p-4">
        <CreateChatForm />
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-4 text-sm font-medium">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'justify-start gap-2',
                activeChatId === chat.id && 'bg-accent text-accent-foreground'
              )}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="truncate">{chat.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}