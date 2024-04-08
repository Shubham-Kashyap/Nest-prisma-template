/*
  Warnings:

  - You are about to drop the column `deliveryStatus` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `orderAmount` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddressId` on the `orders` table. All the data in the column will be lost.
  - Added the required column `delivery_status` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_amount` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_address_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_shippingAddressId_fkey`;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `deliveryStatus`,
    DROP COLUMN `orderAmount`,
    DROP COLUMN `shippingAddressId`,
    ADD COLUMN `delivery_status` ENUM('PENDING', 'IN_PROGRESS', 'DELIVERED', 'FAILED') NOT NULL,
    ADD COLUMN `order_amount` DOUBLE NOT NULL,
    ADD COLUMN `shipping_address_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `cart` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_shipping_address_id_fkey` FOREIGN KEY (`shipping_address_id`) REFERENCES `shipping_addresses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
