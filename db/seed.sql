INSERT INTO department (name)
VALUES ("Engineering"),
("Finance"),
("Legal"),
("Sales");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 4), 
("Salesperson", 80000, 4),
("Lead Engineer", 150000, 1),
("Software Engineer", 120000, 1),
("Account Manager", 160000, 2),
("Accountant", 125000, 2),
("Legal Team Lead", 250000, 3),
("Lawyer", 190000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jane", "Johnson", 1, null),
("John", "Doe", 2, 1),
("Mary", "Berry", 3, null),
("Bill", "Williams", 4, 3),
("Paul", "Hollywood", 5, null),
("Ashley", "Rodriguez", 6, 5),
("Kevin", "Tupik", 7, null),
("Kunal", "Singh", 8, 7);