import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Map([
  ["application/pdf", "pdf"],
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Keep files under 25 MB" }, { status: 400 });
  }

  const extension = ALLOWED.get(file.type);
  if (!extension) {
    return NextResponse.json(
      { error: "Upload a PDF, PNG, JPG, or WebP" },
      { status: 400 },
    );
  }

  const name = `${slug(file.name) || "upload"}-${randomUUID().slice(0, 8)}.${extension}`;
  const directory = path.join(process.cwd(), "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, name),
    Buffer.from(await file.arrayBuffer()),
  );

  return NextResponse.json({ path: `uploads/${name}`, name: file.name });
}
