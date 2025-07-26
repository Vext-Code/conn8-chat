import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { MessageCircle } from 'lucide-react'
import { Chat } from '@/lib/types'
import { ChatCard } from './chat-card'

async function getChats(): Promise<Chat[]> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

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

export async function ChatList() {
  const chats = await getChats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Riwayat Percakapan</h2>
      </div>

      {chats.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Belum ada percakapan. Mulai chat baru untuk berinteraksi dengan bot.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chats.map((chat) => (
            <ChatCard key={chat.id} chat={chat} />
          ))}
        </div>
      )}
    </div>
  )
}
