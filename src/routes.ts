import express from 'express';
import { register, login, getAccountData, updateAccountData } from './controllers';

const router = express.Router();

//GET → Retrieves data (e.g., fetching user account information).
//Returns data.
//Safe—doesn’t modify anything.

//POST → Sends data to the server (e.g., user registration).
//Usually no return, but sometimes responds with success/error messages.
//Creates new resources (like adding a user).

//PUT → Updates an existing resource (like updating user settings).
//Has return (confirms update success).
//Idempotent—calling it multiple times gives the same result.

//DELETE → Removes a resource (like deleting a user account).
//Usually no return, but may confirm deletion.
//Deletes data permanently.

//PATCH → Partially updates an existing resource (instead of replacing it like PUT).
//Has return, confirming partial update.
//Useful when only modifying specific fields.

//The HTTP method (GET, POST, PUT, etc.) just tells the server what type of operation the client intends to perform. However, 
// the actual response depends on the function handling the request.

router.post('/register', register);
router.post('/login', login);
router.get('/account', getAccountData);
router.post('/account', updateAccountData);

export default router;

//fetch
//MIME Type Categories
// application/json → JSON data
// text/html → HTML document
// text/plain → Raw text
// image/png → PNG image file
// video/mp4 → MP4 video

// fetch() - What is it?
// fetch() is a built-in JavaScript function used to make HTTP requests.

// It sends a request to a specified URL and returns a Promise, which is a placeholder for data that will be available in the future.
// fetch('http://localhost:3000/api/register', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//         username: "player1",
//         password: "secret"
//     })
// })
// .then(response => response.json())  // Convert response to JSON
// .then(data => console.log(data))  // Handle the returned data
// .catch(error => console.error('Error:', error)); // Catch any errors
