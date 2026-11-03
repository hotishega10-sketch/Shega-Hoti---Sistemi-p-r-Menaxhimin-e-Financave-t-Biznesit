
CREATE TABLE IF NOT EXISTS `businesses` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `name` varchar(255) NOT NULL,
 `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `users` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `business_id` int(11) NOT NULL,
 `email` varchar(255) NOT NULL,
 `password_hash` varchar(255) NOT NULL,
 `role` enum('pronar','kontabilist','punjonjes') NOT NULL,
 `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
 PRIMARY KEY (`id`),
 UNIQUE KEY `email` (`email`),
 KEY `business_id` (`business_id`),
 CONSTRAINT `users_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `categories` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `business_id` int(11) NOT NULL,
 `name` varchar(100) NOT NULL,
 `type` enum('income','expense') NOT NULL,
 PRIMARY KEY (`id`),
 KEY `business_id` (`business_id`),
 CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `clients` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `business_id` int(11) NOT NULL,
 `name` varchar(255) NOT NULL,
 `email` varchar(255) DEFAULT NULL,
 `phone` varchar(50) DEFAULT NULL,
 `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
 PRIMARY KEY (`id`),
 KEY `business_id` (`business_id`),
 CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `business_id` int(11) NOT NULL,
 `user_id` int(11) NOT NULL,
 `category_id` int(11) NOT NULL,
 `amount` decimal(10,2) NOT NULL,
 `type` enum('income','expense') NOT NULL,
 `description` text DEFAULT NULL,
 `date` date NOT NULL,
 `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
 PRIMARY KEY (`id`),
 KEY `business_id` (`business_id`),
 KEY `user_id` (`user_id`),
 KEY `category_id` (`category_id`),
 CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
 CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
 CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `invoices` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `business_id` int(11) NOT NULL,
 `created_by_user_id` int(11) NOT NULL,
 `client_id` int(11) NOT NULL,
 `invoice_number` varchar(50) NOT NULL,
 `total` decimal(10,2) NOT NULL DEFAULT 0.00,
 `status` enum('e_papaguar','e_paguar','e_vonuar') DEFAULT 'e_papaguar',
 `due_date` date NOT NULL,
 `paid_at` timestamp NULL DEFAULT NULL,
 `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
 PRIMARY KEY (`id`),
 KEY `business_id` (`business_id`),
 KEY `created_by_user_id` (`created_by_user_id`),
 KEY `client_id` (`client_id`),
 CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
 CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`),
 CONSTRAINT `invoices_ibfk_3` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `invoice_items` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `invoice_id` int(11) NOT NULL,
 `description` varchar(255) NOT NULL,
 `quantity` int(11) NOT NULL DEFAULT 1,
 `unit_price` decimal(10,2) NOT NULL,
 `total_price` decimal(10,2) NOT NULL,
 PRIMARY KEY (`id`),
 KEY `invoice_id` (`invoice_id`),
 CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
