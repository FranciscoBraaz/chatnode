import { Router } from "express"
import authRoutes from "./authRoutes.js"

const router = Router()

router.get("/", (req, res) => {
  res.json({ message: "Bem vindo" })
})

router.use(authRoutes)

export default router
