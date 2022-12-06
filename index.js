const inquirer = require("inquirer");
const consoleTable = require("console.table");
const mysql = require('mysql2');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "pass123",
    database: "employees_db"
  });
  
  con.connect(function(err) {
    if (err) throw err;
   });

function mainMenu() {
      inquirer
        .prompt([
          {
            type: "list",
            name: "mainMenu",
            message: "What would you like to do?",
            choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role"],
          }
        ])
        .then((answers) => {
          if (answers.mainMenu === "View all departments") {
            viewDepartments();
          }
          if (answers.mainMenu === "View all roles") {
            viewRoles();
          }
          if (answers.mainMenu === "View all employees") {
            viewEmployees();
          }
          if (answers.mainMenu === "Add a department") {
            addDepartment();
          }
          if (answers.mainMenu === "Add a role") {
            addRole();
          }
          if (answers.mainMenu === "Add an employee") {
            addEmployee();
          }
          if (answers.mainMenu === "Update an employee role") {
            updateRole();
          }
        });
}

function viewDepartments() { 
    con.query('SELECT * FROM `department`',
    (err, results) => {
        if (err) throw err;
        console.table(results);
        })
        setTimeout(() => {
            mainMenu();
        }, 1000);
}

function viewRoles() {
    con.query(
        `SELECT r.id,
        r.title,
        r.salary,
        d.name AS department
        FROM role r
        INNER JOIN department d ON r.department_id = d.id
        ORDER BY id`,
    (err, results) => {
        if (err) throw err;
        console.table(results);
        })
        setTimeout(() => {
            mainMenu();
        }, 1000);
}

function viewEmployees() {
    con.query(`SELECT 
    e.id,
    CONCAT(e.last_name, ", ",e.first_name) AS name, 
    r.title, 
    r.salary,
    CONCAT(m.last_name, ", ",m.first_name) AS manager,
    d.name AS department
    FROM employee e
    INNER JOIN role r ON r.id = e.role_id
    INNER JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON m.id = e.manager_id
    ORDER BY e.last_name`,
    (err, results) => {
        if (err) throw err;
        console.table(results);
        })
        setTimeout(() => {
            mainMenu();
        }, 1000);
}

function addDepartment() {
    inquirer
    .prompt([
        {
            type: 'input',
            name: "departmentName",
            message: "Enter name of new department",
            validate: async(input) => {
                if (input !== "") return true;
                else return "Please enter name of new department";
            }
        }
    ])
    .then((answers) => {
        con.query(
            `INSERT INTO department (name)
            VALUES ('${answers.departmentName}')`);
    })
    setTimeout(() => {
        mainMenu();
    }, 1000);
}

function addRole() {

    con.query(
        `SELECT name FROM department`,
       (err, results) => {
    inquirer
    .prompt([
        {
            type: 'input',
            name: 'roleTitle',
            message: 'Enter title of new role',
            validate: async(input) => {
                if (input !== "") return true;
                else return "Enter name of new department";
            }
        },
        {
            type: 'input',
            name: 'roleSalary',
            message: 'Enter salary for new role',
            validate: async(input) => {
                if (input !== "") return true;
                else return "Please enter name of new department";
        }
        },
        {
            type: 'list',
            name: 'roleDepartment',
            message: 'Enter department of new role',
            choices: results
        }
    ])
    .then((answers) => {
        con.query(`SELECT id FROM department WHERE name = '${answers.roleDepartment}'`, (err, results) => {
            con.query(`
            INSERT INTO role (title, salary, department_id)
            VALUES ('${answers.roleTitle}', '${answers.roleSalary}', '${results[0].id}')`);
    });
        });
        
});


mainMenu();
}

function addEmployee() {

    let questions = [
        {
            type: 'input',
            name: 'firstName',
            message: "Enter employee's first name",
            validate: async(input) => {
                if (input !== "") return true;
                else return "Enter employee's first name";
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: "Enter employee's last name",
            validate: async(input) => {
                if (input !== "") return true;
                else return "Enter employee's last name";
        },
        }
    ]
    
    con.query(`SELECT title FROM role`, (err, results) => {
        questions.push({
            type: 'list',
            name: 'role',
            message: "Select employee's role",
            choices: results
        });
        return questions;
    });
    con.query(`SELECT CONCAT(last_name, ", ", first_name) AS manager FROM employee WHERE manager_id IS NOT NULL`, (err, results) => {
        questions.push({ 
            type: 'list',
            name: 'manager',
            message: "Select employee's manager",
            choices: results
        });
        console.log(questions)
        return questions;
    });
    console.log('final:::', questions)
    inquirer.prompt(questions)
    .then((answers) => {
        con.query(`SELECT id FROM department WHERE name = '${answers.roleDepartment}'`, (err, results) => {
            con.query(`
            INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES ('${answers.firstName}', '${answers.lastName}', '')`);
    });
        });
        




}
mainMenu();