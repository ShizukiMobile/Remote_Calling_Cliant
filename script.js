let socket;
let currentRoomId = null;

function updateStatus(connected, roomId) {
  const statusElem = document.getElementById("connectionStatus");
  const roomElem = document.getElementById("roomId");

  statusElem.innerText = connected ? "接続中" : "切断";
  statusElem.style.color = connected ? "lightgreen" : "red";
  roomElem.innerText = connected ? roomId : "接続待ち";
}

// サーバーに接続する関数
function connectToServer(roomId) {
  // Socket.IOで接続
  socket = io("https://remote-calling-for-school.onrender.com");

  // 接続成功時
  socket.on("connect", () => {
    console.log("接続成功:", socket.id);
    currentRoomId = roomId;
    socket.emit("join-room", roomId);  // ルーム参加を通知
    document.getElementById("callBtn").disabled = false;
    updateStatus(true, roomId);
  });

  // 切断時
  socket.on("disconnect", () => {
    console.log("切断されました");
    updateStatus(false);
    currentRoomId = null;
  });

  // エラー時
  socket.on("connect_error", (err) => {
    console.error("接続エラー:", err);
    updateStatus(false);
    currentRoomId = null;
  });

  // 呼び出し受信時
  socket.on("call", () => {
    console.log("呼び出しを受信しました！");
    // ここで通知音を鳴らしたり、UIを変えたりできる
    alert("呼び出しが届きました！");
  });
}

// ボタンから呼び出しを送る関数（必要に応じて呼び出しボタンに使う）
function sendCall() {
  if (socket && currentRoomId) {
    socket.emit("call", currentRoomId);
  }
}

// 入力からルームIDを取得して接続する
function joinRoom() {
  const roomId = document.getElementById("roomInput").value.trim();
  if (roomId) {
    connectToServer(roomId);
  }
}
