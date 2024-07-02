"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ChatSideBar from "./ChatSideBar"
import PDFViewer from "./PDFViewer"
import ChatComponent from "./ChatComponent"
import React from "react"

const ChatPageContent = ({ chats, chatId, isPro, currentChat }: { chats: any[]; chatId: number; isPro: boolean; currentChat: any }) => {
  const [isPdfOpen, setIsPdfOpen] = React.useState(true)

  return (
    <div className='flex w-full h-screen overflow-hidden'>
      {/* chat sidebar */}
      <div className='flex-[1] max-w-xs'>
        <ChatSideBar chats={chats} chatId={chatId} isPro={isPro} />
      </div>

      {/* pdf viewer and toggle button */}
      <div className={`flex ${isPdfOpen ? "flex-[3]" : "flex-[0]"} transition-all duration-300 ease-in-out`}>
        <div className={`flex-grow overflow-auto ${isPdfOpen ? "" : "hidden"}`}>
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
        </div>
        <button onClick={() => setIsPdfOpen(!isPdfOpen)} className=' bg-gray-700 text-white rounded-br-md'>
          {isPdfOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      {/* chat component */}
      <div className={`border-l-4 border-l-slate-200 transition-all duration-300 ease-in-out flex-[4]`}>
        <ChatComponent chatId={chatId} />
      </div>
    </div>
  )
}

export default ChatPageContent
