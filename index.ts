import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { rejectUnAuthenticated, validateTokens } from "./middlewares/auth";
import authRouter from "./routes/auth";
import errorRouter from "./routes/error";
import { isAuthenticated } from "./utils/AuthUtils";

const app: express.Application = express();
const port: number = Number(process.env.PORT) || 3000;

var options = {
    root: path.resolve("./public")
};  

// App level Middlewares
app.disable("x-powered-by");
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: false}));

// Authentication Middleware ------------------------
// none so far

// Routes
app.get('/', validateTokens, (_req, _res) => {
    if (!isAuthenticated(_res)) {
      _res.redirect('/register');
      return;
    }
    _res.redirect('/home');
    return;
});

app.get('/home', validateTokens, rejectUnAuthenticated, (_req, _res, next) => {
    _res.sendFile('home.html', options);  
    return;
});  

app.use("/", authRouter);
app.use(errorRouter);

// Server setup
const server = http.createServer(app);

// WebSocket Server Setup
const SocketIO = new Server(server);

// SocketIO Events
SocketIO.on('connection', (socket) => {
    console.log("A new user connected!");
});

server.listen(port, () => {
    console.log(`YourChatsV2: http://localhost:${port}/`);
});