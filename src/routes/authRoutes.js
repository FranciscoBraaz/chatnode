import { Router } from "express"
import * as AuthController from "../controllers/authController.js"
import * as RefreshTokenController from "../controllers/refreshTokenController"

const router = Router()

router.post("/login", AuthController.handleLogin)
router.post("/register", AuthController.handleRegister)
router.get("/refresh-token", RefreshTokenController.handleRefreshToken)

export default router
