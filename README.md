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

### Demo data

A set of demo data available.
#### Seed data

A seeding task for `MongoDB` is available.
Run the seeding script to clean up and seed the database.

```
$ npm install
$ npm run seed
```
#### Seed content

<details>
  <summary>All seeded users have the same password</summary>
  <code>P@ssw0rd123</code>
</details>
<br/>
Portal Admins:

- `admin1@ctem.com`
- `admin2@ctem.com`

Corporate data:

- Gigasoft
  - domain: @gigasoft.com
  - admin account: `admin@gigasoft.com`
  - Ranks
    - lv3: Manager
    - lv2: Accountant
    - lv1: Associate
  - Users
    - Gina the Manager (`user1@gigasoft.com`) (lv3)
    - Ghibli the Accountant (`user2@gigasoft.com`) (lv2)
    - George the Associate (`user3@gigasoft.com`) (lv1)
  - Trips
    - Businses Trip to Death Star
      - manager: user1@gigasoft.com
      - employees:
        - user2@gigasoft.com
- Microhard
  - domain: @microhard.com
  - admin account: `admin@microhard.com`
  - Ranks
    - lv3: Tech Lead
    - lv2: Senior Dev
    - lv1: Dev
  - Users
    - Mary the Tech Lead (`user1@microhard.com`) (lv3)
    - Mike the Senior Dev (`user2@microhard.com`) (lv2)
    - Milly the Junior Dev (`user3@microhard.com`) (lv1)
  - Trips
    - Businses Trip to Terra
      - manager: user1@microhard.com
      - employees:
        - user2@microhard.com
        - user3@microhard.com


#### Bulk upload test file

`test.csv` will provide entry for 2 new employees for Gigasoft

- bob1 bobb
  - email: `bob1@gigasoft.com`
  - password: 1qaz@WSX
  - rank: lv3
- bob2 bobb
  - email: `bob2@gigasoft.com`
  - password: 1qaz@WSX
  - rank: lv2