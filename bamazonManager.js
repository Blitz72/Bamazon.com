require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys.js");

// create the connection information for the sql database
var connection = mysql.createConnection(
	keys.mysqlKeys
);

function mainMenu() {
  inquirer
  .prompt([
    {
      type: "list",
      message: "What would you like to manage?",
      choices: ["View all products", "View low inventory", "Add to inventory", "Add new product", "Exit"],
      name: "menuChoice"
    }
  ])
  .then(function(inquirerResponse) {
    switch (inquirerResponse.menuChoice) {
      case "View all products":
        viewAll();
        break;
      case "View low inventory":
        viewLowInventory();
        break;
      case "Add to inventory":
        addInventory();
        break;
      case "Add new product":
        addNewProduct();
        break;
      case "Exit":
        if (connection) connection.end();
        console.log("\nConnection to database terminated.");
        return;
    }
  });
}

function viewAll() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    renderProducts(res);
    mainMenu();
  });
}

function viewLowInventory() {
	connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function(err, res) {
    if (err) throw err;
    renderProducts(res);
    mainMenu();
  });
}

function addInventory() {
	inquirer
	.prompt([
		{
      type: "input",
      message: "Enter the id of the product you would like to add to inventory: ",
      name: "productID"
    },
    {
      type: "input",
      message: "Enter the quantity of the item you would like to add to inventory: ",
      name: "quantity"
    }
	])
	.then(function(inquirerResponse) {
		connection.query("SELECT * FROM products WHERE item_id = " + inquirerResponse.productID, function(err, res) {
			var newQuantity = parseInt(res[0].stock_quantity) + parseInt(inquirerResponse.quantity);
			updateProduct(newQuantity, inquirerResponse.quantity, inquirerResponse.productID, res[0].product_name);
	  });
	});
}

function updateProduct(newQuantity, quantityAdded, productID, productName) {
  connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: newQuantity
      },
      {
        item_id: productID
      }
    ],
    function(err, res) {
      if (err) throw err;
      console.log("\n" + quantityAdded + " items add to stock for " + productName + ".\n");
      mainMenu();
    }
  );
}

function addNewProduct() {
	inquirer
	.prompt([
		{
      type: "input",
      message: "Enter the name of the new product: ",
      name: "productName"
    },
    {
      type: "input",
      message: "Enter a short description of the new product: ",
      name: "description"
    },
    {
      type: "input",
      message: "Enter the department for the new product: ",
      name: "department"
    },
    {
      type: "input",
      message: "Enter the price of the new product: ",
      name: "price"
    },
    {
      type: "input",
      message: "Enter the initial quantity of the new product: ",
      name: "quantity"
    },
	])
	.then(function(inquirerResponse) {
		connection.query("INSERT INTO products (product_name, description, department_name, price, stock_quantity) VALUES (" +
											"'" + inquirerResponse.productName + "', " +
											"'" + inquirerResponse.description + "', " +
											"'" + inquirerResponse.department + "', " +
											"'" + inquirerResponse.price + "', " +
											"'" + inquirerResponse.quantity + "');");
		console.log("\nNew product added!\n");
		mainMenu();
	});
}

function renderProducts(data) {
  for (var i = 0; i < data.length; i++) {
    console.log("\nID: " + data[i].item_id + ": " + data[i].product_name + ", Price: $" +
                  data[i].price.toFixed(2) + ", Quantity: " + data[i].stock_quantity);
    console.log("  -Description: " + data[i].description);
    console.log("  -Found in " + data[i].department_name);
  }
  console.log("\n");
}

//Start the app ath the main menu
mainMenu();
