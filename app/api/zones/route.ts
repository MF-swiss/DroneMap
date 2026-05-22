import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country")?.toUpperCase();

  if (!country) {
    return NextResponse.json({ error: "Missing country" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "data/zones", `${country}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "No local data for country" }, { status: 404 });
  }

  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return NextResponse.json(json);
}
