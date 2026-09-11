-- Drop the old constraint in a separate statement before reusing its name.
ALTER TABLE `activities`
    DROP FOREIGN KEY `activities_responsible_user_id_fkey`;

ALTER TABLE `activities`
    MODIFY `responsible_user_id` INTEGER NULL;

ALTER TABLE `activities`
    ADD CONSTRAINT `activities_responsible_user_id_fkey`
        FOREIGN KEY (`responsible_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `documentations`
    DROP FOREIGN KEY `documentations_uploaded_by_fkey`;

ALTER TABLE `documentations`
    MODIFY `uploaded_by` INTEGER NULL;

ALTER TABLE `documentations`
    ADD CONSTRAINT `documentations_uploaded_by_fkey`
        FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
