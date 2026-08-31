import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getPublicUrl(bucket: string, region: string, key: string) {
  const baseUrl = process.env.LAYOUT_PDF_PUBLIC_BASE_URL
  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, "")}/${key}`
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}

export async function POST(request: Request) {
  const region = process.env.AWS_REGION
  const bucket = process.env.LAYOUT_PDF_BUCKET

  if (!region || !bucket) {
    return NextResponse.json(
      { success: false, message: "Missing AWS_REGION or LAYOUT_PDF_BUCKET" },
      { status: 500 },
    )
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "Missing PDF file" },
      { status: 400 },
    )
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { success: false, message: "Only application/pdf uploads are allowed" },
      { status: 400 },
    )
  }

  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")
  const safeFilename = file.name.replace(/[^a-zA-Z0-9._@-]/g, "_")
  const key = `layout-plans/${year}/${month}/${safeFilename}`
  const body = Buffer.from(await file.arrayBuffer())

  const s3 = new S3Client({ region })

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "application/pdf",
      ContentDisposition: `inline; filename="${safeFilename}"`,
    }),
  )

  return NextResponse.json({
    success: true,
    url: getPublicUrl(bucket, region, key),
    key,
    filename: safeFilename,
  })
}
