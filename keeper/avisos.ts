// Keeper off-chain de la Llave de Emergencia: lee el contrato en Fuji cada INTERVALO_MS y avisa por Telegram.
// No hay cron on-chain: el contrato usa block.timestamp y este script avisa antes de que venza.
import { createPublicClient, formatEther, getContract, http, isAddress, type Address } from 'viem'
import { avalancheFuji } from 'viem/chains'
import { FASES, llaveAbi } from './abi.ts'
import { cargarEnv, env, parsearPares } from './env.ts'
import { enviarTelegram } from './telegram.ts'

cargarEnv()

const direccionLlave = env('LLAVE_ADDRESS')
if (!isAddress(direccionLlave)) {
  console.error('LLAVE_ADDRESS falta o no es una dirección válida. Copiá .env.example a .env y completalo.')
  process.exit(1)
}
const LLAVE_ADDRESS: Address = direccionLlave
const WEB_URL = env('WEB_URL', 'http://localhost:5173').replace(/\/$/, '')
const CHAT_DUENO = env('TELEGRAM_CHAT_ID_DUENO')
const INTERVALO_MS = Math.max(1000, Number(env('INTERVALO_MS', '5000')) || 5000)
const UMBRALES = env('UMBRALES_SEGUNDOS', '30,10').split(',').map(Number).filter((n) => n > 0).sort((a, b) => b - a)
const chatsHerederos = parsearPares(env('TELEGRAM_CHAT_ID_HEREDEROS')) // alias → chat_id
const aliases = new Map([...parsearPares(env('ALIAS'))].map(([alias, cuenta]) => [cuenta.toLowerCase(), alias])) // 0x… → alias
const NIVEL_KUMPLY_VERIFICADO = 2
const MAX_BLOQUES_POR_LOGS = 2000n // el RPC público de Fuji corta eth_getLogs en 2048 bloques

const client = createPublicClient({ chain: avalancheFuji, transport: http(env('FUJI_RPC_URL', 'https://api.avax-test.network/ext/bc/C/rpc')) })
const llave = getContract({ address: LLAVE_ADDRESS, abi: llaveAbi, client })

const hora = (ts?: bigint | number) => new Date(ts === undefined ? Date.now() : Number(ts) * 1000).toLocaleTimeString('es-AR', { hour12: false })
const log = (...partes: unknown[]) => console.log(hora(), ...partes)
const alias = (cuenta: Address, porDefecto = `${cuenta.slice(0, 6)}…${cuenta.slice(-4)}`) => aliases.get(cuenta.toLowerCase()) ?? porDefecto
const avisarDueno = (texto: string) => enviarTelegram(CHAT_DUENO, texto)

// Memoria de la corrida, para no repetir avisos.
const avisados = new Set<string>() // `${ultimaSenal}:${umbral}` y `${ultimaSenal}:vencida`
const kumplyAvisado = new Set<string>() // herederos a los que ya les pedimos verificarse
const kumplyVerificado = new Set<string>() // herederos que ya vimos verificados
let ultimoBloque = await client.getBlockNumber()

