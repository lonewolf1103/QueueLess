Steps of creating the backend
- 1 create server.js file to start the server
- 2 create app.js file for middlewares and routes
- 3 create DB.js file to setup the mongoDB database
- 4 Now create models folder {
    creating user model
} 
- 5 create routes folder for POST and the flow goes like this{
    Postman
   ↓
POST /api/auth/register
   ↓
authRoutes.js
   ↓
authController.js
   ↓
User model
   ↓
MongoDB
}
- 6 create the register route and then import the controller function in it
- 7 use that route into app.js file with express.json()
- 8 then write the register logic in auth controller{
    > take the request from the body what we need 
    > then we check the existing user
    > if user exist then throw an error 
    > if not then create a new user
    > and firstly hash the password by bcrypt
    > then write the logic to create a new user in mongodb
}
- 9 now do the same thing with login controller and routes also{
    > first take the request of email and password
    > then check the user is not available in db
    > then compare the user password with hashed password of db
    > then throw the error if it is not exact
    > then install jwt and create a token which accepts payload,jwt secret and expiry
    > after that we store the user token in cookie with the help of cookie-parser and setup that in app.js too
    > then return the login status
}
- 10 after that we have to create auth middleware to check the token is valid or not{
    > create a token variable in which we are accepting from frontend/user
    > after that check the token is available or not, if not throw the error
    > then verify is through jwt that the token is is matching the token which was registered and handle this in try catch block
    > send just add it to req.user = user and return next
}