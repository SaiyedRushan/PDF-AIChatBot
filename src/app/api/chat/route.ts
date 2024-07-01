import { ChatOpenAI } from "@langchain/openai"
import { Message, OpenAIStream, StreamingTextResponse } from "ai"
import { getContext } from "@/lib/pinecone"
import { db } from "@/lib/db"
import { chats, messages as _messages } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

const openai = new ChatOpenAI()

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json()
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId))
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 })
    }
    const fileKey = _chats[0].fileKey
    const lastMessage = messages[messages.length - 1]
    const context = await getContext(lastMessage.content, fileKey)

    const prompt = {
      role: "system",
      content: `You are an AI assistant that can answer questions based on the context of a PDF document.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      `,
    }

    const response = await openai.completionWithRetry({
      model: "gpt-3.5-turbo",
      messages: [prompt, ...messages.filter((message: Message) => message.role === "user")],
      stream: true,
    })

    const stream = OpenAIStream(response, {
      onStart: async () => {
        // save user message into db
        await db.insert(_messages).values({
          chatId,
          content: lastMessage.content,
          role: "user",
        })
      },
      onCompletion: async (completion) => {
        // save ai message into db
        await db.insert(_messages).values({
          chatId,
          content: completion,
          role: "system",
        })
      },
    })
    return new StreamingTextResponse(stream)
  } catch (error) {}
}
