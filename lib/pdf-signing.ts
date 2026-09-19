import { createHmac, timingSafeEqual } from "crypto";
import { ItemType } from "@prisma/client";

const SECRET =
  process.env.FILE_SIGNING_SECRET ?? process.env.AUTH_SECRET ?? "dev-secret";

export type FileTokenPayload = {
  userId: string;
  itemType: ItemType;
  itemId: string;
  exp: number;
};

function encode(payload: FileTokenPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function createSignedFileToken(
  payload: Omit<FileTokenPayload, "exp">,
  ttlSeconds = 600,
) {
  return encode({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}

export function verifySignedFileToken(token: string): FileTokenPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as FileTokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function signedFilePath(token: string) {
  return `/api/files/${token}`;
}
