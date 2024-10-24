import express from "express";

import { singup,login,logout } from "../contollers/auth.controlle.js";

const router = express.Router();

router.post("/singup", singup );

router.post("/login", login);

router.post("/logout", logout);

export default router;