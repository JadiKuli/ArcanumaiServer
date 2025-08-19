-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `imageProfile` VARCHAR(191) NULL,
    `birthdayDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_wallets` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NOT NULL,
    `coins` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `user_wallets_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `musicId` VARCHAR(191) NULL,
    `meshId` VARCHAR(191) NULL,
    `contentPath` VARCHAR(191) NULL,
    `caption` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `posts_musicId_key`(`musicId`),
    UNIQUE INDEX `posts_meshId_key`(`meshId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `likes` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `musics` (
    `id` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `tags` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `audioUrl` VARCHAR(191) NULL,
    `videoUrl` VARCHAR(191) NULL,
    `mv` VARCHAR(191) NULL,
    `duration` VARCHAR(191) NULL,
    `propmt` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `musics_externalId_key`(`externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mesh` (
    `id` VARCHAR(191) NOT NULL,
    `prompt` TEXT NOT NULL,
    `modelType` VARCHAR(191) NOT NULL,
    `taskIdPreview` VARCHAR(100) NOT NULL,
    `taskIdRefine` VARCHAR(100) NULL,
    `totalView` INTEGER NOT NULL DEFAULT 0,
    `modelGlbPreview` VARCHAR(255) NULL,
    `modelFbxPreview` VARCHAR(255) NULL,
    `modelUsdzPreview` VARCHAR(255) NULL,
    `modelObjPreview` VARCHAR(255) NULL,
    `previewImage` VARCHAR(255) NULL,
    `videoPreview` VARCHAR(255) NULL,
    `modelGlbRefine` VARCHAR(255) NULL,
    `modelFbxRefine` VARCHAR(255) NULL,
    `modelUsdzRefine` VARCHAR(255) NULL,
    `modelObjRefine` VARCHAR(255) NULL,
    `modelMtlRefine` VARCHAR(255) NULL,
    `refineImage` VARCHAR(255) NULL,
    `videoRefine` VARCHAR(255) NULL,
    `userId` VARCHAR(191) NULL,
    `state` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Mesh_taskIdPreview_key`(`taskIdPreview`),
    UNIQUE INDEX `Mesh_taskIdRefine_key`(`taskIdRefine`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Texture` (
    `id` VARCHAR(191) NOT NULL,
    `meshId` VARCHAR(100) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `url` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_wallets` ADD CONSTRAINT `user_wallets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_musicId_fkey` FOREIGN KEY (`musicId`) REFERENCES `musics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_meshId_fkey` FOREIGN KEY (`meshId`) REFERENCES `Mesh`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `likes_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `likes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musics` ADD CONSTRAINT `musics_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mesh` ADD CONSTRAINT `Mesh_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Texture` ADD CONSTRAINT `Texture_meshId_fkey` FOREIGN KEY (`meshId`) REFERENCES `Mesh`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
