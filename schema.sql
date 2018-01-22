DROP DATABASE IF EXISTS bamazonDB; -- Dropping the database and using productSeeds.sql to populate the data for now

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products (
    item_id INTEGER(7) NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    description VARCHAR(100) NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(10 , 2 ) NOT NULL DEFAULT 0.00,
    stock_quantity INTEGER NULL DEFAULT 0,
    PRIMARY KEY (item_id)
);