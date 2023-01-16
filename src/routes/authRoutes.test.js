import mongoose, { connect } from "mongoose"
import request from "supertest"
import { appExpress } from "../app"
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
    name: "Teste fulano",
  }

  let currentRefreshToken = null

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
    const response = await request(appExpress).post("/login").send(user)

    expect(response.body).toHaveProperty("message")
    expect(response.body.message).toBe("E-mail ou senha incorretos")
  })

  it("should create an user", async () => {
    const response = await request(appExpress)
      .post("/register")
      .send(userToCreate)

    expect(response.status).toBe(201)
  })

  it("should not create an user missing params", async () => {
    const response = await request(appExpress).post("/register").send({
      email: "testando@gmail.com",
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe("Parâmetros incompletos")
  })

  it("should not create an user has already exist", async () => {
    const response = await request(appExpress)
      .post("/register")
      .send(userToCreate)

    expect(response.status).toBe(400)
    expect(response.body.message).toBe("Usuário já cadastrado")
  })

  it("should login returning user information and access token", async () => {
    const response = await request(appExpress).post("/login").send(user)
    const cookies = response.headers["set-cookie"]

    const jwtCookie = cookies.filter((cookie) => cookie.startsWith("jwt"))[0]
    const refreshTokenJwt = jwtCookie.split(";")[0]
    const refreshTokenValue = refreshTokenJwt.split("=")[1]

    currentRefreshToken = refreshTokenValue
    expect(response.body).toHaveProperty("user")
    expect(response.body).toHaveProperty("accessToken")
    expect(refreshTokenValue.length).toBeGreaterThan(0)
  })

  it("should create a new access token and a new refresh token", async () => {
    const response = await request(appExpress)
      .get("/refresh-token")
      .set("Cookie", [`jwt=${currentRefreshToken}`])
    const cookies = response.headers["set-cookie"]

    const jwtCookie = cookies.filter((cookie) => cookie.startsWith("jwt"))[
      cookies.length - 1
    ]
    const refreshTokenJwt = jwtCookie.split(";")[0]
    const refreshTokenValue = refreshTokenJwt.split("=")[1]

    expect(response.body).toHaveProperty("accessToken")
    expect(refreshTokenValue.length).toBeGreaterThan(0)
  })

  it("should not create a new accessToken and a new refreshToken when jwt cookie is empty", async () => {
    const response = await request(appExpress)
      .get("/refresh-token")
      .set("Cookie", [`jwt=`])

    expect(response.status).toBe(401)
  })

  it("should not create a new accessToken and a new refreshToken when current refreshToken is malformed", async () => {
    const response = await request(appExpress)
      .get("/refresh-token")
      .set("Cookie", [`jwt=kdsjdskj`])

    expect(response.status).toBe(403)
  })
})
