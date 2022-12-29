/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  detectOpenHandles: true,
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
}

export default config
