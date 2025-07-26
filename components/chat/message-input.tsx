'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    const content = textareaRef.current?.value ?? ''
    
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
      textareaRef.current?.focus()
    }
  }

  const handleFileUpload = async (file: File) => {
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const file = event.clipboardData.files[0]
    if (file && file.type.startsWith('image/')) {
      event.preventDefault()
      handleFileUpload(file)
    }
  }

  return (
    <div className="border-t p-4">
      <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2 items-start">
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
          className="mt-1"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Textarea
          ref={textareaRef}
          name="content"
          placeholder="Tekan Shift + Enter untuk baris baru"
          disabled={isLoading}
          className="flex-1 resize-none"
          rows={1}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          autoComplete="off"
        />
        <Button type="submit" disabled={isLoading} size="icon" className="mt-1">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
