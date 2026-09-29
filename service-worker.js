self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error("Push通知データの読み込みに失敗しました:", error);
  }

  const title = data.title || "リモート呼び出しシステム";
  const options = {
    body: data.body || "新しい呼び出しがあります。",
    icon: data.icon || undefined,
    badge: data.badge || undefined,
    tag: data.tag || "remote-calling"
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
