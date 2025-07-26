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
import { createNewChat } from '@/lib/actions/chat'
import { Plus, Webhook, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function CreateChatForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      await createNewChat(formData)
      setIsOpen(false) // Close dialog on success
      toast.success('Chat baru berhasil dibuat!')
    } catch (error) {
      console.error('Error creating chat:', error)
      toast.error('Gagal membuat chat.', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Buat Chat Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md rounded-md sm:w-full sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Chat Baru</DialogTitle>
          <DialogDescription>
            Buat sesi chat baru dengan webhook n8n yang spesifik.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Chat</Label>
            <Input
              id="title"
              name="title"
              placeholder="Contoh: Chatbot Layanan Pelanggan"
              disabled={isLoading}
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
              placeholder="https://n8n.example.com/webhook/..."
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Membuat...' : 'Buat Chat'}
          </Button>
        </form>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
