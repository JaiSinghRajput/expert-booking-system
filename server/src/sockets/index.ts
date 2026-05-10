import { Server as SocketServer } from 'socket.io'
import type { Server as HttpServer } from 'node:http'

import type { SlotBookEvent } from '../types.js'

let io: SocketServer | null = null

export function initializeSockets(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL ?? true,
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    socket.emit('connected', { socketId: socket.id })
  })

  return io
}

export function emitSlotBooked(payload: SlotBookEvent): void {
  io?.emit('slotBooked', payload)
}
