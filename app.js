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

// init function, it starts here
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
            'UPDATE_EMPLOYEE_ROLE',
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
                                    if (answer.choice === 'UPDATE_EMPLOYEE_ROLE') {
                                        updateEmployeeRole();
                                    } else
                                        if (answer.choice === 'END') {
                                            connection.end();
                                        }
        })
}

init();

// add role function
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

// update employee function
function updateEmployeeRole() {

    connection.queryPromise('SELECT first_name, last_name, id  FROM employee')
    .then(employees => {
        person = employees.map(employee => {
            return {
                name: employee.first_name + ' ' + employee.last_name,
                id: employee.id
            };
        
        
        })
        connection.queryPromise(`select id, title FROM role`)
        .then(roles => {
            role_title = roles.map(role => {
                return {
                    id: role.id,
                    name: role.title,
                };
            })
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'name',
                    choices: person, 
                    message: 'Who do you want to update: '
                },
                {
                    type: 'list',
                    name: 'newrole',
                    choices: role_title,
                    message: 'What is new role '
                }
            ]);

    
        })

        .then(function(answers) {
            var the_person = person.find(obj => obj.name === answers.name);
            var new_role = role_title.find(obj => obj.name === answers.newrole);

            connection.queryPromise('UPDATE employee SET ? where id = ?', [{role_id: new_role.id}, the_person.id]);
            console.log('Role updated.');
            init();
        });
    
    
    })
        

}

// add department function
function addDepartment() {

    inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'Enter the department name: ',
        },
    ]).then(answers => {
        connection.queryPromise('INSERT INTO department (name) VALUES(?);', [
            answers.department
        ]);
        console.log('Department saved.');
        init();
    })


}

// add an employee function
function addEmployee() {


    connection.queryPromise('SELECT * FROM role')
        .then(roles => {
            roles = roles.map(role => {
                return {
                    role_id: role.id,
                    name: role.title,
                };

            });

            connection.queryPromise(`select * FROM employee`)
                .then(managers => {
                    people = managers.map(manager => {
                        return {
                            id: manager.id,
                            name: manager.first_name + ' ' + manager.last_name,
                        };
                    })

                    return inquirer.prompt([
                        {
                            type: 'input',
                            name: 'first_name',
                            message: 'Enter the first name of the employee: ',
                        },
                        {
                            type: 'input',
                            name: 'last_name',
                            message: 'Enter the last name of the employee: '
                        },
                        {
                            type: 'list',
                            message: "Select a role for the employee: ",
                            choices: roles,
                            name: 'role'
                        },

                        {
                            type: 'list',
                            message: "Select a manager for the employee: ",
                            choices: people,
                            name: 'manager'
                        }
                    ]);


                })
                .then(function (answers) {

                    var person = people.find(obj => obj.name === answers.manager);
                    role_picked = roles.find(obj => obj.name === answers.role);


                    connection.queryPromise('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES(?,?,?,?);', [
                        answers.first_name,
                        answers.last_name,
                        role_picked.role_id,
                        person.id
                    ]);



                    console.log("Employee Saved");
                    init();
                }
                )
        })

}

// view table function
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

// view employee function
function viewEmployee() {
    connection.queryPromise(`
        SELECT employee.first_name, employee.last_name, role.title as roleName
        FROM employee INNER JOIN role
        ON employee.role_id=role.id`)
        .then(employees => {
            console.table(employees);
            init();
        });
}

// view department function
function viewDepartment() {
    connection.queryPromise(`
        SELECT name
        FROM department`)
        .then(department => {
            console.table(department);
            init();
        });
}
