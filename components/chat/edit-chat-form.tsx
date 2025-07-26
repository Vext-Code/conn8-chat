'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateChat } from '@/lib/actions/chat'
import { Chat } from '@/lib/types'
import { Pencil, Webhook, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface EditChatFormProps {
  chat: Chat
}

export function EditChatForm({ chat }: EditChatFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      await updateChat(chat.id, formData)
      setIsOpen(false) // Close dialog on success
      toast.success('Percakapan berhasil diperbarui.')
    } catch (error) {
      toast.error('Gagal memperbarui percakapan.', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md rounded-md sm:w-full sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Percakapan</DialogTitle>
          <DialogDescription>
            Ubah judul dan URL webhook untuk percakapan ini.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Chat</Label>
            <Input
              id="title"
              name="title"
              defaultValue={chat.title}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="webhook_url" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhook URL n8n
            </Label>
            <Input
              id="webhook_url"
              name="webhook_url"
              type="url"
              defaultValue={chat.webhook_url || ''}
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
