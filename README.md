# deploysrv

A Census API built with Express.js, MySQL, and Basic Authentication.

## Hosted API
https://srv-deploy-ca.onrender.com

## Tech Stack
- Express.js
- MySQL (Aiven.io)
- Basic Authentication
- Render.com (hosting)

## File Structure
├── src
│   ├── controllers
│   │   └── participantController.js
│   ├── db
│   │   └── connection.js
│   ├── middleware
│   │   └── auth.js
│   ├── routes
│   │   └── participants.js
│   └── app.js
├── .env
├── .gitignore
├── package.json
└── server.js

## Environment Variables (.env)
DB_HOST=mysql-17fb1b8b-stud-4394.e.aivencloud.com
DB_PORT=17970
DB_USER=avnadmin
DB_PASSWORD=P4ssword
DB_NAME=defaultdb
PORT=3000

## API Endpoints
All endpoints require Basic Auth (username: admin, password: P4ssword)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST| /participants/add | Add a new participant |
| GET | /participants | Get all participants |
| GET | /participants/details | Get details for all participants |
| GET | /participants/details/:email | Get details for one participant |
| GET | /participants/work/:email | Get work details for one participant |
| GET | /participants/home/:email | Get home details for one participant |
| PUT | /participants/:email | Update a participant |
| DELETE | /participants/:email | Soft delete a participant |