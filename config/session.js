//contants
const TWO_HOURS = 1000 * 60 * 60 * 2;

//getting environment variables
export const {
    PORT = 6543,
    SESS_NAME = 'sid',
    SESS_SECRET = 'secret',
    SESS_LIFETIME = TWO_HOURS,
    NODE_ENV = 'development',
} = process.env;

const IN_PROD = NODE_ENV === 'production';


export const SESSION_OPTION = {
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
};