'use client'

import React, { useEffect, useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer'

type Props = {
  onOpen: JSX.Element
  children: React.ReactNode
  title: string
  description: string
}

const AppDrawer = ({ children, description, onOpen, title }: Props) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div suppressHydrationWarning>{onOpen}</div>
  }

  return (
    <Drawer>
      <DrawerTrigger suppressHydrationWarning>{onOpen}</DrawerTrigger>
      <DrawerContent>
        <div className="container flex flex-col items-center gap-2 pb-10">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default AppDrawer
