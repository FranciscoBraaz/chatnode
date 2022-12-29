import express from "express"
import http from "http"
import dotenv from "dotenv"
import cors from "cors"
import { Server } from "socket.io"

import apiRoutes from "./routes/index.js"
import { mongoConnect } from "./database/mongo.js"

dotenv.config()

mongoConnect()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: "http://localhost:3000",
})

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

io.on("connection", (socket) => {
  console.log("Conexão detectada...")
})

app.use("/", apiRoutes)

export default server