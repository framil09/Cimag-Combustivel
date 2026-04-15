export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const [totalRegistros, stats] = await Promise.all([
      prisma.registroKm.count(),
      prisma.registroKm.aggregate({
        _sum: {
          kmPercorrido: true,
          litros: true,
          valorTotal: true,
        },
        _avg: {
          kmLitro: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalRegistros: totalRegistros ?? 0,
      totalKm: stats?._sum?.kmPercorrido ?? 0,
      totalLitros: stats?._sum?.litros ?? 0,
      totalGasto: stats?._sum?.valorTotal ?? 0,
      mediaKmLitro: stats?._avg?.kmLitro ?? 0,
    });
  } catch (error: any) {
    console.error("GET /api/registros/stats error:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}
