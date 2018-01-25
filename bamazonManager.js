require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys.js");

// create the connection information for the sql database
var connection = mysql.createConnection(
	keys.mysqlKeys
);

var depts = [];  //might need module "promise-mysql"
                  //UPDATE: Running listDepartments() before mainMenu() seems to work
var prods = [];

function listDepartments() {
  connection.query("SELECT department_name FROM departments", function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      // console.log(res[i].department_name)
      depts.push(res[i].department_name);
    }
    // console.log("depts: ", depts);
  });
  // console.log("depts: ", depts);
}

function listProductIds() {
  connection.query("SELECT item_id FROM products", function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      // console.log(res[i].department_name)
      prods.push(res[i].item_id);
    }
    // console.log("depts: ", depts);
  });
  // console.log("depts: ", depts);
}

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
      name: "productID",
      validate: function(input) {
        var done = this.async();
        if (prods.indexOf(parseInt(input)) < 0) {
          done("Please enter a valid product ID.");
          return;
        }
        done(null, true);
      }
    },
    {
      type: "input",
      message: "Enter the quantity of the item you would like to add to inventory: ",
      name: "quantity",
      validate: function(input) {
        var done = this.async();
        input = parseInt(input);
        if (input !== parseInt(input, 10)) {
          done("Please enter a valid quantity.");
          return;
        }
        done(null, true);
      }
    }
	])
	.then(function(inquirerResponse) {
		connection.query("SELECT * FROM products WHERE item_id = " + parseInt(inquirerResponse.productID), function(err, res) {
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
      console.log("\n" + quantityAdded + " item(s) add to stock for " + productName + ".\n");
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
      type: "list",
      message: "Enter the department for the new product: ",
      choices: depts,
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
    {
      type: "confirm",
      message: "Are you sure you want to add this new product?: ",
      name: "confirm",
      default: false
    }
	])
	.then(function(inquirerResponse) {
		if (inquirerResponse.confirm) {
			connection.query("INSERT INTO products (product_name, description, department_name, price, stock_quantity) VALUES (" +
											"'" + inquirerResponse.productName + "', " +
											"'" + inquirerResponse.description + "', " +
											"'" + inquirerResponse.department + "', " +
											"'" + inquirerResponse.price + "', " +
											"'" + inquirerResponse.quantity + "');",
			function(err, res) {
				if (err) throw err;
				console.log("\nNew product added!\n");
				mainMenu();
			});
		} else {
			console.log("\nProduct has not been added.\n");
			mainMenu();
		}
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

listProductIds();
listDepartments();  //Run listDepartments to populate the choices for departments before mainMenu
mainMenu();