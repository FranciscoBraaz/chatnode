import { Schema, model, connection } from "mongoose"

const schema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  refreshToken: { type: [String], required: false },
})

const modelName = "User"
const userModel =
  connection && connection[modelName]
    ? connection.models[modelName]
    : model(modelName, schema, "users")

export default userModel
