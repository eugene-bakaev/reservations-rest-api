CREATE TABLE `amenities` (
	`id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `amenities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int NOT NULL,
	`amenity_id` int NOT NULL,
	`user_id` int NOT NULL,
	`start_time` int NOT NULL,
	`end_time` int NOT NULL,
	`date` bigint NOT NULL,
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_amenity_id_amenities_id_fk` FOREIGN KEY (`amenity_id`) REFERENCES `amenities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_amenity_date` ON `reservations` (`amenity_id`,`date`);--> statement-breakpoint
CREATE INDEX `idx_user` ON `reservations` (`user_id`);
