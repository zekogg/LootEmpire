export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/telegram-webhook" && request.method === "POST") {
      return handleTelegram(request, env, url);
    }

    return new Response("Not found", { status: 404 });
  },
};

async function handleTelegram(request, env, url) {
  // تليكرام يرسل السرّ المضبوط في setWebhook داخل هذا الـ header مع كل تحديث
  if (!env.TELEGRAM_WEBHOOK_SECRET ||
      request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const update = await request.json();
    const msg = update.message;

    if (msg && typeof msg.text === "string" && msg.text.startsWith("/start")) {
      await tg(env, "sendMessage", {
        chat_id: msg.chat.id,
        text: "Welcome to LootEmpire! 👑",
        reply_markup: {
          inline_keyboard: [[{ text: "▶️ Play", web_app: { url: url.origin } }]],
        },
      });
    }
  } catch (e) {
    console.error(e);
  }

  // نرد دائماً بـ 200 حتى لا يعيد تليكرام إرسال نفس التحديث
  return new Response("OK");
}

function tg(env, method, body) {
  return fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
