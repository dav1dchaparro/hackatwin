import { parseAbi } from 'viem'

// ABI mínimo de la Llave de Emergencia: solo lo que el keeper necesita leer y escuchar.
export const llaveAbi = parseAbi([
  'struct Estado { address dueno; uint8 fase; uint256 saldo; uint64 ultimaSenal; uint64 venceEn; uint64 reclamoIniciadoEn; uint64 graciaTerminaEn; uint256 foto; uint256 emergenciaDisponible; uint256 cantidadEmergencias; uint64 ahora; }',
  'struct Heredero { address cuenta; uint16 bps; }',
  'function estado() view returns (Estado)',
  'function herederos() view returns (Heredero[])',
  'function isPersonAtLeast(address cuenta, uint32 nivel) view returns (bool)',
  'event ReclamoIniciado(address indexed heredero, uint64 graciaTerminaEn)',
  'event ReclamoCancelado(uint64 cuando)',
  'event SenalDeVida(address indexed dueno, uint64 cuando, uint256 baseEmergencia)',
])

// Fases del contrato, en el orden del enum de Solidity.
export const FASES = ['Activa', 'Vencida', 'EnGracia', 'Ejecutable', 'Repartiendo'] as const
