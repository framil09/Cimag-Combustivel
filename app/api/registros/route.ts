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
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "50");
    const search = url.searchParams.get("search") ?? "";
    const skip = (page - 1) * limit;

    let whereSql = "";
    const args: any[] = [];

    if (search) {
      whereSql = "WHERE placa LIKE ? OR motorista LIKE ? OR veiculo LIKE ? OR departamento LIKE ? OR destino LIKE ? OR posto LIKE ?";
      const pattern = `%${search}%`;
      args.push(pattern, pattern, pattern, pattern, pattern, pattern);
    }

    const [registrosResult, countResult] = await Promise.all([
      db.execute({
        sql: `SELECT * FROM RegistroKm ${whereSql} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
        args: [...args, limit, skip],
      }),
      db.execute({
        sql: `SELECT COUNT(*) as total FROM RegistroKm ${whereSql}`,
        args,
      }),
    ]);

    const total = Number(countResult.rows[0]?.total ?? 0);

    return NextResponse.json({
      registros: registrosResult.rows ?? [],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("GET /api/registros error:", error);
    return NextResponse.json({ error: "Erro ao buscar registros" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
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

    const lastRecord = await db.execute({
      sql: 'SELECT numero FROM RegistroKm WHERE numero IS NOT NULL ORDER BY numero DESC LIMIT 1',
      args: [],
    });
    const nextNumero = (Number(lastRecord.rows[0]?.numero ?? 0) + 1);

    const now = new Date().toISOString();
    const dataValue = body?.data ? new Date(body.data).toISOString() : now;

    await db.execute({
      sql: `INSERT INTO RegistroKm (numero, data, placa, veiculo, motorista, departamento, destino, finalidade, kmInicial, kmFinal, kmPercorrido, combustivel, litros, valorLitro, valorTotal, kmLitro, posto, observacoes, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        nextNumero, dataValue, body?.placa ?? "", body?.veiculo ?? "",
        body?.motorista ?? "", body?.departamento ?? "", body?.destino ?? "",
        body?.finalidade ?? "", kmInicial, kmFinal, kmPercorrido,
        body?.combustivel ?? "", litros, valorLitro, valorTotal, kmLitro,
        body?.posto ?? null, body?.observacoes ?? null, now,
      ],
    });

    const inserted = await db.execute({
      sql: 'SELECT * FROM RegistroKm WHERE numero = ?',
      args: [nextNumero],
    });

    return NextResponse.json(inserted.rows[0] ?? {}, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/registros error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Erro ao criar registro" },
      { status: 500 }
    );
  }
}
