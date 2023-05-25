CREATE DATABASE  IF NOT EXISTS `balek`;
USE `balek`;
 SET NAMES utf8 ;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `users` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `userKey` varchar(64) NOT NULL,
  `name` varchar(45) NOT NULL,
  `password` varchar(128) DEFAULT NULL,
  `icon` blob,
  `permission_groups` blob DEFAULT "[]",
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `userKey_UNIQUE` (`userKey`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
