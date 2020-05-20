const router = require("express").Router();

const { signup, login, confirmation } = require("../controller/auth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/confirmation/:token", confirmation);

module.exports = router;
