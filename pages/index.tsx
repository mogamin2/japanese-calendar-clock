import React from 'react'
import Head from 'next/head'
import DateTimeCalendarApp from '../datetime-calendar-app'

export default function Home() {
  return (
    <>
      <Head>
        <title>Japanese Calendar Clock</title>
        <meta name="description" content="日本のカレンダー時計 - Japanese Calendar Clock" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <DateTimeCalendarApp />
      </main>
    </>
  )
}
