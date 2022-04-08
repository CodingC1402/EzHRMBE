# Backend document

## IMPORTANT NOTES:


## Commands:
* npm install - read doc :v
* npm update - do it!
* npm start - to run without compiled
* npm run dev - to run with nodemon
* npm run compile - to compile to javascript

## Paths:
* Authentication:
  - POST    /login (body: {username, password})
  - DELETE  /logout
  - POST    /register (body: {username, password, email})
  - GET     /profile : Get user info with the company and all sub documents.
* Employees (/api/v1):
  - PUT     /employees/:id : Update an employee with **ObjectID**.
  - POST    /employees/create : Create new employee
  - DELETE  /employees/:id : Delete employee with **ObjectID**.
  - GET     /employees/all : Get all employees of the company.

## Implementing:
* Employees (/api/v1):
  - GET     /employees/:id/details : Get details for a specific employees.
  - GET     /employees/all/details : Get all employees for the company with all of them have full details.
* Authentication:
  - PUT /change-password/

## Note:
* Most of the id we will be using will be **ObjectID** this is just a note to make sure that everyone on the same note :v
