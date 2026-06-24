-- CreateTable
CREATE TABLE "Composition" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "taal" TEXT,
    "notation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Composition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TablaModel" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "transitions" JSONB NOT NULL,
    "exampleCount" INTEGER NOT NULL,
    "trainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TablaModel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Composition" ADD CONSTRAINT "Composition_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
