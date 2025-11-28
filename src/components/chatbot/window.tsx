import { ChatBotMessageProps } from '@/schemas/conversation.schema'
import { getUploadcareImageUrl } from '@/lib/utils'
import React, { forwardRef } from 'react'
import { UseFormRegister } from 'react-hook-form'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import RealTimeMode from './real-time'
import Image from 'next/image'
import TabsMenu from '../tabs/intex'
import { BOT_TABS_MENU } from '@/constants/menu'
import ChatIcon from '@/icons/chat-icon'
import { TabsContent } from '../ui/tabs'
import { Separator } from '../ui/separator'
import Bubble from './bubble'
import { Responding } from './responding'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Paperclip, Send } from 'lucide-react'
import { Label } from '../ui/label'
import { CardDescription, CardTitle } from '../ui/card'
import Accordion from '../accordian'
import UploadButton from '../upload-button'

type Props = {
  errors: any
  register: UseFormRegister<ChatBotMessageProps>
  chats: { role: 'assistant' | 'user'; content: string; link?: string }[]
  onChat(): void
  onResponding: boolean
  domainName: string
  theme?: string | null
  textColor?: string | null
  help?: boolean
  realtimeMode:
    | {
        chatroom: string
        mode: boolean
      }
    | undefined
  helpdesk: {
    id: string
    question: string
    answer: string
    domainId: string | null
  }[]
  setChat: React.Dispatch<
    React.SetStateAction<
      {
        role: 'user' | 'assistant'
        content: string
        link?: string | undefined
      }[]
    >
  >
}

export const BotWindow = forwardRef<HTMLDivElement, Props>(
  (
    {
      errors,
      register,
      chats,
      onChat,
      onResponding,
      domainName,
      helpdesk,
      realtimeMode,
      setChat,
      textColor,
      theme,
      help,
    },
    ref
  ) => {
    console.log(errors)
    return (
      <div className="h-[600px] w-[400px] md:w-[450px] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="flex justify-between items-start px-4 py-4 bg-gradient-to-r from-slate-50 to-white border-b">
          <div className="flex gap-3 flex-1 min-w-0">
            <Avatar className="w-14 h-14 flex-shrink-0 ring-2 ring-slate-200">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="@shadcn"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1 justify-center">
              <h3 className="text-base font-bold leading-tight truncate">
                Sales Rep - Web Prodigies
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {domainName.split('.com')[0]}
              </p>
              {realtimeMode?.mode && (
                <RealTimeMode
                  setChats={setChat}
                  chatRoomId={realtimeMode.chatroom}
                />
              )}
            </div>
          </div>
          <div className="relative w-14 h-14 flex-shrink-0">
            <Image
              src={getUploadcareImageUrl('019dd17d-b69b-4dea-a16b-60e0f25de1e9/propuser.png')}
              fill
              alt="users"
              className="object-contain"
            />
          </div>
        </div>
        <TabsMenu
          triggers={BOT_TABS_MENU}
          className="bg-transparent border-b mx-3 mt-1"
        >
          <TabsContent value="chat" className="mt-0">
            <div className="flex flex-col h-[455px]">
              <div
                style={{
                  background: theme || '',
                  color: textColor || '',
                }}
                className="px-4 flex-1 flex flex-col py-4 gap-3 chat-window overflow-y-auto"
                ref={ref}
              >
                {chats.map((chat, key) => (
                  <Bubble
                    key={key}
                    message={chat}
                  />
                ))}
                {onResponding && <Responding />}
              </div>
              <form
                onSubmit={onChat}
                className="flex px-4 py-3 flex-col bg-gray-50 border-t"
              >
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      {...register('content')}
                      placeholder="Type your message..."
                      className="focus-visible:ring-1 focus-visible:ring-primary flex-1 px-4 py-2 focus-visible:ring-offset-0 bg-white rounded-full outline-none border text-sm resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10 rounded-full flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <Label htmlFor="bot-image" className="cursor-pointer mt-2 ml-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>Attach file</span>
                  <Input
                    {...register('image')}
                    type="file"
                    id="bot-image"
                    className="hidden"
                  />
                </Label>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="helpdesk" className="mt-0">
            <div className="h-[485px] overflow-y-auto overflow-x-hidden px-4 py-3 flex flex-col gap-4">
              <div>
                <CardTitle className="text-base">Help Desk</CardTitle>
                <CardDescription className="text-sm">
                  Browse from a list of questions people usually ask.
                </CardDescription>
              </div>
              <Separator orientation="horizontal" />

              {helpdesk.map((desk) => (
                <Accordion
                  key={desk.id}
                  trigger={desk.question}
                  content={desk.answer}
                />
              ))}
            </div>
          </TabsContent>
        </TabsMenu>
        <div className="flex justify-center py-2 bg-gray-50">
          <p className="text-gray-400 text-[10px]">Powered By Web Prodigies</p>
        </div>
      </div>
    )
  }
)

BotWindow.displayName = 'BotWindow'
