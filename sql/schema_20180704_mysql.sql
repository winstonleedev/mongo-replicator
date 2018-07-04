-- Valentina Studio --
-- MySQL dump --
-- ---------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
-- ---------------------------------------------------------


-- CREATE DATABASE "testtp" --------------------------------
CREATE DATABASE IF NOT EXISTS `testtp` CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `testtp`;
-- ---------------------------------------------------------


-- CREATE TABLE "label_sensor" -----------------------------
-- CREATE TABLE "label_sensor" ---------------------------------
CREATE TABLE `label_sensor` (
	`mongo_id_label` Text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
	`id_label_sensor` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`id_sensor` Int( 11 ) NOT NULL,
	PRIMARY KEY ( `id_label_sensor` ) )
CHARACTER SET = utf8
COLLATE = utf8_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 1;
-- -------------------------------------------------------------
-- ---------------------------------------------------------


-- CREATE TABLE "sensors" ----------------------------------
-- CREATE TABLE "sensors" --------------------------------------
CREATE TABLE `sensors` (
	`id_sensor` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`mongo_id_sensor` Text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
	`is_number` Bit( 1 ) NOT NULL,
	PRIMARY KEY ( `id_sensor` ) )
CHARACTER SET = utf8
COLLATE = utf8_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 2;
-- -------------------------------------------------------------
-- ---------------------------------------------------------


-- CREATE TABLE "series_number" ----------------------------
-- CREATE TABLE "series_number" --------------------------------
CREATE TABLE `series_number` (
	`id` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`time` Timestamp NOT NULL DEFAULT 'current_timestamp()',
	`value` Int( 11 ) NOT NULL,
	`id_sensor` Int( 11 ) NOT NULL,
	PRIMARY KEY ( `id` ) )
CHARACTER SET = utf8
COLLATE = utf8_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 1;
-- -------------------------------------------------------------
-- ---------------------------------------------------------


-- CREATE TABLE "series_string" ----------------------------
-- CREATE TABLE "series_string" --------------------------------
CREATE TABLE `series_string` (
	`id` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`time` Timestamp NOT NULL DEFAULT 'current_timestamp()',
	`value` VarChar( 255 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
	`id_sensor` Int( 11 ) NOT NULL,
	PRIMARY KEY ( `id` ) )
CHARACTER SET = utf8
COLLATE = utf8_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 2;
-- -------------------------------------------------------------
-- ---------------------------------------------------------


-- CREATE TABLE "thing_sensor" -----------------------------
-- CREATE TABLE "thing_sensor" ---------------------------------
CREATE TABLE `thing_sensor` (
	`mongo_id_thing` Text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
	`id_thing_sensor` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`id_sensor` Int( 11 ) NOT NULL,
	PRIMARY KEY ( `id_thing_sensor` ) )
CHARACTER SET = utf8
COLLATE = utf8_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 28069;
-- -------------------------------------------------------------
-- ---------------------------------------------------------


-- CREATE FUNCTION "exist_sensor" --------------------------

delimiter $$$
-- CREATE FUNCTION "exist_sensor" ------------------------------
CREATE DEFINER=`thingplus`@`%` FUNCTION `exist_sensor`(in_mongo_id_sensor VARCHAR(200), in_is_number BIT) RETURNS int(11)
BEGIN
    declare _id_sensor INTEGER;
    SELECT id_sensor INTO _id_sensor FROM sensors WHERE sensors.mongo_id_sensor = in_mongo_id_sensor AND sensors.is_number = in_is_number;
    IF (_id_sensor IS NULL) THEN
        INSERT INTO sensors(mongo_id_sensor, is_number) VALUES (in_mongo_id_sensor, in_is_number);
        SET _id_sensor = last_insert_id();
    END IF;
    RETURN _id_sensor;
END;
-- -------------------------------------------------------------

$$$ delimiter ;
-- ---------------------------------------------------------


-- CREATE FUNCTION "insert_value_number" -------------------

delimiter $$$
-- CREATE FUNCTION "insert_value_number" -----------------------
CREATE DEFINER=`thingplus`@`%` FUNCTION `insert_value_number`(  `mongo_id_sensor` VarChar(200),  `in_time` Timestamp,  `in_value` VarChar(500) ) RETURNS int(11)
BEGIN
    declare _id_sensor INTEGER;
    SET _id_sensor = exist_sensor(mongo_id_sensor, 1);
    INSERT INTO series_number(id_sensor, `time`, `value`) VALUES (_id_sensor, in_time, in_value);
    RETURN last_insert_id();
END;
-- -------------------------------------------------------------

$$$ delimiter ;
-- ---------------------------------------------------------


-- CREATE FUNCTION "insert_value_string" -------------------

delimiter $$$
-- CREATE FUNCTION "insert_value_string" -----------------------
CREATE DEFINER=`thingplus`@`%` FUNCTION `insert_value_string`(  `mongo_id_sensor` VarChar(200),  `in_time` Timestamp,  `in_value` VarChar(500) ) RETURNS int(11)
BEGIN
    declare _id_sensor INTEGER;
    SET _id_sensor = exist_sensor(mongo_id_sensor, 0);
    INSERT INTO series_string(id_sensor, `time`, `value`) VALUES (_id_sensor, in_time, in_value);
    RETURN last_insert_id();
END;
-- -------------------------------------------------------------

$$$ delimiter ;
-- ---------------------------------------------------------


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
-- ---------------------------------------------------------


