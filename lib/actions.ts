"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"
import { put } from "@vercel/blob"
import prisma from "./prisma"
import { revalidatePath } from "next/cache"

import { toast } from "sonner"

export async function uploadFile(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    toast("User is Unauthorized", {
        description: "Please login to upload files",
      })
    throw new Error("Unauthorized")
  }

  const file = formData.get("file") as File
  const description = formData.get("description") as string

  if (!file) {
    toast("No file provided", {
      description: "Please provide a file to upload",
    })
    throw new Error("No file provided")
  }

  // Upload file to Vercel Blob
  const blob = await put(file.name, file, {
    access: "public",
  })

  // Save file metadata to database using Prisma
  const fileRecord = await prisma.file.create({
    data: {
      name: file.name,
      size: file.size,
      type: file.type,
      url: blob.url,
      key: blob.url,
      description,
      ownerId: userId,
    },
  })

  revalidatePath("/dashboard")
  return fileRecord
}

export async function shareFile(fileId: string, email: string) {
  const { userId } = await auth()

  if (!userId) {
    
    toast("User is Unauthorized", {
      description: "Please login to upload files",
    })
    throw new Error("Unauthorized")
  }

  // Get file to check ownership using Prisma
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  })

  if (!file || file.ownerId !== userId) {
    toast("File not found", {
      description: "You don't have permission to share this file",
    })
    throw new Error("File not found or you don't have permission")
  }

  // Find user by email
  try {
    const response = await (await clerkClient()).users.getUserList({
      emailAddress: [email],
    })
    
    if (response.totalCount === 0 || !response.data.length) {
      toast("User not found", {
        description: "User not found",
      })
      throw new Error("User not found")
    }
    
    const targetUserId = response.data[0].id

    // Don't share with yourself
    if (targetUserId === userId) {
      toast("You can't share a file with yourself", {
        description: "You can't share a file with yourself",
      })
      throw new Error("You can't share a file with yourself")
    }

    // Create share record using Prisma
    await prisma.share.create({
      data: {
        fileId,
        userId: targetUserId,
      },
    })

    revalidatePath(`/dashboard/files/${fileId}`)
    return { success: true }
  } catch (error) {
    toast("Error sharing file", {
      description: "Error sharing file",
    })
    console.error("Error sharing file:", error)
    throw error
  }
}

export async function removeShare(shareId: string) {
  const { userId } = await auth()

  if (!userId) {
    toast("User unauthorized", {
      description: "Please login to remove share",
    })
    throw new Error("Unauthorized")
  }

  // Get share to check ownership using Prisma
  const share = await prisma.share.findUnique({
    where: { id: shareId },
    include: { file: true },
  })

  if (!share || share.file.ownerId !== userId) {
    toast("Share not found", {
      description: "Share not found or you don't have permission",
    })
    throw new Error("Share not found or you don't have permission")
  }

  // Delete share record using Prisma
  await prisma.share.delete({
    where: { id: shareId },
  })

  revalidatePath(`/dashboard/files/${share.fileId}`)
  return { success: true }
}

export async function toggleFilePublic(fileId: string) {
  const { userId } = await auth()

  if (!userId) {
    toast("User unauthorized", {
      description: "Please login to remove share",
    })
    throw new Error("Unauthorized")
  }

  // Get file to check ownership using Prisma
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  })

  if (!file || file.ownerId !== userId) {
    toast("File not found", {
      description: "You don't have permission to share this file",
    })
    throw new Error("File not found or you don't have permission")
  }

  // Toggle isPublic flag using Prisma
  const updatedFile = await prisma.file.update({
    where: { id: fileId },
    data: {
      isPublic: !file.isPublic,
    },
  })

  revalidatePath(`/dashboard/files/${fileId}`)
  return updatedFile
}
