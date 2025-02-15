// MODULES //
import express from 'express';
import session from 'express-session';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';
import bodyParser from 'body-parser';
import passport from 'passport';
import { Strategy } from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const pgPool = new pg.Pool({
    database: 'secrets',
    user: 'postgres',
    password: process.env.DATABASE_SECRET,
    port: 5432,
});

const pgSession = new (connectPgSimple(session))({
    pool: pgPool
});

passport.use(new Strategy(async (username, password, cb) => {
    try {
        const client = await pgPool.connect();

        const users = await client.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (users.rowCount !== 0) {
            // user exists with that email
            const user = users.rows[0];

            const doesPasswordMatch = await bcrypt.compare(password, user.password);

            if (doesPasswordMatch) {
                cb(null, user);
            } else {
                cb('Password is incorrect', false);
            };
        } else {
            // account doesn't exist with email
            cb('Account with email doesn\'t exist', false);
        };
    } catch (err) {
        console.log(err);
        cb(err, false);
    };
}));

passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((user, cb) => {
    cb(null, user)
});

const app = express();
const port = 8080;

app.use(cors({
    origin: ['http://localhost:3000/authentication', 'http://localhost:3000']
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    store: pgSession,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000 * 24 * 30, // 30 days
    },
}));
app.use(passport.initialize());
app.use(passport.session());

// RESTful API //
app.get('/user', (req, res) => {
    console.log(req.user);

    res.json(req.user);
});

app.post('/signup', async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const client = await pgPool.connect();

        const usernames = await client.query(
            'SELECT username from users WHERE username = $1',
            [username]
        );

        if (usernames.rowCount === 0) {
            const hashedPassowrd = await bcrypt.hash(password, 12);

            const newUsers = await client.query(
                'INSERT INTO users (name, username, password) VALUES ($1, $2, $3) RETURNING *',
                [name, username, hashedPassowrd]
            )

            client.release();

            const newUser = newUsers.rows[0];
            req.login(newUser, (err) => {
                if (!err) {
                    res.status(201).end();
                } else {
                    console.log(err);
                    res.status(500).end();
                };
            });
        } else {
            client.release();
            res.status(409).end();
        };
    } catch (err) {
        console.log(err);
        res.status(500).end();
    };
});

app.post('/login', passport.authenticate('local', { successRedirect: '/success', failureRedirect: '/failure'}));

// SERVER SETUP //
app.listen(port, () => {
    console.log(`Server for RESTful API is running on port ${port}`);
});