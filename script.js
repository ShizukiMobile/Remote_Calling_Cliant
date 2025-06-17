let socket;
let currentRoomId = null;
let connectErrorCount = 0;
const maxReconnectAttempts = 5;

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
    timeout: 75000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 5000,
    reconnectionDelayMax: 5000
  });

  function logWithTimestamp(message, ...optionalParams) {
  const now = new Date();
  const timestamp = now.toLocaleString();  // 例: "2025/6/6 14:30:15"
  console.log(`[${timestamp}] ${message}`, ...optionalParams);
}

  function errorWithTimestamp(message, ...optionalParams) {
  const now = new Date();
  const timestamp = now.toLocaleString();
  console.error(`[${timestamp}] ${message}`, ...optionalParams);
}
  
  socket.on("connect", () => {
    logWithTimestamp("接続成功:", socket.id);
    currentRoomId = roomId;
    socket.emit("join-room", roomId);
    // document.getElementById("callBtn").disabled = false;
    updateStatus(true, roomId);
    showStatusNotification("接続しました。", "#adff2f", "#7cbf1c", 5000, "connect");
    connectErrorCount = 0;
  });

  socket.on("disconnect", () => {
    showStatusNotification("サーバーから切断されました。5秒後に自動で再接続処理を開始します。<br>自動的に再接続されない場合、インターネット接続を確認してください。<br>(再接続には、通常30秒から1分ほどかかります。)", "#FFFF70", "#ffff00", 30000, "disconnect");
    logWithTimestamp("サーバーから切断されました");
    updateStatus(false);
    /*socket = null;
    currentRoomId = null;*/
  });

  socket.on("connect_error", (err) => {
    showStatusNotification("接続エラーが発生しました。5秒後に自動で再接続処理を開始します。<br>インターネットに接続されていることを確認してください。<br>(WebSocket通信に非対応のブラウザを使用しているか、ご使用のインターネット環境でWebSocket通信がブロックされていると、接続できない場合があります。)", "#dc143c", "#b22222", 15000, "#ffffff", "connect_error");
    errorWithTimestamp("接続エラー:", err);
    connectErrorCount++;
    updateStatus(false);
    // currentRoomId = null;

    if (connectErrorCount >= maxReconnectAttempts) {
    showStatusNotification("再接続の上限回数に達したため、自動での再接続を中止しました。<br>インターネットに接続されていることを確認して、もう一度ルームに参加してください。<br>何度もこのエラーが表示される場合、ページを再読み込みしてください。", "#dc143c", "#b22222", 30000, "#ffffff", "connect_error");
    socket.disconnect(); // 再接続ループを終了
    updateStatus(false);
  } /*else {
    showStatusNotification(`接続エラーが発生しました。${connectErrorCount}回目`, "#ffff99", "#ffcc00", 10000, "#000", "connect_error_retry");
  }*/
    
  });

/*socket.on("reconnect_failed", () => {
    showStatusNotification("再接続の上限回数に達したため、自動での再接続を中止しました。<br>インターネットに接続されていることを確認して、もう一度ルームに参加してください。<br>何度もこのエラーが表示される場合、ページを再読み込みしてください。", "#dc143c", "#b22222", 30000, "#ffffff", "reconnect_failed");
    errorWithTimestamp("再接続の上限回数に到達しました");
    updateStatus(false);
  });*/

  socket.on("call", () => {
    logWithTimestamp("呼び出しを受信しました！");
    // 通知音を即再生
    const audio = document.getElementById("callSound");
    audio.play();

    showStatusNotification("呼び出しを受信しました！", "#FFFF70", "#ffff00", 5000, "calling");
});
}

function showStatusNotification(message, backgroundColor, borderColor = null, duration = null,  textColor = "#000") {
  const container = document.getElementById("statusNotificationContainer");

  // 🌟 既に表示中の通知をすべて削除（これにより「最後の通知のみ」になる）
  container.innerHTML = "";

  const div = document.createElement("div");
  div.className = "status-notification";
  div.style.backgroundColor = backgroundColor;
  div.style.border = `2.5px solid ${borderColor}`;
  div.style.color = textColor;
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
    showStatusNotification("ルームに参加していないため、呼び出しに失敗しました。<br>ルームに参加して、もう一度呼び出し操作を行ってください。<br>接続状態と現在参加しているルームのルームIDは、画面右上の表示で確認できます。", "#dc143c", "#b22222", 15000, "#ffffff");
    errorEl.textContent = "ルームに参加していないため呼び出しできません。ルームに再参加してやり直してください。";
    errorEl.style.display = "block";
    return;
  }

  if (!socket || !socket.connected) {
    showStatusNotification("インターネットに接続されていないため、呼び出しに失敗しました。<br>インターネットに正常に接続できていて、正しいルームに参加しているか確認してください。<br>接続状態と現在参加しているルームのルームIDは、画面右上の表示で確認できます。", "#dc143c", "#b22222", 20000, "#ffffff");
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
    showStatusNotification("ルームIDを空白にしたまま接続することはできません。", "#dc143c", "#b22222", 5000, "#ffffff", "emptyRoomId");
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
