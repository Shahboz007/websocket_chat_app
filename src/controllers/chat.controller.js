import db from '../models/index.js';
import {closeRoom} from '../services/websocket.js';


const {Room, User} = db;

export const getActiveChats = async (req, res) => {
    try {
        const activeRooms = await Room.findAll({
            where: {status: 'active'},
            include: [{
                model: User,
                attributes: ['id', 'username'],
                required: true
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(activeRooms);
    } catch (error) {

        console.error("Error fetching active chats:", error);
        res.status(500).json({message: "Failed to fetch active chats due to a server error."});
    }
};

export const completeChat = async (req, res) => {
    const {roomId} = req.body;
    if (!roomId) {
        return res.status(400).json({message: "roomId is required."});
    }
    try {
        const room = await Room.findByPk(roomId);
        if (!room) {
            return res.status(404).json({message: "Room not found."});
        }

        // Delete all messages for this room before deleting the room
        await db.Message.destroy({ where: { roomId } });
        await room.destroy();

        closeRoom(roomId);

        res.json({message: `Chat room ${roomId} has been successfully completed and deleted.`});
    } catch (error) {
        console.error(`Error completing chat for room ${roomId}:`, error);
        res.status(500).json({message: "Internal server error."});
    }
};