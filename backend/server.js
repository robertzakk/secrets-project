// MODULES //
import express from 'express';
import session from 'express-session';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';
import bodyParser from 'body-parser';
import passport from 'passport';
import { Strategy } from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import GithubStrategy from 'passport-github2';
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import cors from 'cors';
import httpsProxyAgent from 'https-proxy-agent';

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

const githubStrategy = new GithubStrategy({
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: 'http://localhost:8080/auth/github/callback',
}, async (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
        return done(null, profile);
    })
});

const agent = new httpsProxyAgent('http://46.182.188.113:8080');
githubStrategy._oauth2.setAgent(agent);

passport.use(githubStrategy);

passport.serializeUser((user, cb) => {
    cb(null, user.id);

});
passport.deserializeUser(async (userId, cb) => {
    try {
        const client = await pgPool.connect();
    
        const users = await client.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (users.rowCount !== 0) {
            cb(null, users.rows[0]);
        } else {
            cb('User not found', false);
        };
    } catch (err) {
        cb(err, false);
    };
});

const app = express();
const port = 8080;

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    store: pgSession,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
}));
app.use(passport.initialize());
app.use(passport.session());

// RESTful API //
app.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    };
});

app.get('/secrets', async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const client = await pgPool.connect();
            
            const secrets = await client.query(
                'SELECT secret FROM user_secrets WHERE user_id = $1',
                [req.user.id],
            );

            if (secrets.rowCount !== 0) {
                res.json(secrets.rows);
            } else {
                console.log('No secrets found for this user');
            };
        } catch (err) {
            console.log(err);
        };
    };
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', passport.authenticate('github'), (req, res) => {
    res.redirect('http://localhost:3000/secrets');
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
                    res.json({ userId: newUser.id }).end();
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

app.post('/login', passport.authenticate('local'), (req, res) => {
    res.send({ userId: req.user.id }).end();
});

app.post('/secret', async (req, res) => {
    try {
        if (!req.isAuthenticated()) return;

        const client = await pgPool.connect();

        await client.query(
            'INSERT INTO user_secrets (user_id, secret) VALUES ($1, $2)',
            [req.user.id, req.body.secret]
        );

        client.release();

        res.status(201).end();
    } catch (err) {
        console.log(err);
    };
});

// SERVER SETUP //
app.listen(port, () => {
    console.log(`Server for RESTful API is running on port ${port}`);
});