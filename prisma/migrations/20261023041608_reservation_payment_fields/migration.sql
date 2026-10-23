-- AlterTable
ALTER TABLE `reservation` ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `paidAt` DATETIME(3) NULL,
    ADD COLUMN `paymentReference` VARCHAR(191) NULL;
