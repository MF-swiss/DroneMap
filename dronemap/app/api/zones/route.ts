import { NextResponse } from "next/server";

import { demoZones } from "@/data/demo-zones";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      zones: demoZones,
      meta: {
        count: demoZones.length,
        country: "CH",
        generatedAt: new Date().toISOString(),
        disclaimer:
          "Die gelieferten Zonen sind ausschließlich Demodaten und nicht rechtsverbindlich.",
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
