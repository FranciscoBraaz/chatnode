import JWT from "jsonwebtoken"
import userModel from "../models/User"
import User from "../models/User"

export async function handleRefreshToken(req, res) {
  const { cookies } = req

  if (!cookies?.jwt) {
    res.status(401).json({ message: "Não autorizado" })
    return
  }

  const refreshToken = cookies.jwt
  res.clearCookie("jwt", { httpOnly: true })
  // res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true })

  let foundUser = null
  try {
    foundUser = await User.findOne({ refreshToken })
    const decoded = JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

    if (!foundUser) {
      foundUser = await User.findById(decoded.id)

      if (foundUser) {
        foundUser.refreshToken = []
        await foundUser.save()
      }

      res.sendStatus(403)
      return
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(
      (rt) => rt !== refreshToken,
    )

    const accessToken = JWT.sign(
      { id: foundUser.id, email: foundUser.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    )

    const newRefreshToken = JWT.sign(
      { id: foundUser.id, email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" },
    )

    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
    await foundUser.save()

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      // sameSite: "none",
      // secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    })
    res.status(200).json({ accessToken })
  } catch (error) {
    console.log("Error", error)
    if (error.name === "JsonWebTokenError") {
      res.sendStatus(403)
      return
    }

    if (error.name === "TokenExpiredError" && foundUser) {
      const newRefreshTokenArray = foundUser.refreshToken(
        (rf) => rf !== refreshToken,
      )
      foundUser.refreshToken = [...newRefreshTokenArray]

      await foundUser.save()

      res.sendStatus(403)
      return
    }

    res.status(500).json({ message: "Erro do servidor" })
    return
  }
}
