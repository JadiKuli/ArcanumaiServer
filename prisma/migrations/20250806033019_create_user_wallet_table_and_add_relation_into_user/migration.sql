-- CreateTable
CREATE TABLE `user_wallets` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NOT NULL,
    `coins` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `user_wallets_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_wallets` ADD CONSTRAINT `user_wallets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
