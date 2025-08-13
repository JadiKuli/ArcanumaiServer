-- AlterTable
ALTER TABLE `musics` ADD COLUMN `custom_mode` BOOLEAN NULL,
    ADD COLUMN `gpt_description_prompt` VARCHAR(191) NULL,
    ADD COLUMN `make_instrumental` BOOLEAN NULL;
