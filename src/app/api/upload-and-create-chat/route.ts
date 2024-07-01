import { db } from "@/lib/db"
import { chats } from "@/lib/db/schema"
import { loadFileIntoPinecone } from "@/lib/pinecone"
import { NextResponse } from "next/server"
import { getS3Url, uploadToS3 } from "@/lib/s3"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const { file_key, file_name } = await uploadToS3(file)

    if (!file_key || !file_name) {
      return NextResponse.json({ error: "Failed to upload file to S3" }, { status: 500 })
    }

    await loadFileIntoPinecone(file, file_key)

    const chatId = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        createdAt: new Date(),
        userId: userId,
      })
      .returning({ insertedId: chats.id })

    return NextResponse.json({ chat_id: chatId[0].insertedId }, { status: 200 })
  } catch (error) {
    console.error("Error in upload-and-create-chat:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
