const allowedOrigins = ["http://localhost:3000"]

export function credentials(req, res, next) {
  const origin = req.headers.origin

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Credentials", "true")
  }

  next()
}
