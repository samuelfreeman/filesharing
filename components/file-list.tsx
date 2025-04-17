import { formatBytes, formatDate } from "@/lib/utils"
import { FileIcon, FolderIcon } from "lucide-react"
import Link from "next/link"

interface FileListProps {
  files: any[]
  isShared?: boolean
}

export function FileList({ files, isShared = false }: FileListProps) {
  if (!files || files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <FolderIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No files found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {isShared ? "No files have been shared with you yet." : "Upload your first file to get started."}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <div className="grid grid-cols-3 gap-4 p-4 font-medium md:grid-cols-5">
        <div className="col-span-2">Name</div>
        <div className="hidden md:block">Size</div>
        <div className="hidden md:block">Uploaded</div>
        <div>Status</div>
      </div>
      <div className="divide-y">
        {files.map((file) => (
          <Link
            key={file.id}
            href={`/dashboard/files/${file.id}`}
            className="grid grid-cols-3 gap-4 p-4 hover:bg-muted/50 md:grid-cols-5"
          >
            <div className="col-span-2 flex items-center gap-2 truncate">
              <FileIcon className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{file.name}</span>
            </div>
            <div className="hidden text-muted-foreground md:block">{formatBytes(file.size)}</div>
            <div className="hidden text-muted-foreground md:block">{formatDate(file.createdAt)}</div>
            <div>
              {file.isPublic ? (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                  Private
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
