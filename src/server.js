import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import apiRoutes from "./routes/index.js"

dotenv.config()

const server = express()

server.use(cors())
server.use(express.urlencoded({ extended: true }))
server.use(express.json())

server.use("/", apiRoutes)

server.listen(process.env.PORT)
