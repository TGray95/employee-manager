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
            choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role or manager", "Exit application"],
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
          if (answers.mainMenu === "Update an employee role or manager") {
            updateEmployee();
          }
          if (answers.mainMenu === "Exit application") {
            process.exit();
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
    
    var questions = [
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
    ]
    inquirer.prompt(questions)
    .then((answers) => {
        con.query(`SELECT id FROM department WHERE name = '${answers.roleDepartment}'`, (err, results) => {
            con.query(`
            INSERT INTO role (title, salary, department_id)
            VALUES ('${answers.roleTitle}', '${answers.roleSalary}', '${results[0].id}')`);
            console.log(`Created new role '${answers.roleTitle}' in ${answers.roleDepartment}`)
    });

    setTimeout(() => {
        mainMenu();
    }, 1000);
        });
        
});

}

function addEmployee() {

    var questions = [
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
        const arr = results.map(object => object.title);
        questions.push({
            type: 'list',
            name: 'role',
            message: "Select employee's role",
            choices: arr
        });
    });

    con.query(`SELECT CONCAT(last_name, ", ", first_name) AS manager FROM employee WHERE manager_id IS NULL`, (err, results) => {
        const arr = results.map(object => object.manager);
        questions.push({ 
            type: 'list',
            name: 'manager',
            message: "Select employee's manager",
            choices: arr
        });
    });

    setTimeout(() => {
        inquirer.prompt(questions).then((answers) => {
            const managerFirst = answers.manager.split(',')[1].trim();
            const managerLast = answers.manager.split(',')[0].trim();
            con.query(`SELECT id FROM employee WHERE first_name = '${managerFirst}' AND last_name = '${managerLast}'`, (err, result) => {
            const managerID = result[0].id;
            con.query(`SELECT id FROM role WHERE title = '${answers.role}'`, (err, results) => {
                con.query(`
                INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ('${answers.firstName}', '${answers.lastName}', '${results[0].id}', '${managerID}' )`);
                console.log(`Successfully added new employee ${answers.firstName + ' ' + answers.lastName}`)
            })
        setTimeout(() => {
        mainMenu();
        }, 1000);
        });
            });
            
    }, 1000);
        
}

function updateEmployee() {
    inquirer.prompt(
        {
            type: 'list',
            name: 'userChoice',
            message: 'What would you like to do?',
            choices: ['Update employee role', 'Update employee manager']
        }
    )
    .then((answers) => {
        if (answers.userChoice === 'Update employee role') {
            updateRole();
        } else updateManager();
    })
}

function updateRole() {

    const questions = [];
    con.query(`SELECT CONCAT(last_name, ", ", first_name) AS e FROM employee`, (err, results) => {
        const arr = results.map(object => object.e);
        questions.push({
            type:"list",
            name:"employee",
            message:"Choose employee whose role you'd like to update",
            choices: arr
        })
    })

    con.query(`SELECT title FROM role`, (err, results) => {
        const arr = results.map(object => object.title)
        questions.push({
            type:"list",
            name:"role",
            message:"Choose new role for chosen employee",
            choices: arr

        })
    })
    setTimeout(() => {
        inquirer.prompt(questions)
        .then((answers) => {
            const employeeFirst = answers.employee.split(',')[1].trim();
            const employeeLast = answers.employee.split(',')[0].trim();
            con.query(`SELECT id FROM role WHERE title = '${answers.role}'`, (err, results) => {
                const roleID = results[0].id;
            con.query(`UPDATE employee SET role_id = ${roleID} WHERE first_name = '${employeeFirst}' AND last_name = '${employeeLast}'`)
            console.log("Successfully updated ",answers.employee,"'s role to ",answers.role)
            })
            setTimeout(() => {
                mainMenu();
                }, 1000);
        })
    }, 1000);
}

function updateManager() {
    const questions = [];
    
    con.query(`SELECT CONCAT(last_name, ", ", first_name) AS e FROM employee`, (err, results) => {
        const arr = results.map(object => object.e)
        questions.push({
            type:"list",
            name:"employee",
            message:"Choose employee whose manager you'd like to update",
            choices: arr
        })
    })

    con.query(`SELECT CONCAT(last_name, ", ", first_name) AS m FROM employee WHERE manager_id IS NULL`, (err, results) => {
        const arr = results.map(object => object.m);
        questions.push({
            type:"list",
            name:"manager",
            message:"Choose new manager for employee",
            choices: arr
        })
    })
    
    setTimeout(() => {
     inquirer.prompt(questions)
        .then((answers) => {
            const employeeFirst = answers.employee.split(',')[1].trim();
            const employeeLast = answers.employee.split(',')[0].trim();
            const managerFirst = answers.manager.split(',')[1].trim();
            const managerLast = answers.manager.split(',')[0].trim();
            con.query(`SELECT id FROM employee WHERE first_name = '${managerFirst}' AND last_name = '${managerLast}'`, (err, result) => {
                const managerID = result[0].id;
                con.query(`UPDATE employee SET manager_id = '${managerID}' WHERE first_name = '${employeeFirst}' AND last_name = '${employeeLast}'`)
                console.log("Successfully updated ",answers.employee,"'s manager to ",answers.manager)
            })
            setTimeout(() => {
                mainMenu();
                }, 1000);
        })
    }, 1000);
}

mainMenu();