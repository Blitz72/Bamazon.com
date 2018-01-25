require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys.js");
var Table = require("cli-table");

var table = new Table({
    head: ['ID', 'Department', 'Overhead Costs', 'Sales', 'Total Profit']
  , colWidths: [10, 30, 20, 20, 20]
});

// create the connection information for the sql database
var connection = mysql.createConnection(
	keys.mysqlKeys
);

var depts = [];  //might need module "promise-mysql"

function listDepartments() {
	// depts = [];  //Start with an empty array so "All Departments" can be added to the end
  connection.query("SELECT department_name FROM departments", function(err, res) {
    if (err) throw err;
    // console.log("res.length: ", res.length);
    for (var i = 0; i < res.length; i++) {
      // console.log(res[i].department_name)
      depts.push(res[i].department_name);
    }
    // depts.push("All Departments");
    // console.log("depts: ", depts);
  });
  // console.log("depts: ", depts);
}

function mainMenu() {
  inquirer
  .prompt([
    {
      type: "list",
      message: "What would you like to do?",
      choices: ["View Product Sales by Department", "Create New Department", "Exit"],
      name: "menuChoice"
    }
  ])
  .then(function(inquirerResponse) {
    switch (inquirerResponse.menuChoice) {
      case "View Product Sales by Department":
        viewSales();
        break;
      case "Create New Department":
        newDepartment();
        break;
      case "Exit":
        if (connection) connection.end();
        console.log("\nConnection to database terminated.");
        return;
    }
  });
}

function viewSales() {
  connection.query('SELECT departments.department_id AS ID, departments.department_name ' +
                      'AS Department, departments.over_head_costs AS "Overhead Costs", ' +
                      'SUM(products.product_sales) AS Sales FROM departments, products ' +
                      'WHERE departments.department_name = products.department_name ' +
                      'GROUP BY Department ORDER BY (ID);', function(err, res) {
    if (err) throw err;
    // console.log(res);
    renderSales(res);
    mainMenu();
  });   
}

function newDepartment() {
	inquirer
	.prompt([
		{
      type: "input",
      message: "Enter the name of the new department: ",
      name: "departmentName"
    },
    {
      type: "input",
      message: "Enter in the overhead costs for the department: ",
      name: "costs",
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
      type: "confirm",
      message: "Are you sure you want to add this new product?: ",
      name: "confirm",
      default: false
    }
	])
	.then(function(inquirerResponse) {
		if (inquirerResponse.confirm) {
			connection.query("INSERT INTO departments (department_name, over_head_costs) VALUES (" +
											"'" + inquirerResponse.departmentName + "', " +
											"'" + inquirerResponse.costs + "');",
			function(err, res) {
				if (err) throw err;
				console.log("\nNew department added!\n");
				listDepartments();
				mainMenu();
			});
		} else {
			console.log("\nDepartment has not been created.\n");
			mainMenu();
		}
	});
}

function renderSales(data) {
  for (var i = 0; i < data.length; i++) {
    var profit = data[i].Sales.toFixed(2) - data[i]["Overhead Costs"].toFixed(2);
    table.push([data[i].ID, data[i].Department, data[i]["Overhead Costs"], data[i].Sales.toFixed(2), profit.toFixed(2)]);
    // console.log("ID: " + data[i].ID + " | Department: " + data[i].Department + " | Overhead Costs: " +
                // data[i]["Overhead Costs"] + " | Sales: " + data[i].Sales.toFixed(2) + " | Total Profit: " + profit.toFixed(2));
  }
  console.log(table.toString());
}

listDepartments();  //Run listDepartments to populate the choices for departments before mainMenu
mainMenu();