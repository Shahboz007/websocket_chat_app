import {WebSocketServer} from "ws";
import * as url from "node:url";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const {Room, Message} = db
const rooms = new Map();

export function initializeWebSocket(server) {
    const wss = new WebSocketServer({server});

    wss.on('connection', async (ws, req) => {
        const token = url.parse(req.url, true).query.token;
        if (!token) {
            return ws.close(1008, "Token not found");
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            ws.user = decoded;

            console.log(`Client connected: ${ws.user.username} (Role: ${ws.user.role})`);

            if (ws.user.role === 'user') {
                const roomId = String(ws.user.id);
                ws.roomId = roomId;


                await Room.findOrCreate({
                    where: {id: roomId},
                    defaults: {userId: ws.user.id}
                })

                if (!rooms.has(roomId)) {
                    rooms.set(roomId, new Set())
                }

                rooms.get(roomId).add(ws);
                console.log(`User ${ws.user.username} joined their room: ${roomId}`)

                // Send past messages to the user
                const pastMessages = await Message.findAll({where: {roomId}, order: [['createdAt', 'ASC']]})
                ws.send(JSON.stringify({type: 'past_messages', payload: pastMessages}))
            }
        } catch (error) {
            console.error("Authentication error:", error.message);
            return ws.close(1008, "Invalid token");
        }

        ws.on('message', (message) => handleMessage(ws, message));
        ws.on('close', () => handleDisconnect(ws))
        ws.on('error', (error) => console.error('WebSocket error: ', error));
    })

    return wss;
}

async function handleMessage(ws, rawMessage) {
    try {
        const data = JSON.parse(rawMessage);
        switch (data.type) {
            case 'join_room':
                if (ws.user.role === 'callcenter') {
                    const {roomId} = data;
                    ws.roomId = roomId;
                    if (!rooms.has(roomId)) {
                        rooms.set(roomId, new Set())
                    }
                    rooms.get(roomId).add(ws)

                    const pastMessages = await Message.findAll({where: {roomId}, order: [['createdAt', 'ASC']]})
                    ws.send(JSON.stringify({type: 'past_messages', payload: pastMessages}))

                    console.log(`Call center member ${ws.user.username} joined room: ${roomId}`);
                }
                break
            case 'chat_message':
                const {roomId, message} = data;
                const savedMessage = await Message.create({
                    roomId,
                    senderId: ws.user.id,
                    senderRole: ws.user.role,
                    message,
                })
                broadcast(roomId, {type: 'new_message', payload: savedMessage})
                break;
        }
    } catch (error) {
        console.error("Failed to handle message")
    }
}

function handleDisconnect(ws) {
    console.log(`Client disconnected: ${ws.user ? ws.user.username : 'Unknown'}`)
    if (ws.roomId && rooms.has(ws.roomId)) {
        rooms.get(ws.roomId).delete(ws);
        if (rooms.get(ws.roomId).size === 0) {
            rooms.delete(ws.roomId);
            console.log(`Room ${ws.roomId} is now empty and removed from memory.`);
        }
    }
}

function broadcast(roomId, data) {
    const roomClients = rooms.get(roomId);
    if (roomClients) {
        const messageString = JSON.stringify(data);
        roomClients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(messageString)
            }
        })
    }
}

export function closeRoom(roomId) {
    const roomClients = rooms.get(roomId)
    if (roomClients) {
        broadcast(roomId, {type: 'chat_completed', message: 'This chat has been closed by an operator.'})
        roomClients.forEach(client => client.close(1000, 'Chat completed'));
        rooms.delete(roomId);
        console.log(`WebSocket connections for room ${roomId} have been closed.`);
    }
}