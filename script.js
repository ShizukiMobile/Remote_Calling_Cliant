let socket;
let currentRoomId = null;

function updateStatus(connected, roomId) {
  const statusElem = document.getElementById("connectionStatus");
  const roomElem = document.getElementById("roomId");

  statusElem.innerText = connected ? "接続中" : "切断";
  statusElem.style.color = connected ? "lightgreen" : "red";
  roomElem.innerText = connected ? roomId : "接続待ち";
}

// WebSocket サーバーへ接続する関数
function connectToServer(roomId) {
  socket = new WebSocket("wss://remote-calling-for-school.onrender.com"); // ← RenderのURLに合わせる

  socket.addEventListener("open", () => {
    currentRoomId = roomId;
    socket.send(JSON.stringify({ type: "join", room: roomId }));
    updateStatus(true, roomId);  // 接続成功
  });

  socket.addEventListener("close", () => {
    updateStatus(false);         // 切断された
    currentRoomId = null;
  });

  socket.addEventListener("error", () => {
    updateStatus(false);         // エラーも切断とみなす
    currentRoomId = null;
  });

  // サーバーからのメッセージ処理
  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    // ここで呼び出し通知などの処理を入れていく
  });

function joinRoom() {
  const roomId = document.getElementById("roomInput").value.trim();
  if (roomId) {
    connectToServer(roomId);
  }
} 
}
