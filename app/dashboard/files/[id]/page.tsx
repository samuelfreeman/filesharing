import { Button } from "@/components/ui/button"
import { ShareFileDialog } from "@/components/share-file-dialog"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { formatBytes } from "@/lib/utils"
import { FileIcon, Download, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { TogglePublicButton } from "@/components/toggle-public-button"
import { FileList } from "@/components/file-list"




interface FilePageProps {
  params: {
    id: string
  }
}

export default async function FilePage({ params }: FilePageProps) {
  const { userId } =await  auth()

  if (!userId) {
    redirect("/")
  }

  const file = await prisma.file.findUnique({
    where: {
      id: params.id // ✅ this is fine now
    },
    include: {
      shares: true,
    },
  })

  if (!file) return <div>File not found</div>

 

  // Check if user has access to this file
  const isOwner = file.ownerId === userId
  const isShared = file.shares.some((share) => share.userId === userId)

  if (!isOwner && !isShared && !file.isPublic) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Back</Link>
          </Button>
          <h1 className="text-2xl font-bold">{file.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <TogglePublicButton file={file} />
              <ShareFileDialog file={file} />
            </>
          )}
          <Button asChild>
            <a href={file.url} download={file.name}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-medium">File Details</h2>
            <div className="mt-2 grid gap-2">
              <div className="flex items-center gap-2">
                <FileIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Type: {file.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Size: {formatBytes(file.size)}</span>
              </div>
              <div className="flex items-center gap-2">
                {file.isPublic ? (
                  <>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Public file - anyone with the link can access</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Private file - only shared users can access</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {file.description && (
            <div>
              <h2 className="text-lg font-medium">Description</h2>
              <p className="mt-2 text-sm text-muted-foreground">{file.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
