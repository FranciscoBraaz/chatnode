const allowedOrigins = [
  "http://localhost:3000",
  "https://chat-node.netlify.app",
  "https://chat-realtime-react.netlify.app",
]

export const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true)
    } else {
      console.log("Cors error")
      callback(new Error("Not allowed by Cors"))
    }
  },
  optionsSuccessStatus: 200,
}
