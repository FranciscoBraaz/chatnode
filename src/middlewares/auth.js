import JWT from "jsonwebtoken"

export async function Auth(socket, next) {
  let success = false

  if (socket.handshake.auth.token) {
    const [authType, token] = socket.handshake.auth.token.split(" ")

    if (authType === "Bearer") {
      try {
        const decoded = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)
        socket.decoded = decoded
        success = true
      } catch (error) {
        console.log("Error middleware", error)
      }
    }
  }

  if (success) {
    next()
  } else {
    next(new Error("Auth Error"))
  }
}
