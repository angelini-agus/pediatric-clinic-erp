-- CreateTable
CREATE TABLE "clinic_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "fullName" VARCHAR(200) NOT NULL,
    "licenseNumber" VARCHAR(50) NOT NULL,
    "specialty" VARCHAR(100) NOT NULL,
    "clinicName" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clinic_settings_pkey" PRIMARY KEY ("id")
);
