'use server'


import { auth } from "@clerk/nextjs/server"

import prisma from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()

  const file = await prisma.file.findUnique({
    where: { id: params.id },
    include: { shares: true },
  })

  if (!file) {
    return new NextResponse("File not found", { status: 404 })
  }

  const isOwner = file.ownerId === userId
  const isShared = file.shares.some((share) => share.userId === userId)

  if (!isOwner && !isShared && !file.isPublic) {
    return new NextResponse("Unauthorized", { status: 403 })
  }

  return NextResponse.redirect(file.url)
}