async function ciclo() {
  const bloque = await client.getBlockNumber()
  const e = await llave.read.estado()
  const ahora = Number(e.ahora) // hora de la cadena, no Date.now()
  const faltan = Number(e.venceEn) - ahora
  const aliasDueno = alias(e.dueno, 'Marta')
  const clave = (sufijo: string | number) => `${e.ultimaSenal}:${sufijo}`

  // 1. Cuenta regresiva: un aviso por umbral y por señal de vida. Si arrancamos tarde, un solo mensaje por los umbrales ya pasados.
  if (faltan > 0) {
    const pendientes = UMBRALES.filter((u) => faltan <= u && !avisados.has(clave(u)))
    pendientes.forEach((u) => avisados.add(clave(u)))
    if (pendientes.length) await avisarDueno(`⏳ ${aliasDueno}, te quedan ${faltan} s para tocar "Estoy bien". ${WEB_URL}/dueno`)
  }

  // 2. Venció: una sola vez por señal de vida.
  if (e.fase === 1 && !avisados.has(clave('vencida'))) {
    avisados.add(clave('vencida'))
    await avisarDueno(`⚠️ ${aliasDueno}, tu Llave venció: cualquier heredero verificado ya puede iniciar un reclamo. Tocá "Estoy bien" para cancelarlo. ${WEB_URL}/dueno`)
  }

  // 3. Eventos nuevos desde el último bloque visto.
  if (bloque > ultimoBloque) {
    let desde = ultimoBloque + 1n
    if (bloque - desde > MAX_BLOQUES_POR_LOGS) {
      log(`⚠️ me quedé ${bloque - desde} bloques atrás, salteo hasta ${bloque - MAX_BLOQUES_POR_LOGS}`)
      desde = bloque - MAX_BLOQUES_POR_LOGS
    }
    const eventos = await client.getContractEvents({ address: LLAVE_ADDRESS, abi: llaveAbi, fromBlock: desde, toBlock: bloque, strict: true })
    for (const ev of eventos) {
      if (ev.eventName === 'ReclamoIniciado') {
        const segundos = Math.max(0, Number(ev.args.graciaTerminaEn) - ahora)
        await avisarDueno(`🚨 ${alias(ev.args.heredero)} inició un reclamo sobre tu Llave. Tenés hasta ${hora(ev.args.graciaTerminaEn)} (${segundos} s) para cancelarlo tocando "Estoy bien". ${WEB_URL}/dueno`)
      } else if (ev.eventName === 'ReclamoCancelado') {
        await avisarDueno('✅ Reclamo cancelado: diste señal de vida.')
      } else if (ev.eventName === 'SenalDeVida') {
        log(`💚 Señal de vida de ${alias(ev.args.dueno, 'Marta')} a las ${hora(ev.args.cuando)} (base emergencia ${formatEther(ev.args.baseEmergencia)} AVAX)`)
      }
    }
    ultimoBloque = bloque
  }

  // 4. KUMPLY: a cada heredero sin verificar le avisamos una vez por corrida; si se verifica, lo logueamos.
  for (const h of await llave.read.herederos()) {
    const verificado = await llave.read.isPersonAtLeast([h.cuenta, NIVEL_KUMPLY_VERIFICADO])
    const id = h.cuenta.toLowerCase()
    const nombre = alias(h.cuenta)
    if (verificado) {
      if (!kumplyVerificado.has(id)) {
        kumplyVerificado.add(id)
        log(`🪪 ${nombre} está verificado en KUMPLY${kumplyAvisado.has(id) ? ' (ya le habíamos avisado)' : ''}`)
      }
    } else if (!kumplyAvisado.has(id)) {
      kumplyAvisado.add(id)
      const texto = `🪪 ${nombre}, tu parte (${h.bps / 100}%) te espera en la Llave de ${aliasDueno}, pero para cobrarla tenés que verificar tu identidad. ${WEB_URL}/heredero`
      const chat = chatsHerederos.get(nombre)
      await (chat ? enviarTelegram(chat, texto) : avisarDueno(`[para ${nombre}] ${texto}`))
    }
  }

  // 5. Una línea por ciclo.
  const reclamo = e.reclamoIniciadoEn > 0n ? `sí (gracia hasta ${hora(e.graciaTerminaEn)})` : 'no'
  log(`fase=${FASES[e.fase] ?? e.fase} faltan=${faltan}s saldo=${formatEther(e.saldo)} AVAX reclamo=${reclamo}`)
}

// Loop principal: un fallo de RPC no lo mata; Ctrl+C lo apaga limpio.
let corriendo = true
let despertar = () => {}
process.on('SIGINT', () => {
  corriendo = false
  despertar()
  console.log('\nChau, keeper apagado.')
})

log(`Vigilando la Llave ${LLAVE_ADDRESS} en Fuji desde el bloque ${ultimoBloque} (cada ${INTERVALO_MS} ms, umbrales ${UMBRALES.join('/')} s)`)
if (!process.env.TELEGRAM_BOT_TOKEN) log('Sin TELEGRAM_BOT_TOKEN: modo seco, los avisos se imprimen por consola.')
else if (!CHAT_DUENO) log('⚠️ Falta TELEGRAM_CHAT_ID_DUENO: los avisos a la dueña no se van a poder mandar (corré `npm run chat-id`).')

while (corriendo) {
  try {
    await ciclo()
  } catch (err) {
    const detalle = (err as { shortMessage?: string }).shortMessage ?? (err instanceof Error ? err.message : String(err))
    console.error(hora(), 'falló el ciclo, sigo igual:', detalle)
  }
  if (corriendo) {
    await new Promise<void>((resolver) => {
      const timer = setTimeout(resolver, INTERVALO_MS)
      despertar = () => {
        clearTimeout(timer)
        resolver()
      }
    })
  }
}
