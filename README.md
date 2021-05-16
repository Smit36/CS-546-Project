# Corporate Traveling Expense Management System
## Introduction

Every corporation requires its employees to travel to get business. The travel can vary and so does the budget for the travel. We are implementing a corporate travel expense management system where a corporate will register to our system and upload its employee data. Employees of the corporate will be given a login to the portal where they can upload their travel expenses and select their immediate manager to approve their expenses. The managers can check the travel expense of his team member and approve or reject his travel expense for a particular reason.
#### Course:

`CS-546 Spring 2021`

#### Instructor

Patrick Hill
#### Group Members

Project Group 17

- [Smit Gor](https://github.com/Smit36)
- [Vivian Dbritto](https://github.com/dbrittovivian)
- [Parthik Davra](https://github.com/parthikdavra)
- [Ming-Wei Hu](https://github.com/davidhu34)
- [Junhong Wu](https://github.com/bjutwjh)

### Features

#### User and Corporate Administration

- Authentication system for all users
- Corporate accounts administration for portal administrators
- Corporate ranks/heirarchy and employees management for corporate administrators
- Bulk employees entry with CSV file upload
#### Expenses management

- Personal expenses management for employees
- View expenses by business trips or view personal listing summary

#### Trips management

- Create business trips with designated employees and managers
- Add, edit, or delete personal expenses in a business trip
- View total expenses of the business trip from all employees

#### Approval Thread

- View history of approval thread
- Status updates with message threads for communication and approval
- Notifications on new, relavent approval thread status


## Running the Application
### `MongoDB`

- Database connection has to be available for `localhost:27017`
- Recommended edition for demo: MongoDB 4.4.3 Community

### Start the Application Server

Run this `NodeJS` application locally via `npm`

```
$ npm install
$ npm start
```

### Seed data

A set of seed data for `MongoDB` is available.
Run the seeding task script to clean up and seed the database.

```
$ npm install
$ npm run seed
```
