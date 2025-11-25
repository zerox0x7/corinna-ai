'use client'
import useSideBar from '@/context/use-sidebar'
import { cn } from '@/lib/utils'
import React from 'react'
import MaxMenu from './maximized-menu'
import { MinMenu } from './minimized-menu'

type Props = {
  domains:
    | {
        id: string
        name: string
        icon: string
      }[]
    | null
    | undefined
}

const SideBar = ({ domains }: Props) => {
  const { expand, onExpand, page, onSignOut } = useSideBar()

  return (
    <div
      className={cn(
        'bg-cream dark:bg-neutral-950 h-full fill-mode-forwards fixed md:relative z-10 flex-shrink-0 overflow-visible',
        expand === true
          ? 'w-[300px] animate-open-sidebar'
          : expand === false
          ? 'w-[60px] animate-close-sidebar'
          : 'w-[300px]'
      )}
      style={{
        minWidth: expand === true ? '300px' : expand === false ? '60px' : '300px',
        left: 0,
        top: 0,
      }}
    >
      {expand ? (
        <MaxMenu
          domains={domains}
          current={page!}
          onExpand={onExpand}
          onSignOut={onSignOut}
        />
      ) : (
        <MinMenu
          domains={domains}
          onShrink={onExpand}
          current={page!}
          onSignOut={onSignOut}
        />
      )}
    </div>
  )
}

export default SideBar
