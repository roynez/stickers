-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 01, 2020 at 01:20 PM
-- Server version: 10.1.38-MariaDB
-- PHP Version: 7.3.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wa_sticker`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_admin`
--

CREATE TABLE `tbl_admin` (
  `id` int(11) NOT NULL,
  `admin_email` text NOT NULL,
  `admin_password` text NOT NULL,
  `admin_name` text NOT NULL,
  `created_date` datetime NOT NULL,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_admin`
--

INSERT INTO `tbl_admin` (`id`, `admin_email`, `admin_password`, `admin_name`, `created_date`, `updated_date`) VALUES
(1, 'admin@admin.com', 'admin', 'Admin', '2018-11-29 05:37:19', '2019-12-28 04:45:10');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_category`
--

CREATE TABLE `tbl_category` (
  `id` int(11) NOT NULL,
  `category_name` text NOT NULL,
  `category_image` text NOT NULL,
  `is_active` varchar(10) NOT NULL DEFAULT 'YES' COMMENT 'YES || NO',
  `created_date` datetime NOT NULL,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_category`
--

INSERT INTO `tbl_category` (`id`, `category_name`, `category_image`, `is_active`, `created_date`, `updated_date`) VALUES
(10, 'Food Fanzy', '10FoodFanzy_1345981832_20190131180118.png', 'YES', '2019-01-31 06:01:18', '2019-01-31 12:31:18'),
(11, 'Cartoon', '14_73836934_20200101173427.png', 'YES', '2019-02-28 03:28:30', '2020-01-01 12:04:27');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_slider`
--

CREATE TABLE `tbl_slider` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `slider_name` text NOT NULL,
  `slider_image` text NOT NULL,
  `is_active` varchar(10) NOT NULL DEFAULT 'YES' COMMENT 'YES || NO',
  `created_date` datetime NOT NULL,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_slider`
--

INSERT INTO `tbl_slider` (`id`, `category_id`, `slider_name`, `slider_image`, `is_active`, `created_date`, `updated_date`) VALUES
(1, 9, 'Bollywood', 'Bollywood_Slider_999693368_20190131175825.png', 'YES', '2019-01-31 05:58:25', '2019-01-31 12:28:25'),
(3, 10, 'Food Fanzy', 'Food_Fanzy_1877584279_20190131180150.jpg', 'YES', '2019-01-31 06:01:50', '2019-01-31 12:31:50');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_sticker_png`
--

CREATE TABLE `tbl_sticker_png` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `sub_cate_id` int(11) NOT NULL,
  `sticker_image` text NOT NULL,
  `created_date` datetime NOT NULL,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_sticker_png`
--

INSERT INTO `tbl_sticker_png` (`id`, `category_id`, `sub_cate_id`, `sticker_image`, `created_date`, `updated_date`) VALUES
(1, 11, 5, '1_268171456_20200101174706.png', '2020-01-01 05:47:06', '2020-01-01 12:17:06'),
(2, 11, 5, '2_1216338763_20200101174706.png', '2020-01-01 05:47:06', '2020-01-01 12:17:06'),
(3, 11, 5, '3_31534737_20200101174706.png', '2020-01-01 05:47:06', '2020-01-01 12:17:06'),
(4, 11, 5, '4_1748977107_20200101174706.png', '2020-01-01 05:47:06', '2020-01-01 12:17:06'),
(5, 11, 5, '5_1728752715_20200101174706.png', '2020-01-01 05:47:06', '2020-01-01 12:17:06'),
(6, 11, 5, '6_664661109_20200101174706.png', '2020-01-01 05:47:06', '2020-01-01 12:17:06'),
(7, 11, 5, '7_1762471698_20200101174706.png', '2020-01-01 05:47:06', '2020-01-01 12:17:06'),
(8, 11, 5, '8_451585405_20200101174706.png', '2020-01-01 05:47:06', '2020-01-01 12:17:06'),
(9, 11, 5, '9_1135639637_20200101174706.png', '2020-01-01 05:47:06', '2020-01-01 12:17:06'),
(10, 11, 5, '10_1383643925_20200101174706.png', '2020-01-01 05:47:06', '2020-01-01 12:17:06'),
(11, 10, 6, '1_683249994_20200101174724.png', '2020-01-01 05:47:24', '2020-01-01 12:17:24'),
(12, 10, 6, '2_105307105_20200101174724.png', '2020-01-01 05:47:24', '2020-01-01 12:17:24'),
(13, 10, 6, '3_1900834474_20200101174724.png', '2020-01-01 05:47:24', '2020-01-01 12:17:24'),
(14, 10, 6, '4_2144134016_20200101174724.png', '2020-01-01 05:47:24', '2020-01-01 12:17:24'),
(15, 10, 6, '5_1289880423_20200101174724.png', '2020-01-01 05:47:24', '2020-01-01 12:17:24'),
(16, 10, 6, '6_913992505_20200101174724.png', '2020-01-01 05:47:24', '2020-01-01 12:17:24'),
(17, 10, 6, '7_397668886_20200101174724.png', '2020-01-01 05:47:24', '2020-01-01 12:17:24'),
(18, 10, 6, '8_1521443073_20200101174724.png', '2020-01-01 05:47:24', '2020-01-01 12:17:25'),
(19, 10, 6, '9_437329998_20200101174724.png', '2020-01-01 05:47:24', '2020-01-01 12:17:25'),
(20, 10, 6, '10_1733649361_20200101174724.png', '2020-01-01 05:47:24', '2020-01-01 12:17:25');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_sticker_webp`
--

CREATE TABLE `tbl_sticker_webp` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `sub_cate_id` int(11) NOT NULL,
  `sticker_image` text NOT NULL,
  `created_date` datetime NOT NULL,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_sticker_webp`
--

INSERT INTO `tbl_sticker_webp` (`id`, `category_id`, `sub_cate_id`, `sticker_image`, `created_date`, `updated_date`) VALUES
(1, 11, 5, '1_450230281_20200101174749.webp', '2020-01-01 05:47:49', '2020-01-01 12:17:49'),
(2, 11, 5, '2_1576894533_20200101174749.webp', '2020-01-01 05:47:49', '2020-01-01 12:17:49'),
(3, 11, 5, '3_611702955_20200101174749.webp', '2020-01-01 05:47:49', '2020-01-01 12:17:50'),
(4, 11, 5, '4_598731747_20200101174749.webp', '2020-01-01 05:47:49', '2020-01-01 12:17:50'),
(5, 11, 5, '5_1347862921_20200101174749.webp', '2020-01-01 05:47:49', '2020-01-01 12:17:50'),
(6, 11, 5, '6_495497278_20200101174749.webp', '2020-01-01 05:47:49', '2020-01-01 12:17:50'),
(7, 11, 5, '7_1693860761_20200101174749.webp', '2020-01-01 05:47:49', '2020-01-01 12:17:50'),
(8, 11, 5, '8_1734643209_20200101174749.webp', '2020-01-01 05:47:49', '2020-01-01 12:17:50'),
(9, 11, 5, '9_443743683_20200101174749.webp', '2020-01-01 05:47:49', '2020-01-01 12:17:50'),
(10, 11, 5, '10_1203869187_20200101174749.webp', '2020-01-01 05:47:49', '2020-01-01 12:17:50'),
(11, 10, 6, '1_1639393283_20200101174805.webp', '2020-01-01 05:48:05', '2020-01-01 12:18:05'),
(12, 10, 6, '2_520210081_20200101174805.webp', '2020-01-01 05:48:05', '2020-01-01 12:18:05'),
(13, 10, 6, '3_1417425499_20200101174805.webp', '2020-01-01 05:48:05', '2020-01-01 12:18:05'),
(14, 10, 6, '4_1655708072_20200101174805.webp', '2020-01-01 05:48:05', '2020-01-01 12:18:05'),
(15, 10, 6, '5_1685134275_20200101174805.webp', '2020-01-01 05:48:05', '2020-01-01 12:18:05'),
(16, 10, 6, '6_1197916045_20200101174805.webp', '2020-01-01 05:48:05', '2020-01-01 12:18:05'),
(17, 10, 6, '7_1549344503_20200101174805.webp', '2020-01-01 05:48:05', '2020-01-01 12:18:05'),
(18, 10, 6, '8_1115143775_20200101174805.webp', '2020-01-01 05:48:05', '2020-01-01 12:18:05'),
(19, 10, 6, '9_539494626_20200101174805.webp', '2020-01-01 05:48:05', '2020-01-01 12:18:05'),
(20, 10, 6, '10_1287779801_20200101174805.webp', '2020-01-01 05:48:05', '2020-01-01 12:18:05');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_sub_category`
--

CREATE TABLE `tbl_sub_category` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `sub_cate_name` text NOT NULL,
  `sub_cate_image` text NOT NULL,
  `sub_cate_tray_image` text NOT NULL,
  `is_active` varchar(10) NOT NULL DEFAULT 'YES' COMMENT 'YES || NO',
  `created_date` datetime NOT NULL,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_sub_category`
--

INSERT INTO `tbl_sub_category` (`id`, `category_id`, `sub_cate_name`, `sub_cate_image`, `sub_cate_tray_image`, `is_active`, `created_date`, `updated_date`) VALUES
(5, 11, 'Panda', 'panda_613142135_20191228102658.png', 'panda_685473773_20191228102658.png', 'YES', '2019-12-28 10:26:58', '2019-12-28 04:56:58'),
(6, 10, 'Burger', 'burger_688449215_20191228102746.png', 'burger_1533429249_20191228102746.png', 'YES', '2019-12-28 10:27:46', '2019-12-28 04:57:46');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_admin`
--
ALTER TABLE `tbl_admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_category`
--
ALTER TABLE `tbl_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_slider`
--
ALTER TABLE `tbl_slider`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_sticker_png`
--
ALTER TABLE `tbl_sticker_png`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_sticker_webp`
--
ALTER TABLE `tbl_sticker_webp`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_sub_category`
--
ALTER TABLE `tbl_sub_category`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_admin`
--
ALTER TABLE `tbl_admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_category`
--
ALTER TABLE `tbl_category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tbl_slider`
--
ALTER TABLE `tbl_slider`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_sticker_png`
--
ALTER TABLE `tbl_sticker_png`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `tbl_sticker_webp`
--
ALTER TABLE `tbl_sticker_webp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `tbl_sub_category`
--
ALTER TABLE `tbl_sub_category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
