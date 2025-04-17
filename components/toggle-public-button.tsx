"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { toggleFilePublic } from "@/lib/actions"
import type { File } from "@prisma/client"

interface TogglePublicButtonProps {
  file: File
}

export function TogglePublicButton({ file }: TogglePublicButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    try {
      setIsUpdating(true)
      await toggleFilePublic(file.id)
      router.refresh()
    } catch (error) {
      console.error("Error toggling file visibility:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleToggle} disabled={isUpdating}>
      {file.isPublic ? (
        <>
          <Lock className="mr-2 h-4 w-4" />
          Make Private
        </>
      ) : (
        <>
          <Globe className="mr-2 h-4 w-4" />
          Make Public
        </>
      )}
    </Button>
  )
}
