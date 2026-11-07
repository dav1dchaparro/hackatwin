// Bot API de Telegram con fetch, sin dependencias. Sin token, los avisos se imprimen por consola (modo seco).
const API = 'https://api.telegram.org'

type Respuesta<T> = { ok: true; result: T } | { ok: false; error_code?: number; description?: string }

/** Llama a un método de la Bot API y devuelve `result`. Tira error si Telegram responde ok=false. */
export async function llamarTelegram<T>(metodo: string, cuerpo: Record<string, unknown> = {}): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('Falta TELEGRAM_BOT_TOKEN')
  const res = await fetch(`${API}/bot${token}/${metodo}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
  const data = (await res.json()) as Respuesta<T>
  if (!data.ok) throw new Error(`Telegram ${metodo} → ${data.error_code ?? res.status}: ${data.description ?? 'sin detalle'}`)
  return data.result
}

/** Manda un texto a un chat. Nunca tira: loguea el error y sigue. */
export async function enviarTelegram(chatId: string, texto: string): Promise<void> {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log(`[sin token] → ${chatId || '?'}: ${texto}`)
    return
  }
  if (!chatId) {
    console.error(`[telegram] falta chat_id, no se envió: ${texto}`)
    return
  }
  try {
    await llamarTelegram('sendMessage', { chat_id: chatId, text: texto, disable_web_page_preview: true })
    console.log(`[telegram] → ${chatId}: ${texto}`)
  } catch (err) {
    console.error('[telegram] no se pudo enviar:', err instanceof Error ? err.message : err)
  }
}
