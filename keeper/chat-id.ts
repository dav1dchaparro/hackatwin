// Muestra los chats que le escribieron al bot, para sacar el chat_id de la dueña y de los herederos.
// Uso: que la persona abra el bot en Telegram, mande /start, y después `npm run chat-id`.
import { cargarEnv } from './env.ts'
import { llamarTelegram } from './telegram.ts'

type Chat = { id: number; type: string; title?: string; username?: string; first_name?: string; last_name?: string }
type Mensaje = { date: number; text?: string; chat: Chat }
type Update = { update_id: number; message?: Mensaje; edited_message?: Mensaje; channel_post?: Mensaje }

cargarEnv()
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('Falta TELEGRAM_BOT_TOKEN en keeper/.env (creá el bot con @BotFather, ver README).')
  process.exit(1)
}

const updates = await llamarTelegram<Update[]>('getUpdates', { limit: 100 })

// Un renglón por chat, con el último texto que mandó.
const chats = new Map<number, { chat: Chat; texto: string; cuando: number }>()
for (const u of updates) {
  const m = u.message ?? u.edited_message ?? u.channel_post
  if (!m) continue
  const previo = chats.get(m.chat.id)
  if (!previo || m.date >= previo.cuando) chats.set(m.chat.id, { chat: m.chat, texto: m.text ?? '(sin texto)', cuando: m.date })
}

if (chats.size === 0) {
  console.log('Todavía nadie le escribió al bot. Abrilo en Telegram, mandale /start y volvé a correr `npm run chat-id`.')
  console.log('(Telegram solo guarda los últimos mensajes; si pasó mucho tiempo, mandá otro.)')
  process.exit(0)
}

console.log(`Chats que hablaron con el bot (${chats.size}):\n`)
for (const { chat, texto, cuando } of chats.values()) {
  const nombre = chat.title ?? [chat.first_name, chat.last_name].filter(Boolean).join(' ')
  const usuario = chat.username ? ` (@${chat.username})` : ''
  const fecha = new Date(cuando * 1000).toLocaleString('es-AR', { hour12: false })
  console.log(`  chat_id=${chat.id}  ${nombre}${usuario}  [${chat.type}]  último: "${texto}"  ${fecha}`)
}
console.log('\nPegá el chat_id de la dueña en TELEGRAM_CHAT_ID_DUENO y los de los herederos en TELEGRAM_CHAT_ID_HEREDEROS (alias=chat_id, separados por coma).')
