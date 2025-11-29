import React from 'react'
import { cn, extractUUIDFromString, getMonthName, getUploadcareImageUrl } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from './product-card'

type Props = {
  message: {
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
  }
  createdAt?: Date
  domainId?: string
  customerId?: string
}

const Bubble = ({ message, createdAt, domainId, customerId }: Props) => {
  let d = new Date()
  const image = extractUUIDFromString(message.content)
  console.log(message.link)

  return (
    <div
      className={cn(
        'flex gap-2 items-start max-w-[90%] md:max-w-[85%]',
        message.role == 'assistant' ? 'self-start' : 'self-end flex-row-reverse'
      )}
    >
      {message.role == 'assistant' ? (
        <Avatar className="w-7 h-7 flex-shrink-0 mt-1">
          <AvatarImage
            src="https://github.com/shadcn.png"
            alt="@shadcn"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ) : (
        <Avatar className="w-7 h-7 flex-shrink-0 bg-slate-700 mt-1">
          <AvatarFallback className="bg-slate-700 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col gap-3 flex-1">
        <div
          className={cn(
            'flex flex-col gap-2 px-4 py-2.5 rounded-2xl shadow-sm w-fit max-w-full',
            message.role == 'assistant'
              ? 'bg-gray-100 text-gray-900 rounded-bl-none'
              : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-br-none'
          )}
        >
          {image ? (
            <div className="relative aspect-square w-48 rounded-lg overflow-hidden">
              <Image
                src={getUploadcareImageUrl(image[0])}
                fill
                alt="image"
                className="object-cover"
              />
            </div>
          ) : (
            <p className="text-sm leading-relaxed break-words">
              {message.content.replace('(complete)', ' ').replace('(product-inquiry)', '').trim()}
              {message.link && (
                <Link
                  className={cn(
                    "underline font-semibold ml-1 hover:opacity-80 transition-opacity",
                    message.role == 'assistant' ? 'text-blue-600' : 'text-white'
                  )}
                  href={message.link}
                  target="_blank"
                >
                  Your Link
                </Link>
              )}
            </p>
          )}
          {createdAt ? (
            <p className={cn(
              "text-[10px] mt-0.5",
              message.role == 'assistant' ? 'text-gray-500' : 'text-white/70'
            )}>
              {createdAt.getDate()} {getMonthName(createdAt.getMonth())}{' '}
              {createdAt.getHours()}:{createdAt.getMinutes().toString().padStart(2, '0')}
              {createdAt.getHours() >= 12 ? ' PM' : ' AM'}
            </p>
          ) : (
            <p className={cn(
              "text-[10px] mt-0.5",
              message.role == 'assistant' ? 'text-gray-500' : 'text-white/70'
            )}>
              {`${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')} ${
                d.getHours() >= 12 ? 'PM' : 'AM'
              }`}
            </p>
          )}
        </div>
        
        {/* Product Cards Section */}
        {message.products && message.products.length > 0 && (
          <div className="grid grid-cols-1 gap-3 mt-2 w-full">
            {message.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                domainId={domainId || product.domainId || ''}
                customerId={customerId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Bubble
