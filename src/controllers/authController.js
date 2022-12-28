import JWT from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../models/User"
import e from "express"

async function handleLogin(req, res) {
  const { cookies } = req
  const { email, password } = req.body

  if (!email || !password) {
    res.json({ message: "Dados incompletos" }).status(400)
    return
  }

  const user = await User.findOne({ email })

  if (!user || (user && user.password !== password)) {
    res.json({ message: "E-mail ou senha incorretos" }).status(400)
    return
  }

  const accessToken = JWT.sign(
    { id: user.id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  )

  const newRefreshToken = JWT.sign(
    { id: user.id, username: user.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" },
  )

  const newRefreshTokenArray = !cookies?.jwt
    ? user.refreshToken
    : user.refreshToken.filter((rt) => rt !== cookies.jwt)

  if (cookies?.jwt) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true })
  }

  const userToReturn = {
    id: user.id,
    username: user.username,
    email: user.email,
  }

  user.refreshToken = [...newRefreshTokenArray, newRefreshToken]
  await user.save()

  res.cookie("jwt", newRefreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  })
  res.json({ user: userToReturn, accessToken }).status(200)
}
