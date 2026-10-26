const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const rooms = new Map();
const clientInfo = new Map();
const MAX_PLAYERS = 10;

function send(ws, data) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}
function codeForRoom() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code;
  do {
    code = Array.from({length: 5}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (rooms.has(code));
  return code;
}
function broadcast(room, data, except) {
  for (const player of room.players.values()) {
    if (player.ws !== except) send(player.ws, data);
  }
}
function publicPlayer(p) {
  return { id: p.id, x: p.x, z: p.z, yaw: p.yaw, health: p.health };
}
function leaveRoom(ws) {
  const info = clientInfo.get(ws);
  if (!info || !info.code) return;
  const room = rooms.get(info.code);
  if (!room) return;
  room.players.delete(info.id);
  clientInfo.set(ws, {...info, code: null});
  broadcast(room, {type: "player-left", id: info.id, count: room.players.size});
  if (room.players.size === 0) rooms.delete(info.code);
}
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  if (pathname === "/health") {
    res.writeHead(200, {"content-type":"application/json","cache-control":"no-store"});
    return res.end(JSON.stringify({ok:true,service:"reinos-de-pucela-online",rooms:rooms.size}));
  }
  let file = pathname === "/" ? "index.html" : decodeURIComponent(pathname).replace(/^\/+/, "");
  const resolved = path.resolve(PUBLIC_DIR, file);
  if (!resolved.startsWith(PUBLIC_DIR + path.sep) && resolved !== path.join(PUBLIC_DIR, "index.html")) {
    res.writeHead(403); return res.end("Forbidden");
  }
  fs.readFile(resolved, (err, data) => {
    if (err) { res.writeHead(404, {"content-type":"text/plain; charset=utf-8"}); return res.end("No encontrado"); }
    const ext = path.extname(resolved);
    const types = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".png":"image/png",".svg":"image/svg+xml"};
    res.writeHead(200, {"content-type":types[ext] || "application/octet-stream","cache-control":ext===".html"?"no-cache":"public, max-age=3600"});
    res.end(data);
  });
});
const wss = new WebSocket.Server({server, path:"/ws", maxPayload:2048});
wss.on("connection", ws => {
  const id = Math.random().toString(36).slice(2, 10);
  clientInfo.set(ws, {id, code:null});
  ws.on("message", raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    const info = clientInfo.get(ws);
    if (!info) return;
    if (msg.type === "create") {
      leaveRoom(ws);
      const code = codeForRoom();
      const room = {hostId:id, players:new Map()};
      const player = {id, ws, x:0, z:2, yaw:0, health:100};
      room.players.set(id, player); rooms.set(code, room);
      clientInfo.set(ws, {id, code});
      send(ws, {type:"created", id, code, count:1, players:[]});
      return;
    }
    if (msg.type === "join") {
      const code = String(msg.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
      const room = rooms.get(code);
      if (!room) return send(ws, {type:"error", message:"No existe esa sala. Pide un código nuevo al anfitrión."});
      if (room.players.size >= MAX_PLAYERS) return send(ws, {type:"full"});
      leaveRoom(ws);
      const player = {id, ws, x:0, z:2, yaw:0, health:100};
      const players = [...room.players.values()].map(publicPlayer);
      room.players.set(id, player);
      clientInfo.set(ws, {id, code});
      send(ws, {type:"joined", id, code, count:room.players.size, players});
      broadcast(room, {type:"player-joined", player:publicPlayer(player), count:room.players.size}, ws);
      return;
    }
    if (msg.type === "state") {
      if (!info.code) return;
      const room = rooms.get(info.code);
      const player = room && room.players.get(id);
      if (!player) return;
      const num = v => Number.isFinite(Number(v)) ? Math.max(-700, Math.min(700, Number(v))) : 0;
      player.x = num(msg.x); player.z = num(msg.z);
      player.yaw = num(msg.yaw); player.health = Math.max(0, Math.min(100, num(msg.health)));
      broadcast(room, {type:"state", player:publicPlayer(player)}, ws);
    }
  });
  ws.on("close", () => {
    const info = clientInfo.get(ws);
    if (info && info.code) {
      const room = rooms.get(info.code);
      leaveRoom(ws);
      if (room && room.hostId === id && room.players.size) {
        broadcast(room, {type:"room-closed"});
        for (const p of room.players.values()) {
          clientInfo.set(p.ws, {...clientInfo.get(p.ws), code:null});
          try { p.ws.close(); } catch {}
        }
        rooms.delete(info.code);
      }
    }
    clientInfo.delete(ws);
  });
  ws.on("error", () => {});
});
server.listen(PORT, "0.0.0.0", () => console.log(`Reinos de Pucela Online listo en el puerto ${PORT}`));
