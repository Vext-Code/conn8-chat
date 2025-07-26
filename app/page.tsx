import { ChatList } from '@/components/chat/chat-list'
import { UserNav } from '@/components/auth/user-nav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateChatForm } from '@/components/chat/create-chat-form'
import { Suspense } from 'react'
import { ChatListSkeleton } from '@/components/chat/chat-list-skeleton'
import { ModeToggle } from '@/components/mode-toggle'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">Percakapan Saya</h1>
              <p className="text-sm text-muted-foreground">
                Halo, {user.email}!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-end">
          <CreateChatForm />
        </div>
        <Suspense fallback={<ChatListSkeleton />}>
          <ChatList />
        </Suspense>
      </main>
    </div>
  )
}
