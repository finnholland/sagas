import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sagas',
  description: 'Development blog',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='h-screen content-center justify-center items-center flex'>
      <body className={`${inter.className} w-full h-screen justify-end items-center flex`}>
        {children}
        <div className='w-1/4 flex flex-col h-10' />
      </body>
    </html>
  )
}
