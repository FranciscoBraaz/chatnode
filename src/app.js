import express from "express"
import http from "http"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import { Server } from "socket.io"

import apiRoutes from "./routes/index.js"
import { mongoConnect } from "./database/mongo.js"
import { Auth } from "./middlewares/auth.js"
import { credentials } from "./middlewares/credentials.js"
import { corsOptions } from "./config/corsOptions.js"

dotenv.config()

mongoConnect()

export const appExpress = express()
export const server = http.createServer(appExpress)
const io = new Server(server, {
  cors: "http://localhost:3000",
})

appExpress.use(credentials)
appExpress.use(cors(corsOptions))
appExpress.use(express.urlencoded({ extended: true }))
appExpress.use(express.json())
appExpress.use(cookieParser())

io.use(Auth)

let connectedUsers = []

io.on("connection", (socket) => {
  console.log("Conexão detectada...")

  if (socket.decoded) {
    const index = connectedUsers.findIndex(
      (connectedUser) => connectedUser === socket.decoded.username,
    )
    if (index === -1) {
      connectedUsers.push(socket.decoded.username)
    }
  }

  socket.emit("user-list", connectedUsers)
  socket.broadcast.emit("list-update", {
    joined: socket.decoded.username,
    userList: connectedUsers,
  })

  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter(
      (connectedUser) => connectedUser !== socket.decoded.username,
    )

    socket.broadcast.emit("list-update", {
      left: socket.decoded.username,
      userList: connectedUsers,
    })
  })

  socket.on("send-message", (msg) => {
    const message = {
      user: socket.decoded.username,
      content: msg,
    }
    // socket.emit("send-message", message)
    socket.broadcast.emit("show-message", message)
  })
})

appExpress.use("/", apiRoutes)
