/*
  Warnings:

  - Added the required column `amount` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `customer_phone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `payments` ADD COLUMN `amount` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
