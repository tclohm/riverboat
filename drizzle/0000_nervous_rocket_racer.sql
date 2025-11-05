CREATE TABLE `passes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`owner` text NOT NULL,
	`price` integer NOT NULL,
	`pass_type` text NOT NULL,
	`available_dates` text NOT NULL
);
