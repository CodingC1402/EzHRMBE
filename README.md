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
  - POST    `/login` (body: `{ username, password }`)
  - DELETE  `/logout`
  - POST    `/register` (body: `{ username, password, email }`)
  - GET     `/profile` : Get user info with the company and all sub documents.
* Employees (/api/v1):
  - PUT     `/employees/:id` : Update an employee with **ObjectID**.
  - POST    `/employees/create` : Create new employee
  - DELETE  `/employees/:id` : Delete employee with **ObjectID**.
  - GET     `/employees/all` : Get all employees of the company.
* Clock-in:
  - GET
    - `/clock-ins/with-emp` : Get tất cả employee cùng clock-in trong ngày nếu có (prop `clockIn` trong mỗi element), nếu không có sẽ không có prop `clockIn`.<br>
    - `/clock-ins/id/:empid` : Get tất cả clock in của 1 nhân viên bằng **ObjectID**.<br>
    - `/clock-ins/comp/:compid/:workid` : Get tất cả clock in của 1 nhân viên bằng **WorkID** (phải kèm theo ID company).<br>
    - `/clock-ins/comp/:compid` : Get tất cả clock in của 1 công ty bằng **ObjectID** của công ty đó.<br>
    - `/clock-ins/accm-work-hours/:empid` : Trích xuất tổng số giờ làm trong giờ và số giờ làm OT của 1 nhân viên bằng **ObjectID**.
  - POST    `/clock-ins/` (body: `{ employeeID: string }`) : Tạo chấm công mới cho nhân viên với giờ vào làm (clockedIn) là thời điểm hiện tại, nhân viên có đi trễ hay không sẽ được tính toán và lưu vào property `late` của clock in; nếu nhân viên đi trễ thì sẽ tự động thêm penalty. Mỗi nhân viên chỉ có thể tạo 1 chấm công/ngày.
  - PUT     `/clock-ins/:empid` (body: `{ clockIn: IClockIn, userID: string }`) : Cập nhật giờ tan làm cho nhân viên và tính số giờ làm trong giờ, số giờ làm OT dựa trên rule của company.
  - DELETE  `/clock-ins/:empid` (body: `IClockIn`) : Xóa clock in của nhân viên, chỉ được xóa clock in của ngày hiện tại; nếu hôm đó nhân viên đi trễ thì penalty cũng bị xóa theo.
* Penalties:
  - GET     
    - `/penalties/id/:empid` :<br>
    - `/penalties/comp/:compid/:workid` :<br>
    - `/penalties/comp/:compid` :<br>
          Tương tự như clock in.
    - `/penalties/accm-deduction/:empid` : GET tổng số deduction của nhân viên bằng **ObjectID**.
  - POST    `/penalties/` (body: `IPenalty`) : Tạo penalty; property `type` phải thuộc một trong các penalty type của company.
  - PUT     `/penalties/:id` : Update penalty bằng **ObjectID**.
  - DELETE  `/penalties/:id` : Delete penalty bằng **ObjectID**.
* Salaries:
  - GET     
    - `/salaries/id/:empid` :<br>
    - `/salaries/comp/:compid/:workid` :<br>
    - `/salaries/comp/:compid` :<br>
          Tương tự như clock in và penalty.
  - POST    `/salaries/` (body: `ISalary`) : Tạo salary dựa trên lần trả lương cuối cùng của nhân viên, nếu nhân viên chưa từng được trả lương thì dùng ngày bắt đầu làm của nhân viên làm mốc: nhân viên được trả lương theo tháng thì phải ít nhất 1 tháng sau lần trả lương cuối cùng mới có thể thêm salary mới, nhân viên hưởng lương giờ thì tự do tạo salary.
  - PUT     `/salaries/:id` (body: `ISalary`) : Update salary, chỉ được update các prop `{ salary, otSalary }`.
  - DELETE  `/salaries/:id` : Tương tự penalty.
* Company:
  - PUT     `/company` : Cập nhật thông tin cty, bao gồm tên (`name`), địa chỉ (`address`), số điện thoại (`phone`).
  - PUT     `/company/rules` : Cập nhật các quy định của cty, bao gồm giờ bắt đầu làm (`startWork`), giờ tan làm (`endWork`), thời gian cho phép đi trễ (`allowedLateTime`), thời gian đi trễ tối đa (`maxLateTime`). **LƯU Ý:** các khoảng thời gian cho phép đi trễ và thời gian đi trễ tối đa phải dùng giá trị không có timezone, do ta chỉ quan tâm tới khoảng thời gian chứ không quan tâm mốc thời gian.
* Reports:
  - GET     `/reports/comp/:compid` : GET tất cả report của công ty bằng **ObjectID**.
  - POST    `/reports/:compid` (body: `{ startDate: string, endDate: string }`) : Tổng hợp báo cáo cho công ty; nếu có request body thì sẽ dùng khoảng thời gian đó để tổng hợp báo cáo, nếu không có request body thì mặc định khoảng thời gian là tháng hiện tại.
  - PUT     `/reports/:id` : Tổng hợp lại báo cáo có `id` **(ObjectID)** tương ứng.
  - DELETE  `/reports/:id` : Tương tự các method delete trên.

* **NOTE:** Các request GET của endpoint `/clock-ins` và `/penalties` có thể nhận query param `startDate` và `endDate` để filter khoảng thời gian chứa clock in hoặc penalty; startDate và endDate có dạng ISODate - `"YYYY-MM-DDThh:mm:ss(timezone offset)"`.

## Implementing:
* Employees (/api/v1):
  - GET     /employees/:id/details : Get details for a specific employees.
  - GET     /employees/all/details : Get all employees for the company with all of them have full details.
* Authentication:
  - PUT /change-password/

## Note:
* Most of the id we will be using will be **ObjectID** this is just a note to make sure that everyone on the same note :v
