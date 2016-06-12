-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.7.10-log - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             9.3.0.5077
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for table demo.category_type
CREATE TABLE IF NOT EXISTS `category_type` (
  `code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table demo.category_type: ~2 rows (approximately)
/*!40000 ALTER TABLE `category_type` DISABLE KEYS */;
INSERT INTO `category_type` (`code`, `name`) VALUES
	('00', 'testing'),
	('01', 'test');
/*!40000 ALTER TABLE `category_type` ENABLE KEYS */;

-- Dumping structure for table demo.method_type
CREATE TABLE IF NOT EXISTS `method_type` (
  `code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table demo.method_type: ~2 rows (approximately)
/*!40000 ALTER TABLE `method_type` DISABLE KEYS */;
INSERT INTO `method_type` (`code`, `name`) VALUES
	('03', 'test method type'),
	('04', 'test test');
/*!40000 ALTER TABLE `method_type` ENABLE KEYS */;

-- Dumping structure for table demo.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `sid` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `session` text COLLATE utf8_unicode_ci NOT NULL,
  `expires` int(11) DEFAULT NULL,
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Dumping data for table demo.sessions: ~0 rows (approximately)
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` (`sid`, `session`, `expires`) VALUES
	('9aGWNrvC6In20NC5IHEuHBns4nDGtTh6', '{"cookie":{"originalMaxAge":899999,"expires":"2016-06-12T08:24:27.999Z","httpOnly":true,"path":"/"},"data":{"valid":true,"user":{"id":1,"user":"admin","pass_hash":"c4d5dfb76103f4ac608d7c8ef28fc2f4","pass_clear":"1234","pass_old":"0  19916717112911612511813710810910411111010512010297 110101119","display_name":"Aa Nippon","first_name":"Aa","last_name":"Nippon","mobile":"","line_id":"","last_login":"2016-06-06 09:17:18","last_ip":"::ffff:127.0.0.1","is_active":"YES","created_at":"2016-04-17 08:18:48","updated_at":"2016-06-12 15:07:17"}}}', 1465719868),
	('NBACH0jYxQNGSEjHboXTaiu51A7hlq--', '{"cookie":{"originalMaxAge":900000,"expires":"2016-06-10T06:45:06.525Z","httpOnly":true,"path":"/"},"data":{"valid":false}}', 1465541107);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;

-- Dumping structure for table demo.site_type
CREATE TABLE IF NOT EXISTS `site_type` (
  `code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table demo.site_type: ~4 rows (approximately)
/*!40000 ALTER TABLE `site_type` DISABLE KEYS */;
INSERT INTO `site_type` (`code`, `name`) VALUES
	('01', 'name01'),
	('12', '2323'),
	('23', '33'),
	('33', '33'),
	('55', '55'),
	('56', '55'),
	('67', '33'),
	('76', '99'),
	('99', '99'),
	('qw', 'qweas'),
	('xx', 'yyy');
/*!40000 ALTER TABLE `site_type` ENABLE KEYS */;

-- Dumping structure for table demo.staff
CREATE TABLE IF NOT EXISTS `staff` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `pass_hash` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `pass_clear` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `pass_old` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `mobile` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `line_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `last_login` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_ip` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `is_active` enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'YES',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_staff` (`user`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table demo.staff: ~0 rows (approximately)
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` (`id`, `user`, `pass_hash`, `pass_clear`, `pass_old`, `display_name`, `first_name`, `last_name`, `mobile`, `line_id`, `last_login`, `last_ip`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'admin', 'c4d5dfb76103f4ac608d7c8ef28fc2f4', '1234', '0  19916717112911612511813710810910411111010512010297 110101119', 'Aa Nippon', 'Aa', 'Nippon', '', '', '2016-06-12 15:07:22', '::ffff:127.0.0.1', 'YES', '2016-04-17 08:18:48', '2016-06-12 15:07:22'),
	(2, 'test', '63203b6c9b8111fceb4bd49f2901a3ff', '1234', '', '', '', '', '', '', '2016-06-09 21:17:15', '::ffff:127.0.0.1', 'YES', '2016-06-06 09:46:47', '2016-06-12 15:07:11');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
