# task-management-web-api
This repository is used for creating server side app using express for assignment
Below are the steps to run the project
1. npm intall - download and installed necessary npm packages to run project
2. npm run dev - for running express app in development mode

OR 
2. npm build - to generate dist folder
4. npm run start - to start nodejs express application

Congratulations your application will be up and running at below path

http://localhost:8080/

Authentication and Autherization
For authentication and autherization jwttoken is used. Please create your jwt secrete key and update in server.ts const JWT_SECRET value

Autharization is role based autherization with role admin and user
There are 2 users setup
1. user role
username - user 
password - user123

2. Admin role
username - admin 
password - admin123

Below are the endpoints used
1. http://localhost:8080/login
2. http://localhost:8080/createtask
3. http://localhost:8080/updatetask
4. http://localhost:8080/task/delete/:id - This endpoint is protected with authcode and allow this action for admin role