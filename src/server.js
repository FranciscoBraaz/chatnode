import dotenv from "dotenv"
import { appExpress, server } from "./app"

dotenv.config()

server.listen(process.env.PORT)
