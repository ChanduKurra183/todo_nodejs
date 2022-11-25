const express = require("express");
const bycrypt = require("bcrypt");
const uuid = require("uuid");
const login = express.Router();

const User = require("../schemas/user");
const Otp = require("../schemas/otp");
const EmailServices = require("../utils/mail");
const { generateJWT, verifyJWT } = require("../utils/auth");
const { generateOtp, validateEmail } = require("../utils/helpers");

login.get("/login", (req, res) => {

    if (req.session.isAuth) return res.send(true);
    else return res.send(false);

});

login.post("/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(406).send({
            status: false,
            message: !email ? "Email is required." : "Password is required.",
        });
    }

    let user = await User.findOne({ email }, { _id: 0, __v: 0, cd: 0 }).lean();
    // console.log("user", user);
    // console.log("pass", password);

    if (!user)
        return res
            .status(404)
            .send({ status: false, message: "User does'nt exists." });

    const isMatch = await bycrypt.compare(password, user.password);
    // console.log("ismatched", isMatch);

    if (!isMatch)
        return res
            .status(406)
            .send({ status: false, message: "Username/Password not correct." });

    req.session.isAuth = true;
    // console.log(req.session);
    req.session.user_id = user.user_id;

    // remove password from user data
    delete user["password"];
    // get JWT token
    const signedToken = generateJWT(user);
    // send token back in response
    user["token"] = signedToken;

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

login.post("/register", async (req, res) => {
    
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
    console.log("email==>", validateEmail(email));
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

    user = new User({
        user_id: uuid.v4(),
        user_name,
        email,
        password: hassedPassword,
        cd: new Date(),
    });

    await user.save();

    res.send({ status: true, message: "User Saved Successfully." });
});

login.post("/otp", async (req, res) => {
    const { email, password } = req.body;

    const FROM = "Verification <chandukurra07@gmail.com";
    const SUBJECT = "Login Verification OTP";

    // console.log(email, password);

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
        // console.log(error);

        res.status(406).send({
            status: false,
            message: "OTP generation failed.",
        });
    }
});

login.post("/verify", async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp)
        return res
            .status(406)
            .send({ status: false, message: "email and otp are required." });

    try {
        // check user actually exists.
        let user = await Otp.findOne({ email: email });
        // console.log("otp", user.otp);
        // console.log(otp);
        // console.log(user.otp === otp);

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
