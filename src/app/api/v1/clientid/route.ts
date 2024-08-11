import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    clientId: process.env.NOTION_CLIENT_ID,
  });
}
