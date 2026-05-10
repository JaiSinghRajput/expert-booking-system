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
    transports: ['websocket'],
    pingInterval: 25000,
    pingTimeout: 60000,
  })

  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id)
    socket.emit('connected', { socketId: socket.id })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', socket.id, 'Reason:', reason)
    })

    socket.on('error', (error) => {
      console.error('Socket error:', socket.id, error)
    })
  })

  io.on('connection_error', (error) => {
    console.error('Socket connection error:', error)
  })

  return io
}

export function emitSlotBooked(payload: SlotBookEvent): void {
  io?.emit('slotBooked', payload)
}
