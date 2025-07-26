'use client'

import { MessageInput } from '@/components/chat/message-input'
import { MessageList } from '@/components/chat/message-list'
import { sendMessage } from '@/lib/actions/chat'
import { Chat, Message } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChatSkeleton } from '@/components/chat/chat-skeleton'
import { toast } from 'sonner'

interface ChatPageProps {
  params: {
    chatId: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBotTyping, setIsBotTyping] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchChatDetails = async () => {
      const { data: chatData, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', params.chatId)
        .single()

      if (error || !chatData) {
        notFound()
      }
      setChat(chatData)
    }

    const fetchMessages = async () => {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', params.chatId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        setMessages([])
      } else {
        setMessages(messagesData || [])
      }
      setIsLoading(false)
    }

    fetchChatDetails()
    fetchMessages()

    const channel = supabase
      .channel(`chat:${params.chatId}`)
      .on<Message>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${params.chatId}` },
        (payload) => {
          const newMessage = payload.new;
          
          setMessages((currentMessages) => {
            if (newMessage.role === 'bot') {
              setIsBotTyping(false)
            }

            // If the new message is from the user, it's a confirmation of our optimistic message.
            // We should replace the optimistic message with the real one from the database.
            if (newMessage.role === 'user') {
              const optimisticIndex = currentMessages.findIndex(
                (msg) => typeof msg.id === 'string' && msg.role === 'user' && msg.content === newMessage.content
              );

              if (optimisticIndex !== -1) {
                const updatedMessages = [...currentMessages];
                updatedMessages[optimisticIndex] = newMessage;
                return updatedMessages;
              }
            }

            // If it's a bot message, or a user message we couldn't find an optimistic match for,
            // add it to the list, but only if it's not already there.
            if (!currentMessages.some(msg => msg.id === newMessage.id)) {
              return [...currentMessages, newMessage];
            }
            
            return currentMessages;
          });
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.chatId, supabase])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      chat_id: params.chatId,
      role: 'user',
      content: content,
      created_at: new Date().toISOString(),
    }

    setMessages(currentMessages => [...currentMessages, optimisticMessage])
    setIsBotTyping(true)

    const formData = new FormData()
    formData.append('chatId', params.chatId)
    formData.append('content', content)
    
    try {
      await sendMessage(formData)
    } catch (error) {
      console.error("Failed to send message", error)
      toast.error('Gagal mengirim pesan.', {
        description: error instanceof Error ? error.message : 'Silakan coba lagi nanti.',
      })
      setIsBotTyping(false)
      // Optional: remove optimistic message on failure or show an error indicator
      setMessages(currentMessages => currentMessages.filter(m => m.id !== optimisticMessage.id))
    }
  }

  if (isLoading) {
    return <ChatSkeleton />
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="border-b p-4 flex items-center gap-4">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold truncate">{chat?.title || 'Chat'}</h1>
      </header>
      <MessageList messages={messages} isBotTyping={isBotTyping} />
      <MessageInput 
        chatId={params.chatId} 
        onSendMessage={handleSendMessage}
        onUploadStart={() => setIsBotTyping(true)}
      />
    </div>
  )
}

