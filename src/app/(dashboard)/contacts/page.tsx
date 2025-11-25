import InfoBar from '@/components/infobar'
import React from 'react'

type Props = {}

const ContactsPage = async (props: Props) => {
  return (
    <>
      <div className="px-5">
        <InfoBar />
      </div>
      <div className="overflow-y-auto w-full chat-window flex-1 h-0 px-5">
        <div>
          <h2 className="font-bold text-2xl">Contacts</h2>
          <p className="text-sm font-light">
            Manage your contacts and customer information
          </p>
        </div>
      </div>
    </>
  )
}

export default ContactsPage

