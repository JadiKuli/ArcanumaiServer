/*
  Warnings:

  - A unique constraint covering the columns `[musicId]` on the table `posts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `posts` ADD COLUMN `musicId` VARCHAR(191) NULL,
    MODIFY `contentPath` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `musics` (
    `id` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `tags` VARCHAR(191) NULL,
    `negativeTags` VARCHAR(191) NULL,
    `lyrics` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `audioUrl` VARCHAR(191) NULL,
    `videoUrl` VARCHAR(191) NULL,
    `mv` VARCHAR(191) NULL,
    `duration` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `musics_externalId_key`(`externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `posts_musicId_key` ON `posts`(`musicId`);

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_musicId_fkey` FOREIGN KEY (`musicId`) REFERENCES `musics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musics` ADD CONSTRAINT `musics_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
