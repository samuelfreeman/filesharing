import { FileUploadButton } from "@/components/file-upload-button"
import { FileList } from "@/components/file-list"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export default async function DashboardPage() {
  const { userId } = await auth()


  console.log(userId)
  if (!userId) {
    return null
  }

  // Fetch files from the database using Prisma
  const files = await prisma.file.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Files</h1>
        <FileUploadButton />
      </div>
      <FileList files={files} />
    </div>
  )
}
