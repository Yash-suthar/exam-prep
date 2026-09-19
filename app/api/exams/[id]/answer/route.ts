import { NextResponse } from "next/server";
import { lockAnswer } from "@/app/actions/exam";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await context.params;
  const body = (await request.json()) as {
    attemptId?: string;
    questionNo?: number;
    selectedOption?: string;
  };

  if (!body.attemptId || !body.questionNo || !body.selectedOption) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await lockAnswer({
    attemptId: body.attemptId,
    questionNo: body.questionNo,
    selectedOption: body.selectedOption,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
