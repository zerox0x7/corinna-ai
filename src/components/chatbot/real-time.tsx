import React from 'react'
import { Card } from '../ui/card'
import { useRealTime } from '@/hooks/chatbot/use-chatbot'

type Props = {
  chatRoomId: string
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        role: 'user' | 'assistant'
        content: string
        link?: string | undefined
      }[]
    >
  >
}

const RealTimeMode = ({ chatRoomId, setChats }: Props) => {
  console.log('🟢 [RealTimeMode] Component rendered with chatRoomId:', chatRoomId)
  useRealTime(chatRoomId, setChats)

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
      </div>
      <Card className="px-3 rounded-full py-0.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 font-bold text-white text-xs shadow-lg border-yellow-600">
        Real Time
      </Card>
    </div>
  )
}

export default RealTimeMode
