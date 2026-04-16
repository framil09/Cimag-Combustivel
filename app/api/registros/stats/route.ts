export const runtime = 'edge'
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const result = await db.execute({
      sql: `SELECT
              COUNT(*) as totalRegistros,
              COALESCE(SUM(kmPercorrido), 0) as totalKm,
              COALESCE(SUM(litros), 0) as totalLitros,
              COALESCE(SUM(valorTotal), 0) as totalGasto,
              COALESCE(AVG(kmLitro), 0) as mediaKmLitro
            FROM RegistroKm`,
      args: [],
    });

    const row = result.rows[0] ?? {};

    return NextResponse.json({
      totalRegistros: Number(row.totalRegistros ?? 0),
      totalKm: Number(row.totalKm ?? 0),
      totalLitros: Number(row.totalLitros ?? 0),
      totalGasto: Number(row.totalGasto ?? 0),
      mediaKmLitro: Number(row.mediaKmLitro ?? 0),
    });
  } catch (error: any) {
    console.error("GET /api/registros/stats error:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}
