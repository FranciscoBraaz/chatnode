import mongoose, { connect } from "mongoose"
import request from "supertest"
import app from "../app"
import { dropAllCollections } from "../utils/dropAllCollections"
import db from "../database/database"

describe("Testing auth routes", () => {
  const user = {
    email: "teste@gmail.com",
    password: "123",
  }

  const userToCreate = {
    email: "teste@gmail.com",
    password: "123",
    username: "teste",
  }

  beforeAll(async () => {
    try {
      await connect(db.url)
    } catch (error) {
      console.log("Erro de conexão com o MongoDB", error)
    }
  })

  afterAll(async () => {
    await dropAllCollections()
    await mongoose.connection.close()
  })

  it("should return credentials error", async () => {
    const response = await request(app).post("/login").send(user)

    expect(response.body).toHaveProperty("message")
    expect(response.body.message).toBe("E-mail ou senha incorretos")
  })

  it("should create an user", async () => {
    const response = await request(app).post("/register").send(userToCreate)

    expect(response.status).toBe(201)
  })

  it("should not create an user missing params", async () => {
    const response = await request(app).post("/register").send({
      email: "testando@gmail.com",
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe("Parâmetros incompletos")
  })

  it("should not create an user has already exist", async () => {
    const response = await request(app).post("/register").send(userToCreate)

    expect(response.status).toBe(400)
    expect(response.body.message).toBe("Usuário já cadastrado")
  })

  it("should login returning user information and access token", async () => {
    const response = await request(app).post("/login").send(user)

    expect(response.body).toHaveProperty("user")
    expect(response.body).toHaveProperty("accessToken")
  })
})
