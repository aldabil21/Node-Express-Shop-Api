-- phpMyAdmin SQL Dump
-- version 4.4.15.9
-- https://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Aug 08, 2020 at 07:41 PM
-- Server version: 5.6.37
-- PHP Version: 7.1.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `test`
--

-- --------------------------------------------------------

--
-- Table structure for table `address`
--

CREATE TABLE IF NOT EXISTS `address` (
  `address_id` int(11) unsigned NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
  `firstname` varchar(32) NOT NULL,
  `lastname` varchar(32) NOT NULL,
  `mobile` varchar(32) NOT NULL,
  `line1` varchar(128) NOT NULL,
  `country` varchar(5) NOT NULL,
  `city` varchar(32) NOT NULL,
  `state_code` varchar(8) NOT NULL,
  `post_code` varchar(8) NOT NULL,
  `location` point NOT NULL,
  `lat` varchar(32) DEFAULT NULL,
  `lng` varchar(32) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `address`
--

INSERT INTO `address` (`address_id`, `user_id`, `firstname`, `lastname`, `mobile`, `line1`, `country`, `city`, `state_code`, `post_code`, `location`, `lat`, `lng`, `is_primary`) VALUES
(1, 3, 'fistname', 'lastname', '', 'line1', 'SA', 'unayzah', '', '', '\0\0\0\0\0\0\0мллллF@мллллL:@', '44.1', '26.3', 0),
(2, 3, 'fistname', 'lastname', '', 'line1', 'SA', 'unayzah', '', '', '\0\0\0\0\0\0\0мллллF@мллллL:@', '44.1', '26.3', 0);

-- --------------------------------------------------------

--
-- Table structure for table `attribute`
--

CREATE TABLE IF NOT EXISTS `attribute` (
  `attribute_id` int(11) unsigned NOT NULL,
  `sort_order` int(2) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `attribute`
--

INSERT INTO `attribute` (`attribute_id`, `sort_order`, `status`) VALUES
(1, 0, 1),
(2, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `attribute_description`
--

CREATE TABLE IF NOT EXISTS `attribute_description` (
  `attribute_id` int(11) unsigned NOT NULL,
  `language` varchar(2) NOT NULL,
  `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `attribute_description`
--

INSERT INTO `attribute_description` (`attribute_id`, `language`, `title`) VALUES
(1, 'ar', 'ar attribute'),
(1, 'en', 'en attribute'),
(2, 'ar', 'ar att 2'),
(2, 'en', 'en att 2');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE IF NOT EXISTS `cart` (
  `item_id` int(11) unsigned NOT NULL,
  `product_id` int(11) unsigned NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `quantity` int(4) NOT NULL,
  `option_id` int(11) unsigned NOT NULL,
  `date_added` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`item_id`, `product_id`, `user_id`, `quantity`, `option_id`, `date_added`) VALUES
(17, 196, '3', 1, 0, '2020-08-02 21:26:04'),
(19, 191, '3', 10, 149, '2020-08-08 15:29:05');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE IF NOT EXISTS `category` (
  `category_id` int(11) unsigned NOT NULL,
  `image` varchar(255) NOT NULL,
  `parent_id` int(11) unsigned NOT NULL DEFAULT '0',
  `sort_order` int(2) unsigned NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `date_added` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`category_id`, `image`, `parent_id`, `sort_order`, `status`, `date_added`, `date_modified`) VALUES
(1, 'src', 0, 0, 1, '2020-07-19 21:17:48', '2020-07-28 14:04:43'),
(9, 'src', 3, 0, 1, '2020-07-28 14:21:41', '2020-07-28 14:21:41');

-- --------------------------------------------------------

--
-- Table structure for table `category_description`
--

CREATE TABLE IF NOT EXISTS `category_description` (
  `category_id` int(11) unsigned NOT NULL,
  `language` varchar(2) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `meta_title` varchar(255) NOT NULL,
  `meta_description` varchar(255) NOT NULL,
  `meta_keyword` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `category_description`
--

INSERT INTO `category_description` (`category_id`, `language`, `title`, `description`, `meta_title`, `meta_description`, `meta_keyword`) VALUES
(1, 'ar', 'ar title category2', 'updated2', '2', '', ''),
(1, 'en', 'en title category2', 'updated2', '2', '', ''),
(9, 'ar', 'ar title category', '', '', '', ''),
(9, 'en', 'en title category', '', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `filter`
--

CREATE TABLE IF NOT EXISTS `filter` (
  `filter_id` int(11) unsigned NOT NULL,
  `parent_id` int(11) unsigned NOT NULL DEFAULT '0',
  `sort_order` int(2) unsigned NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `date_added` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `filter`
--

INSERT INTO `filter` (`filter_id`, `parent_id`, `sort_order`, `status`, `date_added`, `date_modified`) VALUES
(4, 0, 0, 1, '2020-07-28 12:48:59', '2020-07-28 12:48:59'),
(5, 0, 0, 0, '2020-07-28 12:56:21', '2020-07-28 13:06:12'),
(6, 4, 0, 1, '2020-07-28 13:09:23', '2020-07-28 13:09:23');

-- --------------------------------------------------------

--
-- Table structure for table `filter_description`
--

CREATE TABLE IF NOT EXISTS `filter_description` (
  `filter_id` int(11) unsigned NOT NULL,
  `language` varchar(2) NOT NULL,
  `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `filter_description`
--

INSERT INTO `filter_description` (`filter_id`, `language`, `title`) VALUES
(4, 'ar', 'ar title filter'),
(4, 'en', 'en title filter'),
(5, 'ar', 'ar title filter edited'),
(5, 'en', 'en title filter edited'),
(6, 'ar', 'ar title filter'),
(6, 'en', 'en title filter');

-- --------------------------------------------------------

--
-- Table structure for table `option_description`
--

CREATE TABLE IF NOT EXISTS `option_description` (
  `option_id` int(11) unsigned NOT NULL,
  `language` varchar(2) NOT NULL,
  `title` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `option_description`
--

INSERT INTO `option_description` (`option_id`, `language`, `title`) VALUES
(149, 'ar', 'aroption updated'),
(149, 'en', 'enoption'),
(150, 'ar', 'aroption'),
(150, 'en', 'enoption'),
(211, 'ar', 'aroption'),
(211, 'en', 'enoption'),
(212, 'ar', 'aroption'),
(212, 'en', 'enoption'),
(213, 'ar', 'aroption'),
(213, 'en', 'enoption'),
(214, 'ar', 'aroption'),
(214, 'en', 'enoption'),
(223, 'ar', 'aroption updated'),
(223, 'en', 'enoption'),
(224, 'ar', 'aroption'),
(224, 'en', 'enoption');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int(11) unsigned NOT NULL,
  `invoice_no` varchar(128) NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
  `firstname` varchar(32) NOT NULL,
  `lastname` varchar(32) NOT NULL,
  `mobile` varchar(32) NOT NULL,
  `line1` varchar(100) NOT NULL,
  `country` varchar(2) NOT NULL,
  `city` varchar(2) NOT NULL,
  `location` point DEFAULT NULL,
  `payment_method` varchar(32) NOT NULL,
  `payment_code` varchar(4) NOT NULL,
  `total` decimal(8,2) NOT NULL,
  `order_status_id` tinyint(1) NOT NULL DEFAULT '0',
  `tracking` varchar(64) NOT NULL,
  `date_added` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `invoice_no`, `user_id`, `firstname`, `lastname`, `mobile`, `line1`, `country`, `city`, `location`, `payment_method`, `payment_code`, `total`, `order_status_id`, `tracking`, `date_added`, `date_modified`) VALUES
(3, 'INV2046073', 3, '', '', '', '', '', '', NULL, '', '', 480.00, 0, '', '2020-08-07 21:46:30', '2020-08-08 15:34:42'),
(4, 'INV2059074', 3, '', '', '', '', '', '', NULL, '', '', 1083.75, 0, '', '2020-08-07 21:59:25', '2020-08-08 13:49:13');

-- --------------------------------------------------------

--
-- Table structure for table `order_products`
--

CREATE TABLE IF NOT EXISTS `order_products` (
  `order_product_id` int(11) unsigned NOT NULL,
  `order_id` int(11) unsigned NOT NULL,
  `product_id` int(11) unsigned NOT NULL,
  `product_title` varchar(255) NOT NULL,
  `product_option` varchar(64) DEFAULT NULL,
  `quantity` int(4) NOT NULL,
  `price` decimal(8,2) NOT NULL DEFAULT '0.00',
  `total` decimal(8,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(8,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `order_products`
--

INSERT INTO `order_products` (`order_product_id`, `order_id`, `product_id`, `product_title`, `product_option`, `quantity`, `price`, `total`, `tax`) VALUES
(16, 4, 191, 'ar updated', 'aroption updated', 55, 15.00, 825.00, 123.75),
(17, 4, 196, 'ar title', '', 1, 100.00, 100.00, 15.00),
(94, 3, 196, 'ar title', '', 1, 100.00, 100.00, 15.00),
(95, 3, 191, 'ar updated', 'aroption updated', 10, 30.00, 300.00, 45.00);

-- --------------------------------------------------------

--
-- Table structure for table `order_totals`
--

CREATE TABLE IF NOT EXISTS `order_totals` (
  `order_total_id` int(11) NOT NULL,
  `order_id` int(11) unsigned NOT NULL,
  `text` varchar(128) NOT NULL,
  `value` decimal(8,2) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=245 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `order_totals`
--

INSERT INTO `order_totals` (`order_total_id`, `order_id`, `text`, `value`) VALUES
(29, 4, 'neto', 925.00),
(30, 4, 'VAT', 138.75),
(31, 4, 'flat_rate', 20.00),
(32, 4, 'brutto', 1083.75),
(241, 3, 'neto', 400.00),
(242, 3, 'VAT', 60.00),
(243, 3, 'flat_rate', 20.00),
(244, 3, 'brutto', 480.00);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE IF NOT EXISTS `product` (
  `product_id` int(11) unsigned NOT NULL,
  `quantity` int(4) unsigned NOT NULL DEFAULT '0',
  `image` varchar(255) NOT NULL DEFAULT 'no-image.png',
  `price` decimal(8,2) NOT NULL DEFAULT '0.00',
  `points` int(8) NOT NULL DEFAULT '0',
  `tax_id` int(2) NOT NULL,
  `weight` decimal(8,2) unsigned NOT NULL DEFAULT '0.00',
  `subtract` int(1) unsigned NOT NULL DEFAULT '1',
  `minimum` int(4) NOT NULL DEFAULT '1',
  `maximum` int(4) DEFAULT NULL,
  `available_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `view` int(11) NOT NULL DEFAULT '0',
  `sold` int(11) NOT NULL DEFAULT '0',
  `date_added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=203 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`product_id`, `quantity`, `image`, `price`, `points`, `tax_id`, `weight`, `subtract`, `minimum`, `maximum`, `available_at`, `status`, `view`, `sold`, `date_added`, `date_modified`) VALUES
(191, 100, '1', 55.79, 400, 1, 200.00, 1, 1, NULL, '2020-02-02 21:00:00', 1, 134, 0, '2020-07-24 21:18:19', '2020-07-28 10:10:33'),
(196, 50, '1', 100.00, 1, 1, 133.00, 1, 1, NULL, '2000-12-31 21:00:00', 1, 54, 0, '2020-07-24 21:19:49', '2020-07-24 21:19:49'),
(197, 10, '1', 1.00, 1, 1, 1.00, 1, 1, NULL, '2000-12-31 21:00:00', 1, 1, 0, '2020-07-26 11:33:08', '2020-07-26 11:33:08'),
(198, 10, '1', 1.00, 1, 1, 1.00, 1, 1, NULL, '2000-12-31 21:00:00', 1, 0, 0, '2020-07-26 11:33:57', '2020-07-26 11:33:57'),
(202, 100, '1', 55.79, 400, 1, 1.00, 1, 1, NULL, '2020-02-02 21:00:00', 1, 70, 0, '2020-07-28 11:39:18', '2020-07-28 11:45:28');

-- --------------------------------------------------------

--
-- Table structure for table `product_attribute`
--

CREATE TABLE IF NOT EXISTS `product_attribute` (
  `attribute_id` int(11) unsigned NOT NULL,
  `product_id` int(11) unsigned NOT NULL,
  `language` varchar(2) NOT NULL,
  `description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product_attribute`
--

INSERT INTO `product_attribute` (`attribute_id`, `product_id`, `language`, `description`) VALUES
(1, 191, 'ar', 'arttribute'),
(1, 191, 'en', 'enttribute'),
(1, 196, 'ar', 'arttribute'),
(1, 196, 'en', 'enttribute'),
(1, 197, 'ar', 'arttribute'),
(1, 197, 'en', 'enttribute'),
(1, 198, 'ar', 'arttribute'),
(1, 198, 'en', 'enttribute'),
(1, 202, 'ar', 'arttribute'),
(1, 202, 'en', 'enttribute'),
(2, 191, 'ar', 'arttribute'),
(2, 191, 'en', 'enttribute'),
(2, 202, 'ar', 'arttribute'),
(2, 202, 'en', 'enttribute');

-- --------------------------------------------------------

--
-- Table structure for table `product_category`
--

CREATE TABLE IF NOT EXISTS `product_category` (
  `product_id` int(11) unsigned NOT NULL,
  `category_id` int(11) unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product_category`
--

INSERT INTO `product_category` (`product_id`, `category_id`) VALUES
(191, 1),
(197, 1),
(196, 9),
(202, 9);

-- --------------------------------------------------------

--
-- Table structure for table `product_description`
--

CREATE TABLE IF NOT EXISTS `product_description` (
  `product_id` int(11) unsigned NOT NULL,
  `language` varchar(2) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `tags` text NOT NULL,
  `meta_title` varchar(255) NOT NULL,
  `meta_description` varchar(255) NOT NULL,
  `meta_keywords` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product_description`
--

INSERT INTO `product_description` (`product_id`, `language`, `title`, `description`, `tags`, `meta_title`, `meta_description`, `meta_keywords`) VALUES
(191, 'ar', 'ar updated', 'ar upp', 'ar', '', 'desccc ar', ''),
(191, 'en', 'en updated', 'en updated', 'en', '', '', ''),
(196, 'ar', 'ar title', 'ar', 'ar', '', '', ''),
(196, 'en', 'en title', 'en', 'en', '', '', ''),
(197, 'ar', 'ar', 'ar', 'ar', '', '', ''),
(197, 'en', 'en title', 'en', 'en', '', '', ''),
(198, 'ar', 'ar', 'ar', 'ar', '', '', ''),
(198, 'en', 'en title', 'en', 'en', '', '', ''),
(202, 'ar', 'ar updated', 'ar upp', 'ar', '', 'desccc ar', ''),
(202, 'en', 'en updated', 'en updated', 'en', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `product_filter`
--

CREATE TABLE IF NOT EXISTS `product_filter` (
  `product_id` int(11) unsigned NOT NULL,
  `filter_id` int(11) unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product_filter`
--

INSERT INTO `product_filter` (`product_id`, `filter_id`) VALUES
(191, 4),
(202, 4),
(191, 6);

-- --------------------------------------------------------

--
-- Table structure for table `product_option`
--

CREATE TABLE IF NOT EXISTS `product_option` (
  `option_id` int(11) unsigned NOT NULL,
  `product_id` int(11) unsigned NOT NULL,
  `quantity` int(4) NOT NULL DEFAULT '0',
  `price` decimal(8,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB AUTO_INCREMENT=225 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product_option`
--

INSERT INTO `product_option` (`option_id`, `product_id`, `quantity`, `price`) VALUES
(149, 191, 222, 30.00),
(150, 191, 10, 50.00),
(211, 197, 1, 20.00),
(212, 197, 10, 50.00),
(213, 198, 1, 20.00),
(214, 198, 10, 50.00),
(223, 202, 50, 30.00),
(224, 202, 10, 50.00);

-- --------------------------------------------------------

--
-- Table structure for table `product_special`
--

CREATE TABLE IF NOT EXISTS `product_special` (
  `id` int(11) unsigned NOT NULL,
  `product_id` int(11) unsigned NOT NULL,
  `price` decimal(8,2) NOT NULL DEFAULT '0.00',
  `deadline` datetime NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product_special`
--

INSERT INTO `product_special` (`id`, `product_id`, `price`, `deadline`, `status`, `created_at`, `updated_at`) VALUES
(3, 191, 10.00, '2021-07-07 00:00:00', 0, '2020-07-25 15:08:00', '2020-07-29 21:39:00'),
(4, 196, 11.00, '2021-07-30 00:00:00', 0, '2020-07-26 14:24:22', '2020-07-26 14:24:22'),
(5, 196, 10.00, '2021-07-30 00:00:00', 0, '2020-07-26 14:36:43', '2020-07-26 14:36:43');

-- --------------------------------------------------------

--
-- Table structure for table `product_wholesale`
--

CREATE TABLE IF NOT EXISTS `product_wholesale` (
  `id` int(11) unsigned NOT NULL,
  `product_id` int(11) unsigned NOT NULL,
  `quantity` int(4) NOT NULL,
  `price` decimal(8,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product_wholesale`
--

INSERT INTO `product_wholesale` (`id`, `product_id`, `quantity`, `price`) VALUES
(15, 191, 50, 15.00),
(15, 202, 50, 15.00),
(16, 191, 100, 10.00),
(16, 202, 100, 10.00),
(58, 196, 50, 15.00),
(59, 196, 100, 10.00),
(60, 197, 50, 15.00),
(61, 197, 100, 10.00),
(62, 198, 50, 15.00),
(63, 198, 100, 10.00);

-- --------------------------------------------------------

--
-- Table structure for table `setting`
--

CREATE TABLE IF NOT EXISTS `setting` (
  `setting_id` int(11) unsigned NOT NULL,
  `code` varchar(128) NOT NULL,
  `key_id` varchar(128) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `setting`
--

INSERT INTO `setting` (`setting_id`, `code`, `key_id`, `value`) VALUES
(1, 'tax', 'status', '0'),
(2, 'shipping', 'status', '1'),
(3, 'shipping', 'flat_status', '1'),
(4, 'shipping', 'flat_rate', '20'),
(5, 'shipping', 'weight_status', '1'),
(6, 'shipping', 'weight_base_amount', '10'),
(7, 'shipping', 'weight_per_kg_amount', '2'),
(8, 'payment_method', 'credit_card', '0'),
(9, 'payment_method', 'cod', '1'),
(10, 'cod', 'title', 'cod'),
(11, 'credit_card', 'title', 'credit_cart');

-- --------------------------------------------------------

--
-- Table structure for table `tax`
--

CREATE TABLE IF NOT EXISTS `tax` (
  `tax_id` int(11) unsigned NOT NULL,
  `value` decimal(4,2) NOT NULL,
  `title` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tax`
--

INSERT INTO `tax` (`tax_id`, `value`, `title`, `status`) VALUES
(1, 15.00, 'VAT', 1),
(2, 10.00, 'Old Vat', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int(11) unsigned NOT NULL,
  `firstname` varchar(32) NOT NULL,
  `lastname` varchar(32) NOT NULL,
  `email` varchar(96) NOT NULL,
  `mobile` varchar(32) NOT NULL,
  `password` varchar(64) NOT NULL,
  `newsletter` tinyint(1) NOT NULL DEFAULT '0',
  `ip` varchar(40) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `reset_token` varchar(255) DEFAULT NULL,
  `otp` int(4) DEFAULT NULL,
  `role` enum('user','admin','','') NOT NULL DEFAULT 'user',
  `date_added` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `firstname`, `lastname`, `email`, `mobile`, `password`, `newsletter`, `ip`, `status`, `reset_token`, `otp`, `role`, `date_added`) VALUES
(3, 'ali', 'one', 'a@a.com', '+966503925556', '$2b$10$7zicj9YoTkCiv4HPKwzrxu1.wVnrZXCioWdLFKEfclVy/NBIa1dDe', 0, '::1', 1, NULL, 0, 'user', '2020-08-02 20:03:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `address`
--
ALTER TABLE `address`
  ADD PRIMARY KEY (`address_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `attribute`
--
ALTER TABLE `attribute`
  ADD PRIMARY KEY (`attribute_id`);

--
-- Indexes for table `attribute_description`
--
ALTER TABLE `attribute_description`
  ADD PRIMARY KEY (`attribute_id`,`language`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`item_id`,`option_id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `category_description`
--
ALTER TABLE `category_description`
  ADD PRIMARY KEY (`category_id`,`language`);

--
-- Indexes for table `filter`
--
ALTER TABLE `filter`
  ADD PRIMARY KEY (`filter_id`);

--
-- Indexes for table `filter_description`
--
ALTER TABLE `filter_description`
  ADD PRIMARY KEY (`filter_id`,`language`);

--
-- Indexes for table `option_description`
--
ALTER TABLE `option_description`
  ADD PRIMARY KEY (`option_id`,`language`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`);

--
-- Indexes for table `order_products`
--
ALTER TABLE `order_products`
  ADD PRIMARY KEY (`order_product_id`,`order_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `order_totals`
--
ALTER TABLE `order_totals`
  ADD PRIMARY KEY (`order_total_id`,`order_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `product_attribute`
--
ALTER TABLE `product_attribute`
  ADD PRIMARY KEY (`attribute_id`,`product_id`,`language`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_category`
--
ALTER TABLE `product_category`
  ADD PRIMARY KEY (`product_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `product_description`
--
ALTER TABLE `product_description`
  ADD PRIMARY KEY (`product_id`,`language`);

--
-- Indexes for table `product_filter`
--
ALTER TABLE `product_filter`
  ADD PRIMARY KEY (`product_id`,`filter_id`),
  ADD KEY `filter_id` (`filter_id`);

--
-- Indexes for table `product_option`
--
ALTER TABLE `product_option`
  ADD PRIMARY KEY (`option_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_special`
--
ALTER TABLE `product_special`
  ADD PRIMARY KEY (`id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_wholesale`
--
ALTER TABLE `product_wholesale`
  ADD PRIMARY KEY (`id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `setting`
--
ALTER TABLE `setting`
  ADD PRIMARY KEY (`setting_id`);

--
-- Indexes for table `tax`
--
ALTER TABLE `tax`
  ADD PRIMARY KEY (`tax_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `address`
--
ALTER TABLE `address`
  MODIFY `address_id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `attribute`
--
ALTER TABLE `attribute`
  MODIFY `attribute_id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `item_id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=20;
--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `category_id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT for table `filter`
--
ALTER TABLE `filter`
  MODIFY `filter_id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `order_products`
--
ALTER TABLE `order_products`
  MODIFY `order_product_id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=96;
--
-- AUTO_INCREMENT for table `order_totals`
--
ALTER TABLE `order_totals`
  MODIFY `order_total_id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=245;
--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `product_id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=203;
--
-- AUTO_INCREMENT for table `product_option`
--
ALTER TABLE `product_option`
  MODIFY `option_id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=225;
--
-- AUTO_INCREMENT for table `product_special`
--
ALTER TABLE `product_special`
  MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `product_wholesale`
--
ALTER TABLE `product_wholesale`
  MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=64;
--
-- AUTO_INCREMENT for table `setting`
--
ALTER TABLE `setting`
  MODIFY `setting_id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=12;
--
-- AUTO_INCREMENT for table `tax`
--
ALTER TABLE `tax`
  MODIFY `tax_id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `address`
--
ALTER TABLE `address`
  ADD CONSTRAINT `address_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `attribute_description`
--
ALTER TABLE `attribute_description`
  ADD CONSTRAINT `attribute_description_ibfk_1` FOREIGN KEY (`attribute_id`) REFERENCES `attribute` (`attribute_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `category_description`
--
ALTER TABLE `category_description`
  ADD CONSTRAINT `category_description_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `filter_description`
--
ALTER TABLE `filter_description`
  ADD CONSTRAINT `filter_description_ibfk_1` FOREIGN KEY (`filter_id`) REFERENCES `filter` (`filter_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `option_description`
--
ALTER TABLE `option_description`
  ADD CONSTRAINT `option_description_ibfk_1` FOREIGN KEY (`option_id`) REFERENCES `product_option` (`option_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_products`
--
ALTER TABLE `order_products`
  ADD CONSTRAINT `order_products_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_totals`
--
ALTER TABLE `order_totals`
  ADD CONSTRAINT `order_totals_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_attribute`
--
ALTER TABLE `product_attribute`
  ADD CONSTRAINT `product_attribute_ibfk_1` FOREIGN KEY (`attribute_id`) REFERENCES `attribute` (`attribute_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_attribute_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_category`
--
ALTER TABLE `product_category`
  ADD CONSTRAINT `product_category_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_category_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_description`
--
ALTER TABLE `product_description`
  ADD CONSTRAINT `product_description_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_filter`
--
ALTER TABLE `product_filter`
  ADD CONSTRAINT `product_filter_ibfk_1` FOREIGN KEY (`filter_id`) REFERENCES `filter` (`filter_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_filter_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_option`
--
ALTER TABLE `product_option`
  ADD CONSTRAINT `product_option_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_special`
--
ALTER TABLE `product_special`
  ADD CONSTRAINT `product_special_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_wholesale`
--
ALTER TABLE `product_wholesale`
  ADD CONSTRAINT `product_wholesale_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
