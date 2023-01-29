const allowedOrigins = [
  "http://localhost:3000",
  "https://chat-node.netlify.app",
  "https://chat-realtime-react.netlify.app",
]

export function credentials(req, res, next) {
  const origin = req.headers.origin

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Credentials", "true")
  }

  next()
}
