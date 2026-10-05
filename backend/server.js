require("dns").setServers(["8.8.8.8"]);

require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const queueModel = require("./src/Models/queue.model");
const queueEntryModel = require("./src/Models/queueEntry.model");

const connectDB = require("./src/Config/db");

const httpServer = http.createServer(app);


const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
});

app.set("io",io)

io.use((socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("Authentication required"));
    }

    const cookies = cookie.parseCookie(cookieHeader);
    const token = cookies.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;

    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-queue-room", async (queueId) => {
  try {
    console.log(`Socket ${socket.id} requested queue room ${queueId}`);

    const queue = await queueModel.findById(queueId);

    if (!queue) {
      console.log("Queue not found");
      return;
    }

    const isAdmin = queue.admin.toString() === socket.user.id;

    if (isAdmin) {
      socket.join(queueId);

      console.log(
        `Admin socket ${socket.id} joined queue room ${queueId}`
      );

      return;
    }

    const queueEntry = await queueEntryModel.findOne({
      queue: queueId,
      user: socket.user.id,
      status: {
        $in: ["WAITING", "SERVING"],
      },
    });

    if (!queueEntry) {
      console.log(
        `User ${socket.user.id} is not authorized for queue ${queueId}`
      );

      return;
    }

    socket.join(queueId);

    console.log(
      `User socket ${socket.id} joined queue room ${queueId}`
    );

  } catch (error) {
    console.log(
      "Unable to join queue room:",
      error.message
    );
  }
});

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

async function startServer() {
  await connectDB();

  httpServer.listen(process.env.PORT,"0.0.0.0", () => {
    console.log(
      `Queueless API is running on ${process.env.PORT} port`
    );
  });
}

startServer();