/* ------------------------- Better Comment Tutorial ------------------------ */
// Normal comment
//? should I do this?
//! beware of this
//* This is really important
//todo You must implement this feature
////This comment is not more applicable



import express from 'express';
import session from 'express-session';

//contants
const TWO_HOURS = 1000 * 60 * 60 * 2;

//getting environment variables
const {
    PORT = 6543,
    SESS_NAME = 'sid',
    SESS_SECRET = 'secret',
    SESS_LIFETIME = TWO_HOURS,
    NODE_ENV = 'development',
} = process.env;

const IN_PROD = NODE_ENV === 'production';

//initalize our app
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//creating temporary store for learning purpose
const users = [
    {id: 1, name: 'Pal', email: 'pal@pal.pal', password: 'pal'},
    {id: 2, name: 'Pal Brother', email: 'bro@pal.bro', password: 'bro'},
    {id: 3, name: 'Pal Mom', email: 'mom@pal.mom', password: 'mom'},
];

//setting up session middleware
app.use(
    session({
        name: SESS_NAME,
        secret: SESS_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: IN_PROD, //* can access cookie on document object
            maxAge: SESS_LIFETIME,
            sameSite: true,
            secure: IN_PROD,
        },
    })
);

const redirectLogin = (req, res, next) => {
    if(!req.session.userId){
        res.redirect('/login')
    }else{
        next();
    }
}

const redirectHome = (req, res, next) => {
    if(req.session.userId){
        res.redirect('/home');
    }else{
        next();
    }
}

//getting user if user exist
app.use((req, res, next) => {
    const {userId} = req.session;
    if(userId){
        res.locals.user = users.find(user => user.id === userId);
    }
    next();
})


app.get('/', redirectHome, (req, res) => {
    const { userId } = req.session;
    res.send(/*html*/ `
        ${
            userId
                ? /*html*/ `
            <div>
                <a href='/home'>Home</a>
                <form method='post' action='/logout'>
                     <button>Logout</button>
                </form>
            </div>
        `
                : /*html*/ `
            <div>
                <h1>Welcome!</h1>
                <a href='/login'>Login</a>
                <a href='/register'>Register</a>
            </div>
        `
        }
    `);
});

app.get('/home', redirectLogin, (req, res) => {
    console.log(req.sessionID);
    console.log(req.session);
    const { user } = res.locals;
    res.send(/*html*/ `
        <div>
            <h1>Home</h1>
            <a href="/">Main</a>
            <ul>
                <li>Name: ${user.name}</li>
                <li>email: ${user.email}</li>
            </ul>
            <form method='post' action='/logout'>
                 <button>Logout</button>
            </form>
        </div>
    `);
});


app.get('/login', redirectHome, (req, res) => {
    res.send(/*html*/ `
        <div>
            <h1>You got it pal!, would you mind feeling your login info </h1>
            <a href='/home'>Home</a>
            <form method='post' action="/login">
                <input type="email" name="email" placeholder='Email' required/>
                <input type="password" name="password" required/>
                <input type="submit"/>
                <form action="post"></form>
                <a href="/register">Register</a>
            </form>
        </div>
    `);
});

app.get('/register', redirectHome, (req, res) => {
    res.send(/*html*/ `
        <div>
            <h1>You got it pal!, can you give me your info</h1>
                <a href='/home'>Home</a>
                <form method='post' action="/register"> 
                <input type="text" name="name" placeholder='Name' required /> 
                <input type="email" name="email" placeholder='Email' required/> 
                <input type="password" name="password" placeholder='Password' required/> 
                <input type="submit" /> 
                <a href="/login">Login</a> 
            </form>
        </div>
    `);
});

app.post('/login', redirectHome, (req, res) => {
    // we have bodyparser setup that is why we are getting this
    const {email, password} = req.body;
    if(email && password){
        //on real app you need to compare the hashes not the actual password
        const user = users.find(user => user.email === email && user.password === password);

        if(user){
            req.session.userId = user.id;
            return res.redirect('/home');
        }
    }
    res.redirect('/login');
});

app.post('/register', redirectHome, (req, res) => {
    // we have bodyparser setup that is why we are getting this
    const { email, password, name } = req.body;
    if (email && password && name) {
        //check if user already exist
        const isExist = users.some((user) => user.email === email);
        if (!isExist) {
            // set the new user in store
            // in real app you need to hash the password
            users.push({ id: users.length + 1, email, password, name });
            req.session.userId = users.length;
            return res.redirect('/home');
        }
        //todo can also implement query string errors
        //e.g.: /register?error=error.auth.userExist
        return res.redirect('/login'); 
    }
    res.redirect('/register');
});

app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if(err){
            return res.redirect('/home');
        }
        res.clearCookie(SESS_NAME);
        res.redirect('/login');
    })
});

app.listen(PORT, ()=> {
    console.log(`Plese go to http://localhost:${PORT} to have some fun!`);
})



