'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Paperclip, Send } from 'lucide-react'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { sendFileMessage } from '@/lib/actions/chat'

interface MessageInputProps {
  chatId: string
  onSendMessage: (content: string) => Promise<void>
  onUploadStart: () => void
}

export function MessageInput({ chatId, onSendMessage, onUploadStart }: MessageInputProps) {
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = inputRef.current?.value ?? ''
    
    if (!content.trim()) {
      return
    }

    setIsLoading(true)
    
    try {
      await onSendMessage(content)
      formRef.current?.reset()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Gagal mengirim pesan.', {
        description: error instanceof Error ? error.message : 'Silakan coba lagi nanti.',
      })
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    onUploadStart() // Trigger typing indicator
    const supabase = createClient()
    const filePath = `${chatId}/${Date.now()}_${file.name}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('chatattachments')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chatattachments')
        .getPublicUrl(filePath)

      await sendFileMessage(chatId, publicUrl, file.type)
      
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Gagal mengunggah file.', {
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
      })
    } finally {
      setIsLoading(false)
      // Reset file input
      if(fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="border-t p-4">
      <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,audio/*"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          ref={inputRef}
          name="content"
          placeholder="Ketik pesan Anda atau lampirkan file..."
          disabled={isLoading}
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" disabled={isLoading} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}