const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const cors = require('cors')
var MongoDBStore = require('connect-mongodb-session')(session)

const {verifyJWT} = require('./utils/auth')
const Config = require('./config')
const EmailServices = require('./utils/mail')

const login = require('./router/login')
const task = require('./router/task')

const PORT = Config.PORT;
const DB_URL = Config.DB_URL;
const HOST =  Config.SERVER_HOST;
const FRONTEND_HOST = Config.FRONTEND_HOST;

const app = express();


app.use(cors({
    origin: [FRONTEND_HOST],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isAuth = (req, res, next) => {

    console.log(req.session.id);

    if (req.session.isAuth) next();
    else return res.status(440).send({status:false, message:"Session expired. Please login"});
}

const store = new MongoDBStore({
    uri: DB_URL,
    collection: 'mySessions',
    databaseName: 'todo_list'
})


mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to mongoDB');
    })

app.use(session({
    secret: Config.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        expires: 60000,
    },
    store: store
}, (err) => {
    console.log('Saving Session Failed!!')
    console.log(err);
}))


app.get("/", async (req, res, next) => {
    console.log(req.session)

    // req.session.isAuth = true;
    res.send("You are on root")
})


app.use("/app", login)
app.use('/task', isAuth, verifyJWT, task)


app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}.`)
})

