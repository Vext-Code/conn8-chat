import { createClient } from '@/lib/supabase/server'
import { Chat } from '@/lib/types'
import { ChatLayoutClient } from './chat-layout-client'

async function getChats(): Promise<Chat[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: chats, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching chats:', error)
    return []
  }
  return chats || []
}

export default async function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { chatId: string }
}) {
  const chats = await getChats()

  return (
    <ChatLayoutClient activeChatId={params.chatId} chats={chats}>
      {children}
    </ChatLayoutClient>
  )
}
