const express = require("express");
const bycrypt = require("bcrypt");
const uuid = require("uuid");
const login = express.Router();

const User = require("../schemas/user");
const Otp = require("../schemas/otp");
const EmailServices = require("../utils/mail");
const { generateJWT, verifyJWT } = require("../utils/auth");
const { generateOtp, validateEmail } = require("../utils/helpers");
const validate = require('express-jsonschema').validate;
const VaidationSchemas = require("../validation/login");

login.get("/login", (req, res) => {
    if (req.session.isAuth) return res.send(true);
    else return res.send(false);
});

login.post("/login", validate({ body: VaidationSchemas.loginSchema }), async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(406).send({
            status: false,
            message: !email ? "Email is required." : "Password is required.",
        });
    }

    let user = await User.findOne({ email }, { _id: 0, __v: 0, cd: 0 }).lean();

    if (!user)
        return res
            .status(404)
            .send({ status: false, message: "User does'nt exists." });

    const isMatch = await bycrypt.compare(password, user.password);

    if (!isMatch)
        return res
            .status(406)
            .send({ status: false, message: "Username/Password not correct." });

    req.session.isAuth = true;
    req.session.user_id = user.user_id;

    // remove password from user data
    delete user["password"];
    // get JWT token
    const { signedToken, exp } = generateJWT(user);
    // send token back in response
    user["token"] = signedToken;
    user["valid_upto"] = new Date(+(exp * 1000)).toLocaleString("en-GB", { timeZone: "IST" });

    res.send({
        status: true,
        data: user,
        message: "User fetched successfully",
    });
});

login.post("/logout", verifyJWT, (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        return res.send({ status: true, message: "logged out." });
    });
});

login.post("/register", validate({ body: VaidationSchemas.registerUserSchema }), async (req, res) => {
    const { email, user_name, password } = req.body;
    // validate all required fields
    if (!email || !password || !user_name) {
        return res.status(406).send({
            status: false,
            message: !email
                ? "Email is required / It cannot be empty."
                : !user_name
                    ? "Username is required / It cannot be empty."
                    : "Password is required / It cannot be empty.",
        });
    }
    // validate email
    if (!validateEmail(email)) {
        return res.status(406).send({
            status: false,
            message: "Enter valid email format.",
        });
    }

    let user = await User.findOne({ email });

    if (user)
        return res
            .status(406)
            .send({ status: false, message: "User already exists." });

    let hassedPassword = await bycrypt.hash(password, 12);

    try {
        user = new User({
            user_id: uuid.v4(),
            user_name,
            email,
            password: hassedPassword,
            cd: new Date(),
        });
        await user.save();
        res.send({ status: true, message: "User Saved Successfully." });
        
    } catch (error) {
        console.log(error);
        if(error.name = "MongoError") {
            res.status(400).send({ status: false, message: "Unable to register. Please try after sometime." });  
        }
        res.status(400).send({ status: false, message: "Creating user failed." });
    }

});

login.post("/otp", validate({ body: VaidationSchemas.otpGenerationSchema }), async (req, res) => {
    const { email, password } = req.body;

    const FROM = "Verification <chandukurra07@gmail.com";
    const SUBJECT = "Login Verification OTP";

    if (!email || !password) {
        return res.status(406).send({
            status: false,
            message: "email-id and password are required.",
        });
    }

    try {
        // check user actually exists or not.
        let user = await User.findOne({ email: email });

        if (!user)
            return res
                .status(404)
                .send({ status: false, message: "user doesn't exists." });

        // verify password.
        let isMatch = await bycrypt.compare(password, user.password);

        if (!isMatch)
            return res
                .status(406)
                .send({ status: false, message: "email/password In-correct" });

        // generating 4 digit opt number.
        otp = generateOtp();

        // save otp with user email-id.
        await Otp.findOneAndUpdate(
            { email: email },
            { email: email, otp: otp },
            { upsert: true }
        );

        // send OTP to user email.
        EmailServices.sendEmail(email, FROM, SUBJECT, `OTP: ${otp}`);

        res.status(200).send({
            status: true,
            message: "OTP generation successfull.",
        });
    } catch (error) {
        console.log("Error in OTP generation");
        console.log(error);

        res.status(406).send({
            status: false,
            message: "OTP generation failed.",
        });
    }
});

login.post("/verify", validate({ body: VaidationSchemas.verifyOtpSchema }), async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp)
        return res
            .status(406)
            .send({ status: false, message: "email and otp are required." });

    try {
        // check user actually exists.
        let user = await Otp.findOne({ email: email });

        if (!user)
            return res.status(404).send({
                status: false,
                messgae:
                    "OTP is not generated for the user. please try loggin In.",
            });
        // send 406 error message if otp is incorrect.

        if (user.otp !== otp)
            return res
                .status(406)
                .send({ status: false, message: "OTP In-correct." });

        // delete otp generated record from database after verification.
        await Otp.deleteOne({ email: email });

        res.status(200).send({
            status: true,
            message: "OTP verification successfull.",
        });
    } catch (error) {
        console.log("Error in OTP verification");
        console.log(error);

        res.status(406).send({
            status: false,
            message: "OTP verification failed.",
        });
    }
});

module.exports = login;
