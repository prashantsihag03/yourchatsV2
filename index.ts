import http from 'http'
import { Server } from 'socket.io'
import createApp from './app'

const port: number = (process.env.PORT != null && process.env.PORT !== '') ? Number(process.env.PORT) : 3000

// Express App
const app = createApp()

// Server setup
const server = http.createServer(app)

// WebSocket Server Setup
const SocketIO = new Server(server)

// SocketIO Events
SocketIO.on('connection', (socket) => {
  console.log('A new user connected!')
})

server.listen(port, () => {
  console.log(`YourChatsV2: http://localhost:${port}/`)
})
