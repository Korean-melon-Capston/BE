// routes/ws_Routes.js

import { WebSocketServer } from "ws";
import { handleClientConnection } from "../controllers/ws_Controller.js";

export function initWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (clientSocket) => {
    handleClientConnection(clientSocket);
  });
}