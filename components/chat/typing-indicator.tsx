'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 justify-start">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-blue-100">
          <Bot className="h-4 w-4 text-blue-600" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[70%] rounded-lg px-4 py-2 bg-muted">
        <div className="flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
