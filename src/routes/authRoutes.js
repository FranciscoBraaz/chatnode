import { Router } from "express"
import * as AuthController from "../controllers/authController.js"

const router = Router()

router.post("/login", AuthController.handleLogin)
router.post("/register", AuthController.handleRegister)

export default router
