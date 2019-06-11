require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys.js");
var Table = require("cli-table");

var table = new Table({
  head: ['ID', 'Product', 'Description', 'Price', 'Quantity', 'Department'],
  colWidths: [5, 20, 50, 8, 8, 15]
});

// create the connection information for the sql database
var connection = mysql.createConnection(
  keys.mysqlKeys
);

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  console.log('connected as id ' + connection.threadId);
});
// console.log(connection);

// var departments = ["Toys/Hobbies", "Electronics", "Outdoors", "Men's Clothing", "Women's Clothing",
//                     "Industrial/Scientific", "Kindling Books"];

var depts = [];  //might need module "promise-mysql"
var prods = [];

function listDepartments() {
  connection.query("SELECT department_name FROM departments", function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].department_name)
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
  });
  console.log("Product ID's: ", prods);
}

function mainMenu() {
  // console.log("prods: ", prods);
  // console.log("departmentsMainMenu: ", depts);
  inquirer
  .prompt([
  {
    type: "list",
    message: "What would you like to do today at bamazon.com?",
    choices: ["View all products", "Search by department", "Search by keyword", "Search by price range", "Exit"],
    name: "menuChoice"
  }
  ])
  .then(function(inquirerResponse) {
    switch (inquirerResponse.menuChoice) {
      case "View all products":
      viewAll();
      break;
      case "Search by department":
      searchDepartment();
      break;
      case "Search by keyword":
      searchKeyword();
      break;
      case "Search by price range":
      searchPriceRange();
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
    // console.log(res);
    mainOrBuy();
  });
}

function searchDepartment() {
  inquirer
  .prompt([
  {
    type: "list",
    message: "In which department would you like to search?",
    choices: depts,
    name: "departmentChoice"
  }
  ])
  .then(function(inquirerResponse) {
    connection.query('SELECT * FROM products WHERE department_name = "' + 
      inquirerResponse.departmentChoice + '"', function(err, res) {
        if (err) throw err;
        renderProducts(res);
        mainOrBuy();
      });   
  });
}

function searchKeyword() {
  inquirer
  .prompt([
  {
    type: "input",
    message: "Enter keyword to search with: ",
    name: "keyword"
  }
  ])
  .then(function(inquirerResponse) {
    connection.query("SELECT * FROM products WHERE product_name LIKE '%" + 
      inquirerResponse.keyword + "%' OR description LIKE '%" + 
      inquirerResponse.keyword + "%'", function(err, res) {
        if (err) throw err;
        if (!res[0]) console.log("\nNo products matched your search criteria.\n");
        else renderProducts(res);
        mainOrBuy();
      });  
  });
}

function searchPriceRange() {
  inquirer
  .prompt([
  {
    type: "input",
    message: "Enter the lowest price to search with: ",
    name: "lowPrice",
    validate: function(input) {
      var done = this.async();
      input = parseInt(input);
      if (input !== parseFloat(input, 10)) {
        done("Please enter a valid number.");
        return;
      }
      done(null, true);
    }
  },
  {
    type: "input",
    message: "Enter the highest price to search with: ",
    name: "highPrice",
    validate: function(input) {
      var done = this.async();
      input = parseInt(input);
      if (input !== parseFloat(input, 10)) {
        done("Please enter a valid number.");
        return;
      }
      done(null, true);
    }
  }
  ])
  .then(function(inquirerResponsse) {
    var low = inquirerResponsse.lowPrice;
    var high = inquirerResponsse.highPrice;
    connection.query("SELECT * FROM products WHERE price BETWEEN " + low + " AND " + high, function(err, res) {
      if (err) throw err;
      if (!res[0]) console.log("\nNo products matched your search criteria.\n");
      else renderProducts(res);
      mainOrBuy();
    });
    
  });
}

function mainOrBuy() {
  inquirer
  .prompt([
  {
    type: "list",
    message: "What would you like to do now?",
    choices: ["Buy an item", "Return to main menu"],
    name: "menuChoice"
  }
  ])
  .then(function(inquirerResponse) {
    switch (inquirerResponse.menuChoice) {
      case "Buy an item":
      buyProduct();
      break;
      case "Return to main menu":
      mainMenu();
      break;
    }
  });
}

function buyProduct() {
  inquirer
  .prompt([
  {
    type: "input",
    message: "Enter the id of the product you would like to purchase: ",
    name: "productID",
    validate: function(input) {
      var done = this.async();
      console.log("\ninput: ", input);
      if (prods.indexOf(parseInt(input)) < 0) {
        done("Please enter a valid product ID.");
        return;
      }
      done(null, true);
    }
  },
  {
    type: "input",
    message: "Enter the quantity of the item you would like to purchase: ",
    name: "quantity"
  }
  ])
  .then(function(inquirerResponse){
    connection.query("SELECT * FROM products WHERE item_id = " + inquirerResponse.productID, function(err, res) {
      // console.log(res);
      console.log("\nSupplier stock: ", res[0].stock_quantity);
      console.log("Quantity requested: ", inquirerResponse.quantity + "\n");
      if (err) throw err;
      if (parseInt(res[0].stock_quantity) >= parseInt(inquirerResponse.quantity)) {
        var newQuantity = res[0].stock_quantity - inquirerResponse.quantity;
        console.log("Your purchase for " + inquirerResponse.quantity + " " + res[0].product_name + "(s) is being filled.");
        var sale = res[0].price.toFixed(2) * parseInt(inquirerResponse.quantity);
        console.log("One click ordering has charged your card for $" + sale.toFixed(2));
        updateProduct(newQuantity, inquirerResponse.productID, res[0].product_name);
        var newSale = res[0].product_sales + sale;
        updateSales(newSale, inquirerResponse.productID, res[0].product_name);
      } else {
        console.log("Insufficient Quantity.\n");
        mainOrBuy();
      }
    });
  });
}

function updateProduct(newQuantity, productID, productName) {
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
      console.log("\nQuantity updated for " + productName + ".\n");
      // mainOrBuy();
    }
    );
}

function updateSales(sale, productID, productName) {
  connection.query(
    "UPDATE products SET ? WHERE ?",
    [
    {
      product_sales: sale
    },
    {
      item_id: productID
    }
    ],
    function(err, res) {
      if (err) throw err;
      console.log("Product sales updated for " + productName + ".\n");
      mainOrBuy();
    }
    );
}

function renderProducts(data) {
  var table = new Table({
    head: ['ID', 'Product', 'Description', 'Price', 'Quantity', 'Department'],
    colWidths: [8, 30, 55, 13, 8, 23]
  });
  for (var i = 0; i < data.length; i++) {
    var price = "$" + data[i].price.toFixed(2);
    table.push([data[i].item_id, data[i].product_name, data[i].description, price,
      data[i].stock_quantity, data[i].department_name]);
  }
  console.log(table.toString());
  // console.log(data);
}

listProductIds();
listDepartments();  //Run listDepartments to populate the choices for departments before mainMenu
mainMenu();