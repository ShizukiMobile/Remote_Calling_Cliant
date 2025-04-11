// 状態の更新用関数（接続成功時などに呼び出す）
function updateStatus(connected, roomId) {
  const statusElem = document.getElementById("connectionStatus");
  const roomElem = document.getElementById("roomId");

  statusElem.innerText = connected ? "接続中" : "切断";
  statusElem.style.color = connected ? "lightgreen" : "red";
  roomElem.innerText = roomId || "---";
}

// 例：接続成功時に呼び出し
//updateStatus(true, "ABC123");
