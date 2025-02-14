// MODULES //
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from 'passport';
import { Strategy } from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import bcrypt from "bcrypt";

const app = express();
const port = 8080;

// RESTful API //

// SERVER SETUP //
app.listen(port, () => {
    console.log(`Server for RESTful API is running on port ${port}`);
});