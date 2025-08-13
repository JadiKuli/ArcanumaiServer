/*
  Warnings:

  - You are about to drop the column `custom_mode` on the `musics` table. All the data in the column will be lost.
  - You are about to drop the column `gpt_description_prompt` on the `musics` table. All the data in the column will be lost.
  - You are about to drop the column `lyrics` on the `musics` table. All the data in the column will be lost.
  - You are about to drop the column `make_instrumental` on the `musics` table. All the data in the column will be lost.
  - You are about to drop the column `negativeTags` on the `musics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `musics` DROP COLUMN `custom_mode`,
    DROP COLUMN `gpt_description_prompt`,
    DROP COLUMN `lyrics`,
    DROP COLUMN `make_instrumental`,
    DROP COLUMN `negativeTags`,
    ADD COLUMN `propmt` VARCHAR(191) NULL;
