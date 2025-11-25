'use server'
import nodemailer from 'nodemailer'

export const onMailer = async (email: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.NODE_MAILER_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.NODE_MAILER_PORT || '465'),
    secure: process.env.NODE_MAILER_SECURE === 'true',
    auth: {
      user: process.env.NODE_MAILER_EMAIL,
      pass: process.env.NODE_MAILER_PASSWORD || process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
    },
  })

  const mailOptions = {
    to: email,
    subject: 'Realtime Support',
    text: 'One of your customers on Corinna, just switched to realtime mode',
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent: ' + info.response)
  } catch (error) {
    console.log(error)
  }
}
