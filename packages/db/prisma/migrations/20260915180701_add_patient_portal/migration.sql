-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'REQUESTED';

-- AlterTable
ALTER TABLE "clinic_settings" ADD COLUMN     "address" VARCHAR(300);

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "patients_userId_key" ON "patients"("userId");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
