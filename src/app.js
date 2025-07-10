import express from "express";
import {fileURLToPath} from "url";
import authRoute from "./routes/auth.route.js";
import chatRoute from "./routes/chat.route.js";
import path from "path"
import authMiddleware from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))

// View engine setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Page-serving Routes
app.get('/', (req, res) => res.render('index'))
app.get('/user/login', (req, res) => res.render('user_login'))
app.get('/user/register', (req, res) => res.render('user_register', { title: 'User Registration' }));
app.get('/user/chat', (req, res) => res.render('user_chat'))
app.get('/callcenter/login', (req, res) => res.render('callcenter_login'));
app.get('/callcenter/register', (req, res) => res.render('callcenter_register', { title: 'Call Center Registration' }));
app.get('/callcenter/dashboard', (req, res) => res.render('callcenter_dashboard'));

// API Routes
app.use('/api/auth', authRoute)

// Protect chat routes with authentication middleware
app.use('/api/chats', authMiddleware, chatRoute)

export default app;
