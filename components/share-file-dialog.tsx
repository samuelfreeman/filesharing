"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { shareFile, removeShare } from "@/lib/actions"
import type { Share, File } from "@prisma/client"

interface ShareFileDialogProps {
  file: File & { shares: Share[] }
}

export function ShareFileDialog({ file }: ShareFileDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const router = useRouter()

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      setIsSharing(true)
      await shareFile(file.id, email)
      setEmail("")
      router.refresh()
    } catch (error) {
      console.error("Error sharing file:", error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleRemoveShare = async (shareId: string) => {
    try {
      await removeShare(shareId)
      router.refresh()
    } catch (error) {
      console.error("Error removing share:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>Share this file with other users by email.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleShare}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="flex-1"
                />
                <Button type="submit" disabled={!email || isSharing}>
                  {isSharing ? "Sharing..." : "Share"}
                </Button>
              </div>
            </div>

            {file.shares.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium">Shared with:</h4>
                <div className="space-y-2">
                  {file.shares.map((share) => (
                    <div key={share.id} className="flex items-center justify-between rounded-md border p-2">
                      <span className="text-sm">{share.userId}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveShare(share.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
