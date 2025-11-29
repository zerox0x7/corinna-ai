'use client'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import React from 'react'
import { BotWindow } from './window'
import { cn, getUploadcareImageUrl } from '@/lib/utils'
import Image from 'next/image'
import { BotIcon } from '@/icons/bot-icon'

type Props = {}

const AiChatBot = (props: Props) => {
  const {
    onOpenChatBot,
    botOpened,
    onChats,
    register,
    onStartChatting,
    onAiTyping,
    messageWindowRef,
    currentBot,
    loading,
    onRealTime,
    setOnChats,
    errors,
    currentBotId,
    customerId,
  } = useChatBot()

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col items-end gap-3 p-4 md:p-6">
      {botOpened && (
        <div className="animate-in slide-in-from-bottom-5 duration-300">
          <BotWindow
            errors={errors}
            setChat={setOnChats}
            realtimeMode={onRealTime}
            helpdesk={currentBot?.helpdesk!}
            domainName={currentBot?.name!}
            domainId={currentBotId}
            customerId={customerId}
            ref={messageWindowRef}
            help={currentBot?.chatBot?.helpdesk}
            theme={currentBot?.chatBot?.background}
            textColor={currentBot?.chatBot?.textColor}
            chats={onChats}
            register={register}
            onChat={onStartChatting}
            onResponding={onAiTyping}
          />
        </div>
      )}
      <button
        className={cn(
          'rounded-full relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-grandis overflow-hidden',
          loading ? 'invisible' : 'visible'
        )}
        onClick={onOpenChatBot}
        aria-label="Open chat"
      >
        {currentBot?.chatBot?.icon ? (
          <Image
            src={getUploadcareImageUrl(currentBot.chatBot.icon)}
            alt="bot"
            fill
            className="rounded-full object-cover"
          />
        ) : (
          <BotIcon />
        )}
      </button>
    </div>
  )
}

export default AiChatBot
