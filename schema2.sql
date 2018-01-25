DROP DATABASE IF EXISTS bamazonDB; -- Dropping the database and using productSeeds.sql to populate the data for now

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products (
    item_id INTEGER(7) NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    description VARCHAR(100) NULL,
    price DECIMAL(10 , 2) NOT NULL,
    stock_quantity INTEGER NULL DEFAULT 0,
    product_sales DECIMAL(20 , 2) NULL DEFAULT 0.00,
    department_id INTEGER(7),
    PRIMARY KEY (item_id),
    FOREIGN KEY (department_id)
);

CREATE TABLE departments (
    department_id INTEGER(7) NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(50) NOT NULL,
    over_head_costs DECIMAL(20, 2) NULL DEFAULT 0.00,
    PRIMARY KEY (department_id)
);