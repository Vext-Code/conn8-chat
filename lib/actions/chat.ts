'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createNewChat(formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string || `Percakapan ${new Date().toLocaleDateString('id-ID')}`
  const webhook_url = formData.get('webhook_url') as string

  if (!webhook_url) {
    throw new Error('Webhook URL is required')
  }

  const { data: chat, error } = await supabase
    .from('chats')
    .insert([
      {
        user_id: user.id,
        title: title,
        webhook_url: webhook_url,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating chat:', error)
    throw new Error('Failed to create chat')
  }

  revalidatePath('/')
  redirect(`/chat/${chat.id}`)
}

export async function sendMessage(formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const chatId = formData.get('chatId') as string
  const content = formData.get('content') as string

  if (!chatId || !content.trim()) {
    throw new Error('Chat ID and content are required')
  }

  // Verify user owns this chat
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('id, user_id, webhook_url')
    .eq('id', chatId)
    .eq('user_id', user.id)
    .single()

  if (chatError || !chat) {
    throw new Error('Chat not found or access denied')
  }

  if (!chat.webhook_url) {
    throw new Error('Chat does not have a configured webhook URL')
  }

  // Save user message
  const { error: userMessageError } = await supabase
    .from('messages')
    .insert([
      {
        chat_id: chatId,
        role: 'user',
        content: content,
      },
    ])

  if (userMessageError) {
    console.error('Error saving user message:', userMessageError)
    throw new Error('Failed to save user message')
  }

  try {
    // Send to specific n8n webhook for this chat
    const webhookUrl = chat.webhook_url
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId,
        userId: user.id,
        content,
      }),
    })

    let botReply = 'Maaf, saya sedang mengalami gangguan. Silakan coba lagi nanti.'
    
    if (response.ok) {
      const data = await response.json()
      // Handle case where response is an array of objects
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        botReply = data[0].output
      } else if (data.output) { // Handle case for a single object
        botReply = data.output
      }
    } else {
      console.error('N8N webhook error:', response.status, response.statusText)
      // For demo purposes, use a default reply when webhook fails
      botReply = `Maaf, terjadi kesalahan saat menghubungi webhook. Pesan Anda: "${content}"`
    }

    // Save bot message
    const { error: botMessageError } = await supabase
      .from('messages')
      .insert([
        {
          chat_id: chatId,
          role: 'bot',
          content: botReply,
        },
      ])

    if (botMessageError) {
      console.error('Error saving bot message:', botMessageError)
      throw new Error('Failed to save bot message')
    }

  } catch (error) {
    console.error('Error communicating with n8n:', error)
    
    // Save error message from bot
    await supabase
      .from('messages')
      .insert([
        {
          chat_id: chatId,
          role: 'bot',
          content: 'Maaf, saya sedang mengalami gangguan. Silakan coba lagi nanti.',
        },
      ])
  }

  revalidatePath(`/chat/${chatId}`)
}

export async function deleteChat(chatId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', user.id) // Security check

  if (error) {
    console.error('Error deleting chat:', error)
    throw new Error('Failed to delete chat')
  }

  revalidatePath('/')
}

export async function updateChat(chatId: string, formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const webhook_url = formData.get('webhook_url') as string

  if (!title || !webhook_url) {
    throw new Error('Title and Webhook URL are required')
  }

  const { error } = await supabase
    .from('chats')
    .update({ title, webhook_url })
    .eq('id', chatId)
    .eq('user_id', user.id) // Security check

  if (error) {
    console.error('Error updating chat:', error)
    throw new Error('Failed to update chat')
  }

  revalidatePath('/')
}

export async function sendFileMessage(
  chatId: string,
  attachmentUrl: string,
  attachmentType: string
) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 1. Save the user's file message first
  const { error: userMessageError } = await supabase.from('messages').insert([
    {
      chat_id: chatId,
      role: 'user',
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
    },
  ])

  if (userMessageError) {
    console.error('Error saving file message:', userMessageError)
    throw new Error('Failed to save file message')
  }

  // 2. Get chat details to find the webhook URL
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('id, webhook_url')
    .eq('id', chatId)
    .eq('user_id', user.id)
    .single()

  if (chatError || !chat || !chat.webhook_url) {
    console.error('Chat not found or webhook URL is missing.')
    // We still revalidate to show the user's uploaded file
    revalidatePath(`/chat/${chatId}`)
    return
  }

  // 3. Trigger the n8n webhook with file information
  try {
    const response = await fetch(chat.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId,
        userId: user.id,
        fileUrl: attachmentUrl,
        fileType: attachmentType,
      }),
    })

    let botReply = 'Maaf, saya tidak bisa memproses file ini.'
    
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        botReply = data[0].output
      } else if (data.output) {
        botReply = data.output
      }
    } else {
      console.error('N8N webhook error for file:', response.status, response.statusText)
      botReply = 'Terjadi kesalahan saat memproses file Anda.'
    }

    // 4. Save bot's response message
    await supabase.from('messages').insert([
      {
        chat_id: chatId,
        role: 'bot',
        content: botReply,
      },
    ])

  } catch (error) {
    console.error('Error communicating with n8n for file:', error)
    await supabase.from('messages').insert([
      {
        chat_id: chatId,
        role: 'bot',
        content: 'Maaf, terjadi gangguan saat menghubungi layanan bot.',
      },
    ])
  }

  revalidatePath(`/chat/${chatId}`)
}
