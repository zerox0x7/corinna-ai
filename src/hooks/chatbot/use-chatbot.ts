import { onAiChatBotAssistant, onGetCurrentChatBot } from '@/actions/bot'
import { postToParent, pusherClient } from '@/lib/utils'
import {
  ChatBotMessageProps,
  ChatBotMessageSchema,
} from '@/schemas/conversation.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { UploadClient } from '@uploadcare/upload-client'

import { useForm } from 'react-hook-form'

const upload = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
})

export const useChatBot = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatBotMessageProps>({
    resolver: zodResolver(ChatBotMessageSchema),
  })
  const [currentBot, setCurrentBot] = useState<
    | {
        name: string
        chatBot: {
          id: string
          icon: string | null
          welcomeMessage: string | null
          background: string | null
          textColor: string | null
          helpdesk: boolean
        } | null
        helpdesk: {
          id: string
          question: string
          answer: string
          domainId: string | null
        }[]
      }
    | undefined
  >()
  const messageWindowRef = useRef<HTMLDivElement | null>(null)
  const [botOpened, setBotOpened] = useState<boolean>(false)
  const onOpenChatBot = () => setBotOpened((prev) => !prev)
  const [loading, setLoading] = useState<boolean>(true)
  const [onChats, setOnChats] = useState<
    { 
      role: 'assistant' | 'user'
      content: string
      link?: string
      products?: Array<{
        id: string
        name: string
        price: number
        image: string
        domainId?: string | null
      }>
    }[]
  >([])
  const [onAiTyping, setOnAiTyping] = useState<boolean>(false)
  const [currentBotId, setCurrentBotId] = useState<string>()
  const [customerId, setCustomerId] = useState<string>()
  const [onRealTime, setOnRealTime] = useState<
    { chatroom: string; mode: boolean } | undefined
  >(undefined)


  const onScrollToBottom = () => {
    if (!messageWindowRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = messageWindowRef.current
    // Only auto-scroll if user is near the bottom (within 100px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    
    if (isNearBottom) {
      messageWindowRef.current.scrollTo({
        top: messageWindowRef.current.scrollHeight,
        left: 0,
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    onScrollToBottom()
  }, [onChats, messageWindowRef])

  useEffect(() => {
    postToParent(
      JSON.stringify({
        width: botOpened ? 550 : 80,
        height: botOpened ? 800 : 80,
      })
    )
  }, [botOpened])

  let limitRequest = 0

  const onGetDomainChatBot = async (id: string) => {
    setCurrentBotId(id)
    const chatbot = await onGetCurrentChatBot(id)
    if (chatbot) {
      setOnChats((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: chatbot.chatBot?.welcomeMessage!,
        },
      ])
      setCurrentBot(chatbot)
      setLoading(false)
    }
  }

  useEffect(() => {
    window.addEventListener('message', (e) => {
      console.log(e.data)
      const botid = e.data
      if (limitRequest < 1 && typeof botid == 'string') {
        onGetDomainChatBot(botid)
        limitRequest++
      }
    })
  }, [])

  const onStartChatting = handleSubmit(async (values) => {
    console.log('ALL VALUES', values)

    if (values.image.length) {
      console.log('IMAGE fROM ', values.image[0])
      const uploaded = await upload.uploadFile(values.image[0])
      // Use cdnUrl if available, otherwise fall back to uuid
      // The cdnUrl contains the full CDN URL with correct subdomain and filename
      const imageIdentifier = (uploaded as any).cdnUrl || uploaded.uuid
      const wasInRealtimeMode = onRealTime?.mode
      
      if (!onRealTime?.mode) {
        setOnChats((prev: any) => [
          ...prev,
          {
            role: 'user',
            content: imageIdentifier,
          },
        ])
      }

      console.log('🟡 RESPONSE FROM UC', uploaded.uuid, 'CDN URL:', (uploaded as any).cdnUrl)
      setOnAiTyping(true)
      const response = await onAiChatBotAssistant(
        currentBotId!,
        onChats,
        'user',
        imageIdentifier
      )

      if (response) {
        setOnAiTyping(false)
        if (response.live) {
          setOnRealTime((prev) => ({
            ...prev,
            chatroom: response.chatRoom,
            mode: response.live,
          }))
        } else {
          // If we were in realtime mode but now we're not, reset it
          if (wasInRealtimeMode) {
            console.log('🔄 [CHATBOT] Realtime mode deactivated, switching to AI')
            setOnRealTime(undefined)
            // Add the user message that wasn't shown locally
            setOnChats((prev: any) => [
              ...prev,
              {
                role: 'user',
                content: imageIdentifier,
              },
            ])
          }
          setOnChats((prev: any) => [...prev, response.response])
        }
        
        // Track customer ID if available
        if (response.customerId) {
          setCustomerId(response.customerId)
        }
      }
    }
    reset()

    if (values.content) {
      const wasInRealtimeMode = onRealTime?.mode
      
      if (!onRealTime?.mode) {
        setOnChats((prev: any) => [
          ...prev,
          {
            role: 'user',
            content: values.content,
          },
        ])
      }

      setOnAiTyping(true)

      const response = await onAiChatBotAssistant(
        currentBotId!,
        onChats,
        'user',
        values.content
      )

      if (response) {
        setOnAiTyping(false)
        if (response.live) {
          setOnRealTime({
            chatroom: response.chatRoom,
            mode: response.live,
          })
        } else {
          // If we were in realtime mode but now we're not, reset it
          if (wasInRealtimeMode) {
            console.log('🔄 [CHATBOT] Realtime mode deactivated, switching to AI')
            setOnRealTime(undefined)
            // Add the user message that wasn't shown locally
            setOnChats((prev: any) => [
              ...prev,
              {
                role: 'user',
                content: values.content,
              },
            ])
          }
          setOnChats((prev: any) => [...prev, response.response])
        }
        
        // Track customer ID if available
        if (response.customerId) {
          setCustomerId(response.customerId)
        }
      }
    }
  })

  return {
    botOpened,
    onOpenChatBot,
    onStartChatting,
    onChats,
    register,
    onAiTyping,
    messageWindowRef,
    currentBot,
    loading,
    setOnChats,
    onRealTime,
    errors,
    currentBotId,
    customerId,
  }
}

export const useRealTime = (
  chatRoom: string,
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        role: 'user' | 'assistant'
        content: string
        link?: string | undefined
      }[]
    >
  >
) => {
  useEffect(() => {
    if (!chatRoom) {
      console.log('⚠️ [CHATBOT] No chatRoom provided to useRealTime')
      return
    }

    // Check if Pusher client is initialized
    if (!pusherClient) {
      console.error('❌ [CHATBOT] Pusher client is not initialized!')
      return
    }

    console.log('🔵 [CHATBOT] Setting up real-time subscription for chatRoom:', chatRoom)
    console.log('🔵 [CHATBOT] Pusher client connection state:', pusherClient.connection?.state)
    
    // Wait for Pusher to be connected before subscribing
    let channel: any = null
    let handleRealtimeMessage: ((data: any) => void) | null = null
    let stateChangeHandler: (() => void) | null = null

    const subscribeToChannel = () => {
      console.log('🔵 [CHATBOT] Subscribing to Pusher channel:', chatRoom)
      
      // Check if already subscribed
      const existingChannel = pusherClient.channel(chatRoom)
      if (existingChannel) {
        console.log('⚠️ [CHATBOT] Already subscribed to channel, unsubscribing first...')
        pusherClient.unsubscribe(chatRoom)
      }
      
      // Subscribe to the chat room channel
      channel = pusherClient.subscribe(chatRoom)
      
      // Wait for subscription to be successful
      channel.bind('pusher:subscription_succeeded', () => {
        console.log('✅ [CHATBOT] Successfully subscribed to channel:', chatRoom)
        console.log('✅ [CHATBOT] Channel subscription state:', channel.subscribed)
      })

      // Handle subscription errors
      channel.bind('pusher:subscription_error', (error: any) => {
        console.error('❌ [CHATBOT] Subscription error:', error)
      })
      
      // Bind to realtime-mode events on the CHANNEL (not the client!)
      handleRealtimeMessage = (data: any) => {
        console.log('✅ [CHATBOT] Received realtime message from merchant:', data)
        console.log('✅ [CHATBOT] Message data structure:', JSON.stringify(data, null, 2))
        if (data?.chat) {
          console.log('✅ [CHATBOT] Adding message to chat:', {
            role: data.chat.role,
            content: data.chat.message,
          })
          setChats((prev: any) => {
            const newChats = [
              ...prev,
              {
                role: data.chat.role,
                content: data.chat.message,
              },
            ]
            console.log('✅ [CHATBOT] Updated chats array length:', newChats.length)
            return newChats
          })
        } else {
          console.warn('⚠️ [CHATBOT] Received message without chat data:', data)
        }
      }

      // CRITICAL: Bind to the channel, not the pusherClient!
      channel.bind('realtime-mode', handleRealtimeMessage)
      console.log('🔵 [CHATBOT] Bound to realtime-mode event on channel:', chatRoom)

      // Listen for realtime mode toggle from merchant
      channel.bind('realtime-mode-toggle', (data: any) => {
        console.log('🔄 [CHATBOT] Realtime mode toggled by merchant:', data)
        if (!data.live) {
          // Merchant disabled realtime mode, switch back to AI
          console.log('🤖 [CHATBOT] Switching back to AI mode')
          
          // Add AI message to chat
          if (data.message) {
            setChats((prev: any) => [
              ...prev,
              {
                role: 'assistant',
                content: data.message,
              },
            ])
          }
          
          // Note: We don't reset onRealTime state here as it's managed by useChatBot
          // The next customer message will check the live status from the server
        }
      })

      // Also log all events on the channel for debugging
      channel.bind_global((eventName: string, data: any) => {
        if (eventName !== 'pusher:subscription_succeeded' && eventName !== 'pusher:subscription_error') {
          console.log('🔍 [CHATBOT] Global event received:', eventName, data)
        }
      })
    }

    // Wait for Pusher to be connected before subscribing
    if (pusherClient.connection.state === 'connected') {
      subscribeToChannel()
    } else {
      console.log('⏳ [CHATBOT] Waiting for Pusher connection, current state:', pusherClient.connection.state)
      stateChangeHandler = () => {
        if (pusherClient.connection.state === 'connected') {
          console.log('✅ [CHATBOT] Pusher connected, now subscribing...')
          subscribeToChannel()
        }
      }
      pusherClient.connection.bind('state_change', stateChangeHandler)
    }

    // Cleanup function
    return () => {
      console.log('🔴 [CHATBOT] Cleaning up subscription for channel:', chatRoom)
      if (stateChangeHandler) {
        pusherClient.connection.unbind('state_change', stateChangeHandler)
      }
      if (channel && handleRealtimeMessage) {
        channel.unbind('realtime-mode', handleRealtimeMessage)
        channel.unbind_global()
      }
      pusherClient.unsubscribe(chatRoom)
    }
  }, [chatRoom, setChats])
}
