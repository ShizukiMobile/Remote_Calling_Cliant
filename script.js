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
    showStatusNotification("接続しました", "#adff2f", 5000, "connect");
  });

  socket.on("disconnect", () => {
    showStatusNotification("切断されました", "#ffff00", 30000, "disconnect");
    console.log("切断されました");
    updateStatus(false);
    currentRoomId = null;
  });

  socket.on("connect_error", (err) => {
    showStatusNotification("接続エラーが発生しました", "#dc143c", 15000, "connect_error");
    console.error("接続エラー:", err);
    updateStatus(false);
    currentRoomId = null;
  });

  socket.on("call", () => {
    console.log("呼び出しを受信しました！");
     // 通知音を即再生
  const audio = document.getElementById("callSound");
  audio.play();

  // 通知メッセージを表示
  const notification = document.getElementById("notification");
  notification.classList.remove("hidden");

  // 数秒後に自動で非表示にする
  setTimeout(() => {
    notification.classList.add("hidden");
  }, 5000);  // 5秒後に非表示
});
}

let activeNotifications = {};  // 通知を識別するマップ

function showStatusNotification(message, color, duration = null, id = null) {
  const container = document.getElementById("statusNotificationContainer");

  // すでに同じIDの通知が存在すれば削除
  if (id && activeNotifications[id]) {
    activeNotifications[id].remove();
    delete activeNotifications[id];
  }

  const div = document.createElement("div");
  div.className = "status-notification";
  div.style.backgroundColor = color;
  div.innerText = message;

  // 閉じるボタン（常に追加する仕様に変更）
  const btn = document.createElement("button");
  btn.innerText = "×";
  btn.className = "close-btn";
  btn.onclick = () => {
    div.remove();
    if (id) delete activeNotifications[id];
  };
  div.appendChild(btn);

  container.appendChild(div);

  if (id) {
    activeNotifications[id] = div;
  }

  // 指定時間後に自動で非表示
  if (duration !== null) {
    setTimeout(() => {
      if (div.parentNode) div.remove();
      if (id) delete activeNotifications[id];
    }, duration);
  }
}


// 呼び出しを送信
function sendCall() {
  if (socket && currentRoomId) {
    socket.emit("call", currentRoomId);
    showStatusNotification("呼び出しを送信しました", "#adff2f", 5000, "sendCall");
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
