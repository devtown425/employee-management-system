const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const util = require('util');

const connection = new mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employeedb"
});

connection.queryPromise = util.promisify(connection.query);

function init() {
    inquirer.prompt({
        type: 'list',
        message: 'What do you want to do?',
        choices: [
            'ADD_EMPLOYEE',
            'ADD_ROLE',
            'ADD_DEPARTMENT',
            'UPDATE_EMPLOYEE_ROLE',
            'VIEW_DEPARTMENT',
            'VIEW_ROLE',
            'VIEW_EMPLOYEE',
            'END'
        ],
        name: 'choice'
    })
    .then((answer) => {
        if (answer.choice === 'ADD_ROLE') {
            addRole()
        }
        if (answer.choice === 'VIEW_ROLE') {
            viewRole();
        }
        if (answer.choice === 'END') {
            connection.end();
        }
    })
}

init();

function addRole() {
    connection.queryPromise('SELECT * FROM department')
        .then(departments => {
            departments = departments.map(department => {
                return {
                    value: department.id,
                    name: department.name
                };
            });

            return inquirer.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'Enter the title of the role: ',
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'Enter the salary of the role: '
                },
                {
                    type: 'list',
                    message: "Select a department for the role: ",
                    choices: departments,
                    name: 'department_id'
                }
            ]);
        })
        .then(answers => {
            connection.queryPromise('INSERT INTO role (title, salary, department_id) VALUES(?,?,?);', [
                answers.title,
                answers.salary,
                answers.department_id
            ]);
            console.log('Role saved.');
            init();
        });
}

function addEmployee() {
    // add employee is like add role but with two tables to list
    // list the employees & roles to choose from
}

function viewRole() {
    connection.queryPromise(`
        SELECT role.title, role.salary, department.name
        FROM role INNER JOIN department
        ON role.department_id=role.id`)
    .then(roles => {
        console.table(roles);
        init();
    });
}
