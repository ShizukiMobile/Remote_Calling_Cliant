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
  socket = io("https://remote-calling-for-school.onrender.com");

  socket.on("connect", () => {
    console.log("接続成功:", socket.id);
    currentRoomId = roomId;
    socket.emit("join-room", roomId);
    document.getElementById("callBtn").disabled = false;
    updateStatus(true, roomId);
  });

  socket.on("disconnect", () => {
    console.log("切断されました");
    updateStatus(false);
    currentRoomId = null;
  });

  socket.on("connect_error", (err) => {
    console.error("接続エラー:", err);
    updateStatus(false);
    currentRoomId = null;
  });

  socket.on("call", () => {
    console.log("呼び出しを受信しました！");
    alert("呼び出しが届きました！");
    const audio = document.getElementById("callSound");
    if (audio) {
      audio.play().catch((e) => console.log("音声再生エラー:", e));
    }
  });
}

// 呼び出しを送信
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
    saveRoomId(roomId);
    updateRoomList();
  }
}

function saveRoomId(roomId) {
  let roomIds = JSON.parse(localStorage.getItem("roomIds") || "[]");
  if (!roomIds.includes(roomId)) {
    roomIds.push(roomId);
    localStorage.setItem("roomIds", JSON.stringify(roomIds));
  }
}

function updateRoomList() {
  const datalist = document.getElementById("roomList");
  datalist.innerHTML = "";
  const roomIds = JSON.parse(localStorage.getItem("roomIds") || "[]");
  roomIds.forEach(id => {
    const option = document.createElement("option");
    option.value = id;
    datalist.appendChild(option);
  });
}

// 初期化処理
updateRoomList();
