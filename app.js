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
            } else
                if (answer.choice === 'VIEW_ROLE') {
                    viewRole();
                } else
                    if (answer.choice === 'ADD_EMPLOYEE') {
                        addEmployee()
                    } else
                        if (answer.choice === 'VIEW_EMPLOYEE') {
                            viewEmployee();
                        } else 
                            if (answer.choice === 'ADD_DEPARTMENT') {
                                addDepartment()
                        } else
                            if (answer.choice === 'VIEW_DEPARTMENT') {
                                viewDepartment();
                            } else
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
    connection.queryPromise('SELECT * FROM role')
    .then(roles => {
        roles = roles.map(role => {
            return {
                value: role.id, 
                name: role.title,
                salary: role.salary,
                department_id: role.department_id
            };
            
        });
        //console.log (roles);

        connection.queryPromise(`select * FROM employee`)
            .then( managers =>{
                managers = managers.map(manager =>{
                    return {
                        id: manager.id,
                        first: manager.first_name,
                        last: manager.last_name,
                        role_id: manager.role_id,    
                        manager_id: manager.manager_id
                    };
                })
                
                console.log (roles);
                console.log (managers);
                    
            })
    })
}

function viewRole() {
    connection.queryPromise(`
        SELECT role.title, role.salary, department.name as departmentName
        FROM role INNER JOIN department
        ON department.id=role.department_id`)
        .then(roles => {
            console.table(roles);
            init();
        });
}
