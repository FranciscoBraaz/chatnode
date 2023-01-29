import JWT from "jsonwebtoken"

export async function Auth(socket, next) {
  if (socket.handshake.auth.token) {
    const [authType, token] = socket.handshake.auth.token.split(" ")
    if (authType === "Bearer") {
      try {
        const decoded = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)
        socket.decoded = decoded
        next()
      } catch (error) {
        next(new Error("Auth Error"))
      }
    }
  }
}
