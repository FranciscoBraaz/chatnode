import JWT from "jsonwebtoken"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import User from "../models/User"

export async function handleRegister(req, res) {
  const requiredFields = ["email", "password", "username", "name"]

  for (const field of requiredFields) {
    if (!req.body[field]) {
      res.status(400).json({ message: "Parâmetros incompletos" })
      return
    }
  }

  const { email, password, username, name } = req.body

  const userFound = await User.findOne({
    $or: [{ email: email }, { username: username }],
  })

  if (userFound) {
    res.status(400).json({ message: "Usuário já cadastrado" })
    return
  }

  const hash = bcrypt.hashSync(password, 10)
  await User.create({ email, password: hash, username, name })

  res.sendStatus(201)
}

export async function handleLogin(req, res) {
  const { cookies } = req
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ message: "Dados incompletos" })
    return
  }

  const user = await User.findOne({ email })

  if (!user || (user && !bcrypt.compareSync(password, user.password))) {
    res.status(400).json({ message: "E-mail ou senha incorretos" })
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
    // res.clearCookie("jwt", { httpOnly: true })
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true })
  }

  const userToReturn = {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
  }

  user.refreshToken = [...newRefreshTokenArray, newRefreshToken]
  await user.save()

  res.cookie("jwt", newRefreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  })
  res.status(200).json({ user: userToReturn, accessToken })
}

export async function handleLogout(req, res) {
  const { cookies } = req

  if (!cookies?.jwt) {
    res.sendStatus(204)
    return
  }

  const refreshToken = cookies.jwt

  try {
    const foundUser = await User.findOne({ refreshToken })

    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      res.sendStatus(204)
      return
    }
    console.log("foundUSer", foundUser)
    foundUser.refreshToken = foundUser.refreshToken.filter(
      (rf) => rf !== refreshToken,
    )

    await foundUser.save()
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    res.sendStatus(204)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}
