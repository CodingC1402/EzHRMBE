# Commands:
 * npm install - read doc :v
 * npm update - do it!
 * npm start - to run without compiled
 * npm run dev - to run with nodemon
 * npm run compile - to compile to javascript

# Paths:
* POST /login (body: {username, password})
* DELETE /logout
* POST /register (body: {username, password, email})
* GET  /profile : Get user info with the company and all sub documents.

# Implementing:
* /profile/employees : Get all employees for the company.
* /profile/employees/{:id}/details : get details for a specific employees.
* /profile/employees/details : Get all employees for the company with all of them have full details.
* PUT /change-password/ 