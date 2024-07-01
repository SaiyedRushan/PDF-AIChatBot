"use client"
import { Inbox, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useMutation } from "@tanstack/react-query"

const FileUpload = () => {
  const router = useRouter()

  const [uploading, setUploading] = React.useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await axios.post("/api/upload-and-create-chat", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    },
    onSuccess: ({ chat_id }) => {
      toast.success("Chat created!")
      router.push(`/chat/${chat_id}`)
    },
    onError: (err) => {
      toast.error("Error creating chat")
      console.error(err)
    },
    onSettled: () => {
      setUploading(false)
    },
  })

  const dropzoneState = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large")
        return
      }
      setUploading(true)
      mutate(file)
    },
  })

  return (
    <div className='p-2 bg-white rounded-xl'>
      <div
        {...dropzoneState.getRootProps({
          className: "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}>
        <input {...dropzoneState.getInputProps()} />
        {uploading || isPending ? (
          <>
            <Loader2 className='h-10 w-10 text-blue-500 animate-spin' />
            <p className='mt-2 text-sm text-slate-400'>Spilling Tea to GPT...</p>
          </>
        ) : (
          <>
            <Inbox className='w-10 h-10 text-blue-500' />
            <p className='mt-2 text-sm text-slate-400'>Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  )
}

export default FileUpload
