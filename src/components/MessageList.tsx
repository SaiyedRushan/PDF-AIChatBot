import { cn } from "@/lib/utils"
import { Message } from "ai/react"
import { Loader2 } from "lucide-react"
import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Props = {
  isLoading: boolean
  messages: Message[]
}

const MessageList = ({ messages, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <Loader2 className='w-6 h-6 animate-spin' />
      </div>
    )
  }
  if (!messages) return <></>
  return (
    <div className='flex flex-col gap-4 px-4 py-2 '>
      {messages.map((message) => {
        return (
          <div
            key={message.id}
            className={cn("flex", {
              "justify-end": message.role === "user",
              "justify-start": message.role === "assistant",
            })}>
            <div
              className={cn("rounded-lg px-4 py-2 shadow-md", {
                "bg-blue-600 text-white": message.role === "user",
              })}>
              {message.role === "user" ? (
                <p className='text-sm leading-relaxed'>{message.content}</p>
              ) : (
                <ReactMarkdown
                  className='text-sm leading-relaxed'
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }) {
                      return (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      )
                    },
                  }}>
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MessageList
