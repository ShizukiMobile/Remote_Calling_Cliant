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
  socket = io("https://remote-calling-for-school.onrender.com", {
    transports: ['websocket'], // WebSocketのみを使用
    timeout: 60000
  });
  
  socket.on("connect", () => {
    console.log("接続成功:", socket.id);
    currentRoomId = roomId;
    socket.emit("join-room", roomId);
    // document.getElementById("callBtn").disabled = false;
    updateStatus(true, roomId);
    showStatusNotification("接続しました。", "#adff2f", "#7cbf1c", 5000, "connect");
  });

  socket.on("disconnect", () => {
    showStatusNotification("サーバーから切断されました。インターネット接続を確認して、再接続してください。", "#FFFF70", "#ffff00", 30000, "disconnect");
    console.log("サーバーから切断されました");
    updateStatus(false);
    /*socket = null;
    currentRoomId = null;*/
  });

  socket.on("connect_error", (err) => {
    showStatusNotification("接続エラーが発生しました。インターネット接続を確認してください。<br>(WebSocket通信に非対応のブラウザを使用しているか、ご使用のインターネット環境でWebSocket通信がブロックされていると、接続できない場合があります。)", "#dc143c", "#b22222", 15000, "connect_error");
    console.error("接続エラー:", err);
    updateStatus(false);
    currentRoomId = null;
  });

  socket.on("call", () => {
    console.log("呼び出しを受信しました！");
    // 通知音を即再生
    const audio = document.getElementById("callSound");
    audio.play();

    showStatusNotification("呼び出しを受信しました！", "#FFFF70", "#ffff00", 5000, "calling");
});
}

function showStatusNotification(message, backgroundColor, borderColor = null, duration = null) {
  const container = document.getElementById("statusNotificationContainer");

  // 🌟 既に表示中の通知をすべて削除（これにより「最後の通知のみ」になる）
  container.innerHTML = "";

  const div = document.createElement("div");
  div.className = "status-notification";
  div.style.backgroundColor = backgroundColor;
  div.style.border = `2.5px solid ${borderColor}`;
  div.innerHTML = message;

  // 🌟 閉じるボタンは常に追加（②対応）
  const btn = document.createElement("button");
  btn.innerText = "×";
  btn.className = "close-btn";
  btn.onclick = () => div.remove();
  div.appendChild(btn);

  container.appendChild(div);

  // 🌟 durationが指定されている場合、自動的に削除
  if (duration !== null) {
  setTimeout(() => {
    if (container.contains(div)) {
      // アニメーションを追加
      div.style.animation = "fadeOut 0.3s ease-in-out";
      div.addEventListener("animationend", () => {
        div.remove();
      }, { once: true });
    }
  }, duration);
}
}


function hideStatusNotification(key) {
  const element = document.querySelector(`.status-notification[data-key="${key}"]`);
  if (element) {
    element.style.animation = "fadeOut 0.3s ease-in-out";
    element.addEventListener("animationend", () => {
      element.remove();
    }, { once: true }); // 1回だけ実行
  }
}

// 呼び出しを送信
function sendCall() {
  const errorEl = document.getElementById("callBtnError");

  if (!currentRoomId || currentRoomId.trim() === "") {
    showStatusNotification("ルームに参加していないため、呼び出しに失敗しました。<br>ルームに参加して、もう一度呼び出し操作を行ってください。<br>接続状態と現在参加しているルームのルームIDは、画面右上の表示で確認できます。", "#dc143c", "#b22222", 15000);
    errorEl.textContent = "ルームに参加していないため呼び出しできません。ルームに再参加してやり直してください。";
    errorEl.style.display = "block";
    return;
  }

  if (!socket || !socket.connected) {
    showStatusNotification("インターネットに接続されていないため、呼び出しに失敗しました。<br>インターネットに正常に接続できていて、正しいルームに参加しているか確認してください。<br>接続状態と現在参加しているルームのルームIDは、画面右上の表示で確認できます。", "#dc143c", "#b22222", 20000);
    errorEl.textContent = "インターネットに接続されていないため呼び出しできません。接続状態を確認してください。";
    errorEl.style.display = "block";
    return;
  }

  socket.emit("call", currentRoomId);
  showStatusNotification("呼び出しを送信しました。", "#adff2f", "#7cbf1c", 5000, "sendCall");
  errorEl.style.display = "none";
}


// 入力からルームIDを取得して接続する
function joinRoom() {
  const roomId = document.getElementById("roomInput").value.trim();
  if (roomId) {
    showStatusNotification("接続しています。しばらくお待ちください。<br>(サーバーの状態によっては、数分かかることがあります。)", "#FFFF70", "#ffff00", null, "connecting");
    connectToServer(roomId);
    saveRoomId(roomId);
    updateRoomList();
  } else {
    /*currentRoomId = null;
    updateStatus(false);*/
    showStatusNotification("ルームIDを空白にしたまま接続することはできません。", "#dc143c", "#b22222", 5000, "emptyRoomId");
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

function updateCurrentTime() {
  const now = new Date();
  const formatted = now.toLocaleString("ja-JP", { hour12: false });
  const display = document.getElementById("currentTimeDisplay");
  if (display) {
    display.textContent = `現在時刻: ${formatted}`;
  }
}

updateCurrentTime(); // 初期表示
setInterval(updateCurrentTime, 1000); // 1秒ごとに更新

// 初期化処理
updateRoomList();
