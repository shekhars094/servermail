const router = require("express").Router();

const { signup, login, confirmation } = require("../controller/auth");

const { check } = require("express-validator");

router.post(
    "/signup",
    [
        check("email").isEmail(),
        check("mobile_number").isAlphanumeric(),
        check("password").isLength(6),
    ],
    signup
);
router.post(
    "/login",
    [check("email").isEmail(), check("password").isLength(6)],
    login
);
router.get("/confirm/:token", confirmation);

module.exports = router;
