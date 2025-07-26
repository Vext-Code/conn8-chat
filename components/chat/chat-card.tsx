'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteChat } from '@/lib/actions/chat'
import { Chat } from '@/lib/types'
import { Trash2, Webhook } from 'lucide-react'
import { toast } from 'sonner'
import { EditChatForm } from './edit-chat-form'

interface ChatCardProps {
  chat: Chat
}

export function ChatCard({ chat }: ChatCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteChat(chat.id)
      toast.success('Percakapan berhasil dihapus.')
    } catch (error) {
      toast.error('Gagal menghapus percakapan.', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <Card className="hover:shadow-md transition-shadow relative group">
        <Link href={`/chat/${chat.id}`} className="block">
          <CardHeader>
            <CardTitle className="text-lg truncate pr-16">{chat.title}</CardTitle>
            {chat.webhook_url && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Webhook className="h-3 w-3" />
                <span className="truncate">{new URL(chat.webhook_url).hostname}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {new Date(chat.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </CardContent>
        </Link>
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <EditChatForm chat={chat} />
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()} // Prevent link navigation
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
        </div>
      </Card>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus percakapan
            beserta semua pesannya secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
