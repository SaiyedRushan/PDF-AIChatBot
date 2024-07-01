import AWS from "aws-sdk"

export async function uploadToS3(file: File): Promise<{ file_key: string; file_name: string }> {
  return new Promise((resolve, reject) => {
    try {
      const s3 = new AWS.S3({
        region: process.env.NEXT_PUBLIC_AWS_REGION!,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
        },
      })

      const file_key = "uploads/" + Date.now().toString() + file.name.replace(" ", "-")

      file.arrayBuffer().then((arrayBuffer) => {
        const buffer = Buffer.from(arrayBuffer)

        const params = {
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
          Key: file_key,
          Body: buffer,
        }

        s3.upload(params, (err: any) => {
          if (err) {
            console.error(err)
            reject(err)
          } else {
            resolve({
              file_key,
              file_name: file.name,
            })
          }
        })
      })
    } catch (error) {
      reject(error)
    }
  })
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${file_key}`
  return url
}
