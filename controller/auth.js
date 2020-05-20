const User = require("../models/user");
const nodemailer = require("nodemailer");
const Token = require("../models/token");

const { validationResult } = require("express-validator");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// signup controller

const signup = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, mobile_number, password } = req.body;

    try {
        const result = await User.findOne({ email });

        if (result) {
            return res.status(403).json({
                msg: "User is Already Present",
            });
        }

        const user = new User(req.body);

        user.save((err) => {
            if (err) {
                return res.status(500).json({
                    msg: `Something is wrong ${err}`,
                });
            }

            var token = new Token({
                _userId: user._id,
                token: crypto.randomBytes(16).toString("hex"),
            });

            token.save((err) => {
                if (err) {
                    return res.status(500).json({
                        msg: `Something is wrong ${err}`,
                    });
                }

                let transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false,
                    auth: {
                        user: "rachael27@ethereal.email",
                        pass: "QtGeMVPq5TbCdq94Av",
                    },
                });

                const mailOptions = {
                    from: "rachael27@ethereal.email",
                    to: email,
                    subject: "Email Verification",
                    text: `Hii Pleaser Verify Your Account http://${req.headers.host}/confirm/${token.token}`,
                };

                transporter.sendMail(mailOptions, function (err) {
                    if (err) {
                        return res.status(500).send({ msg: err.message });
                    }
                    res.status(200).send(
                        "A verification email has been sent to " + user.email
                    );
                });
            });
        });
    } catch (error) {
        return res.status(400).json({ msg: ` Something is wrong ${error}` });
    }
};

// Log in logic

const login = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (user.comparePassword(password)) {
        if (!user.isVerified) {
            return res.status(400).json({ msg: "User is not verfied" });
        } else {
            const token = jwt.sign({ _id: user._id }, process.env.SECRET);
            res.cookie("token", token, { maxAge: 1000000 });
            return res.json({
                _id: user._id,
                email: user.email,
                token: token,
                message: "Login Succesfully",
            });
        }
    } else {
        return res.status(400).json({
            err: "Something is wrong",
        });
    }
};

// confirmation logic

const confirmation = (req, res) => {
    Token.findOne({ token: req.params.token }, function (err, token) {
        if (!token)
            return res.status(400).send({
                type: "not-verified",
                msg: "not able to find valid token may be it is expired",
            });

        User.findOne({ _id: token._userId }, function (err, user) {
            if (!user)
                return res.status(400).send({
                    msg: "We were unable to find a user for this account.",
                });
            if (user.isVerified)
                return res.status(400).send({
                    type: "already-verified",
                    msg: "This user has already been verified.",
                });

            user.isVerified = true;

            user.save(function (err) {
                if (err) {
                    return res.status(500).send({ msg: err.message });
                }
                res.status(200).send("the account has ben verified loging");
            });
        });
    });
};

module.exports = { signup, login, confirmation };
