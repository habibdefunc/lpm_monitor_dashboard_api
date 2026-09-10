-- CreateTable
CREATE TABLE `activities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(5000) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `category_id` INTEGER NOT NULL,
    `responsible_user_id` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL,

    INDEX `activities_category_id_idx`(`category_id`),
    INDEX `activities_responsible_user_id_idx`(`responsible_user_id`),
    INDEX `activities_start_date_idx`(`start_date`),
    INDEX `activities_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_responsible_user_id_fkey` FOREIGN KEY (`responsible_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
