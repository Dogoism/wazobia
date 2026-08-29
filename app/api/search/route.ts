import type { NextRequest } from "next/server";
import { searchYarn } from "@/lib/data/provider";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  if (query.length > 200) {
    return Response.json({ results: [] });
  }
  const results = await searchYarn(query);
  return Response.json({ results });
}
