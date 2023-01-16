import mongoose, { connect } from "mongoose"
import request from "supertest"
import { appExpress } from "../app"
import { dropAllCollections } from "../utils/dropAllCollections"
import db from "../database/database"

describe("Testing index route", () => {
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

  it("should show welcome message", async () => {
    const response = await request(appExpress).get("/")

    expect(response.body.message).toBe("Bem vindo")
  })
})
