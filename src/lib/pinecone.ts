import { Pinecone } from "@pinecone-database/pinecone"
import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import { Document } from "langchain/document"
import { OpenAIEmbeddings } from "@langchain/openai"
import { PineconeStore } from "@langchain/pinecone"
import { convertToAscii } from "./utils"

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
})

export const pineconeIndex = pc.Index(process.env.PINECONE_INDEX!)

export async function loadFileIntoPinecone(file: File, file_key: string) {
  // Load and parse the PDF
  const loader = new PDFLoader(file)
  const pages = await loader.load()

  // Create and split documents
  const docs = await Promise.all(
    pages.map((page) => {
      const pageContent = page.pageContent
      const metadata = {
        ...page.metadata,
        fileKey: file_key,
      }
      return new Document({ pageContent, metadata })
    })
  )

  // Create a Pinecone store with the documents and embeddings
  const vectorStore = await PineconeStore.fromDocuments(docs, embeddings, {
    pineconeIndex,
    namespace: convertToAscii(file_key),
  })

  return vectorStore
}

export const getContext = async (query: string, fileKey: string) => {
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: convertToAscii(fileKey),
  })

  const results = await vectorStore.similaritySearch(query, 4)

  let context = ""
  for (const result of results) {
    context += `${result.pageContent}\n`
  }

  return context.trim()
}
