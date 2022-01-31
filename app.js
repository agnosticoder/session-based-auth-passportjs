import express from 'express';
import session from 'express-session';
import path from 'path';
import { getDirname } from './utils/__dirname.js';
const __dirname = getDirname(import.meta.url);
import pug from 'pug';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { SESSION_OPTION, PORT } from './config/session.js';
import { users } from './db/users.js';

//getting __dirname

//initalize our app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//setting up session middleware
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));

//todo: still need to add prisma store to store session in the DB
app.use(session(SESSION_OPTION));

app.use(passport.session());

//* configure passport-local
passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        // we have bodyparser setup that is why we are getting this
        if (email && password) {
            //on real app you need to compare the hashes not the actual password
            //* check if user exist
            const user = users.find(
                (user) => user.email === email && user.password === password
            );
            //* return if email or password incorrect and no user found
            if (!user)
                return done(null, false, {
                    message: 'Incorrect email or password',
                });
            //* return user if user found
            return done(null, user);
        }
        //* return message if no email or password provided
        return done(null, false, {
            message: 'Please provide email and password',
        });
    })
);

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, user.id);
    });
});

passport.deserializeUser(function (userId, cb) {
    process.nextTick(function () {
        return cb(
            null,
            users.find((user) => user.id === userId)
        );
    });
});

const redirectLogin = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

const redirectHome = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/home');
    }
    next();
};

//getting user if user exist
app.use((req, res, next) => {
    if (req.user) {
        res.locals.user = req.user;
    }
    next();
});

app.get('/pug', (req, res) => {
    res.render('pug', {
        name: 'Satinder Singh',
    });
});

app.get('/', redirectHome, (req, res) => {
    res.render('index');
});

app.get('/home', redirectLogin, (req, res) => {
    res.render('home');
});

app.get('/login', redirectHome, (req, res) => {
    res.render('login');
});

app.get('/register', redirectHome, (req, res) => {
    res.render('register');
});

app.post(
    '/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureMessage: true,
    }),
    (req, res) => {
        return res.redirect('/home');
    }
);

app.post('/register', (req, res) => {
    // we have bodyparser setup that is why we are getting this
    const { email, password, name } = req.body;
    if (email && password && name) {
        //check if user already exist
        const isExist = users.some((user) => user.email === email);
        if (!isExist) {
            // set the new user in store
            // in real app you need to hash the password
            users.push({ id: users.length + 1, email, password, name });
            // req.session.userId = users.length;
            //* pass the data that will be used as session id
            const user = {
                id: users.length,
            }
            return req.login(user, (err) => {
                if(err){
                    console.log({err});
                    return res.send(JSON.stringify(err));
                } 
                return res.redirect('/home');
            })
            // return res.redirect('/login');
        }
        //todo can also implement query string errors
        //e.g.: /register?error=error.auth.userExist
        return res.redirect('/login');
    }
    res.redirect('/register');
});

app.post('/logout', redirectLogin, (req, res) => {
    req.logout();
    res.redirect('/login');
});

app.listen(PORT, () => {
    console.log(`Plese go to http://localhost:${PORT} to have some fun!`);
});
