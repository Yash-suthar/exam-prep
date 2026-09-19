import { NextResponse } from "next/server";
import { submitAttempt } from "@/app/actions/exam";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await context.params;
  const body = (await request.json()) as {
    attemptId?: string;
    auto?: boolean;
  };

  if (!body.attemptId) {
    return NextResponse.json({ error: "Missing attempt" }, { status: 400 });
  }

  const result = await submitAttempt(body.attemptId, Boolean(body.auto));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, attemptId: result.attemptId });
}
