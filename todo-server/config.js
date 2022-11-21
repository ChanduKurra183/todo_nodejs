require('dotenv').config();



const config = {

    JWT_SECRET: process.env.JWT_SECRET,
    SERVER_HOST: process.env.SERVER_HOST,
    FRONTEND_HOST: process.env.FRONTEND_HOST,
    NODE_ENV: process.env.NODE_ENV,
    SESSION_SECRET: process.env.SESSION_SECRET,
    DB_URL: process.env.DB_URL,
    PORT: process.env.PORT,
    EMAIL: process.env.EMAIL,
    EMAIL_PASS: process.env.EMAIL_PASSWORD

}




module.exports = config;