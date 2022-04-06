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
  - POST /login (body: {username, password})
  - DELETE /logout
  - POST /register (body: {username, password, email})
  - GET  /profile : Get user info with the company and all sub documents.

## Implementing:
* Employees (/api/v1):
  - GET /employees : Get all employees of the company.
  - GET /employees/{:id}/details : Get details for a specific employees.
  - PUT /employees/update/{:id} : Update an employee with **ObjectID**.
  - POST /employees/create : Create new employee
  - DELETE/GET /employees/{:id} : Get or delete employee with **ObjectID**.
  - GET /employees/details : Get all employees for the company with all of them have full details.
* Authentication:
  - PUT /change-password/

## Note:
* Most of the id we will be using will be **ObjectID** this is just a note to make sure that everyone on the same note :v