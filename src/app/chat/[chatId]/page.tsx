import ChatPageContent from "@/components/ChatPageContent"
import { db } from "@/lib/db"
import { chats } from "@/lib/db/schema"
import { checkSubscription } from "@/lib/subscription"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import React from "react"

type Props = {
  params: {
    chatId: string
  }
}

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth()

  if (!userId) {
    return redirect("/sign-in")
  }
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId))
  if (!_chats) {
    return redirect("/")
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/")
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId))
  const isPro = await checkSubscription()

  return <ChatPageContent chats={_chats} chatId={parseInt(chatId)} isPro={isPro} currentChat={currentChat} />
}

export default ChatPage
