import { FileList } from "@/components/file-list"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export default async function SharedPage() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  // Fetch shared files from the database using Prisma
  const sharedFiles = await prisma.share.findMany({
    where: {
      userId,
    },
    include: {
      file: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const files = sharedFiles.map((share) => share.file)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shared with Me</h1>
      </div>
      <FileList files={files} isShared />
    </div>
  )
}
