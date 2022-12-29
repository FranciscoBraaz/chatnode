import express from "express"
import http from "http"
import dotenv from "dotenv"
import cors from "cors"
import { Server } from "socket.io"

import apiRoutes from "./routes/index.js"
import { mongoConnect } from "./database/mongo.js"

dotenv.config()

// mongoConnect()

const appExpress = express()
const server = http.createServer(appExpress)
const io = new Server(server, {
  cors: "http://localhost:3000",
})

appExpress.use(cors())
appExpress.use(express.urlencoded({ extended: true }))
appExpress.use(express.json())

io.on("connection", (socket) => {
  console.log("Conexão detectada...")
})

appExpress.use("/", apiRoutes)

export default appExpress
