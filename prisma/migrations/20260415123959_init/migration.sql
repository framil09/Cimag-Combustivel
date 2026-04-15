-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RegistroKm" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER,
    "data" DATETIME NOT NULL,
    "placa" TEXT NOT NULL,
    "veiculo" TEXT NOT NULL,
    "motorista" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "finalidade" TEXT NOT NULL,
    "kmInicial" REAL NOT NULL,
    "kmFinal" REAL NOT NULL,
    "kmPercorrido" REAL NOT NULL,
    "combustivel" TEXT NOT NULL,
    "litros" REAL,
    "valorLitro" REAL,
    "valorTotal" REAL,
    "kmLitro" REAL,
    "posto" TEXT,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "RegistroKm_data_idx" ON "RegistroKm"("data");

-- CreateIndex
CREATE INDEX "RegistroKm_placa_idx" ON "RegistroKm"("placa");

-- CreateIndex
CREATE INDEX "RegistroKm_motorista_idx" ON "RegistroKm"("motorista");
