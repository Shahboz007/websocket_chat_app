import * as http from "node:http";
import app from "./src/app.js";
import {initializeWebSocket} from "./src/services/websocket.js";
import db from "./src/models/index.js";


const server = http.createServer(app)

const wss = initializeWebSocket(server);
app.set('wss', wss)

const PORT = process.env.PORT;

db.sequelize.sync({force: false})
    .then(() => {
        console.log('Database synchronized.')
        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        })
    }).catch(error => {
    console.error('Error synchronizing the database: ', error)
})
