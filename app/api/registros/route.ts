export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "50");
    const search = url.searchParams.get("search") ?? "";
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { placa: { contains: search } },
            { motorista: { contains: search } },
            { veiculo: { contains: search } },
            { departamento: { contains: search } },
            { destino: { contains: search } },
            { posto: { contains: search } },
          ],
        }
      : {};

    const [registros, total] = await Promise.all([
      prisma.registroKm.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.registroKm.count({ where }),
    ]);

    return NextResponse.json({
      registros: registros?.map((r: any) => ({
        ...r,
        data: r?.data?.toISOString?.() ?? "",
        createdAt: r?.createdAt?.toISOString?.() ?? "",
      })) ?? [],
      total: total ?? 0,
      page,
      totalPages: Math.ceil((total ?? 0) / limit),
    });
  } catch (error: any) {
    console.error("GET /api/registros error:", error);
    return NextResponse.json({ error: "Erro ao buscar registros" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();

    const kmInicial = parseFloat(body?.kmInicial ?? "0");
    const kmFinal = parseFloat(body?.kmFinal ?? "0");
    const litros = body?.litros ? parseFloat(body.litros) : null;
    const valorLitro = body?.valorLitro ? parseFloat(body.valorLitro) : null;

    const kmPercorrido = kmFinal - kmInicial;
    const valorTotal = litros && valorLitro ? litros * valorLitro : null;
    const kmLitro = litros && litros > 0 ? kmPercorrido / litros : null;

    if (kmPercorrido < 0) {
      return NextResponse.json(
        { error: "KM Final deve ser maior que KM Inicial" },
        { status: 400 }
      );
    }

    // Get next numero
    const lastRecord = await prisma.registroKm.findFirst({
      orderBy: { numero: "desc" },
      where: { numero: { not: null } },
    });
    const nextNumero = ((lastRecord?.numero ?? 0) + 1);

    const registro = await prisma.registroKm.create({
      data: {
        numero: nextNumero,
        data: new Date(body?.data ?? new Date().toISOString()),
        placa: body?.placa ?? "",
        veiculo: body?.veiculo ?? "",
        motorista: body?.motorista ?? "",
        departamento: body?.departamento ?? "",
        destino: body?.destino ?? "",
        finalidade: body?.finalidade ?? "",
        kmInicial,
        kmFinal,
        kmPercorrido,
        combustivel: body?.combustivel ?? "",
        litros,
        valorLitro,
        valorTotal,
        kmLitro,
        posto: body?.posto ?? null,
        observacoes: body?.observacoes ?? null,
      },
    });

    return NextResponse.json({
      ...registro,
      data: registro?.data?.toISOString?.() ?? "",
      createdAt: registro?.createdAt?.toISOString?.() ?? "",
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/registros error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Erro ao criar registro" },
      { status: 500 }
    );
  }
}
