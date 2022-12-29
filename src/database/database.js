import dotenv from "dotenv"

dotenv.config()

let db = {
  url: process.env.MONGO_URL,
}

if (process.env.NODE_ENV === "test") {
  db.url = process.env.MONGO_URL_TEST
}

export default db
