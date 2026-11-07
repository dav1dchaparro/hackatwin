// GENERADO por contracts/script/export-abi.mjs. No editar a mano: correr `node script/export-abi.mjs`.
export const llaveAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "store",
        "type": "address",
        "internalType": "contract IKumplyAttestationStore"
      },
      {
        "name": "token_",
        "type": "address",
        "internalType": "contract IERC20"
      },
      {
        "name": "periodoMinimo_",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "c",
        "type": "tuple",
        "internalType": "struct Llave.Config",
        "components": [
          {
            "name": "dueno",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "herederos",
            "type": "address[]",
            "internalType": "address[]"
          },
          {
            "name": "bps",
            "type": "uint16[]",
            "internalType": "uint16[]"
          },
          {
            "name": "plazoInactividad",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "plazoGracia",
            "type": "uint64",
            "internalType": "uint64"
          }
        ]
      },
      {
        "name": "comisionBps_",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "tesoreria_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "BPS_TOTAL",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "COMISION_MAX_BPS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_HEREDEROS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ROL_AGENTE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "comisionBps",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "configurar",
    "inputs": [
      {
        "name": "c",
        "type": "tuple",
        "internalType": "struct Llave.Config",
        "components": [
          {
            "name": "dueno",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "herederos",
            "type": "address[]",
            "internalType": "address[]"
          },
          {
            "name": "bps",
            "type": "uint16[]",
            "internalType": "uint16[]"
          },
          {
            "name": "plazoInactividad",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "plazoGracia",
            "type": "uint64",
            "internalType": "uint64"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "depositar",
    "inputs": [
      {
        "name": "monto",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "dueno",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "esHeredero",
    "inputs": [
      {
        "name": "cuenta",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "es",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "bps",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "estado",
    "inputs": [],
    "outputs": [
      {
        "name": "e",
        "type": "tuple",
        "internalType": "struct Llave.Estado",
        "components": [
          {
            "name": "dueno",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "fase",
            "type": "uint8",
            "internalType": "enum Llave.Fase"
          },
          {
            "name": "saldo",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "ultimaSenal",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "venceEn",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "reclamoIniciadoEn",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "graciaTerminaEn",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "liberadaEn",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "totalLiberado",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "plazoInactividad",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "plazoGracia",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "comisionBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "ahora",
            "type": "uint64",
            "internalType": "uint64"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "estoyBien",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "fase",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "enum Llave.Fase"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "graciaTerminaEn",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "herederos",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct Llave.Heredero[]",
        "components": [
          {
            "name": "cuenta",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "bps",
            "type": "uint16",
            "internalType": "uint16"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "iniciarReclamo",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "isAgent",
    "inputs": [
      {
        "name": "who",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isBusiness",
    "inputs": [
      {
        "name": "who",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isPersonAtLeast",
    "inputs": [
      {
        "name": "who",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "level",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "kumply",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IKumplyAttestationStore"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "liberadaEn",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "liberar",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "parteDe",
    "inputs": [
      {
        "name": "heredero",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "periodoMinimo",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "plazoGracia",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "plazoInactividad",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "reclamoIniciadoEn",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "retirar",
    "inputs": [
      {
        "name": "a",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "monto",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "tesoreria",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "token",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalLiberado",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferirDueno",
    "inputs": [
      {
        "name": "nuevo",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "ultimaSenal",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "venceEn",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "ComisionCobrada",
    "inputs": [
      {
        "name": "tesoreria",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "monto",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Configurada",
    "inputs": [
      {
        "name": "dueno",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "herederos",
        "type": "address[]",
        "indexed": false,
        "internalType": "address[]"
      },
      {
        "name": "bps",
        "type": "uint16[]",
        "indexed": false,
        "internalType": "uint16[]"
      },
      {
        "name": "plazoInactividad",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      },
      {
        "name": "plazoGracia",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Depositado",
    "inputs": [
      {
        "name": "de",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "monto",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "DuenoTransferido",
    "inputs": [
      {
        "name": "anterior",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "nuevo",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "HerenciaEnviada",
    "inputs": [
      {
        "name": "heredero",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "monto",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Liberada",
    "inputs": [
      {
        "name": "agente",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "total",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "comision",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ReclamoCancelado",
    "inputs": [
      {
        "name": "cuando",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ReclamoIniciado",
    "inputs": [
      {
        "name": "agente",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "graciaTerminaEn",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Retirado",
    "inputs": [
      {
        "name": "a",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "monto",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SenalDeVida",
    "inputs": [
      {
        "name": "dueno",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "cuando",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "VerificadoKumply",
    "inputs": [
      {
        "name": "cuenta",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tier",
        "type": "uint32",
        "indexed": false,
        "internalType": "uint32"
      },
      {
        "name": "rol",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "CantidadHerederosInvalida",
    "inputs": [
      {
        "name": "cantidad",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ComisionInvalida",
    "inputs": [
      {
        "name": "bps",
        "type": "uint16",
        "internalType": "uint16"
      }
    ]
  },
  {
    "type": "error",
    "name": "DireccionInvalida",
    "inputs": [
      {
        "name": "cuenta",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "GraciaEnCurso",
    "inputs": [
      {
        "name": "terminaEn",
        "type": "uint64",
        "internalType": "uint64"
      }
    ]
  },
  {
    "type": "error",
    "name": "InvalidPersonLevel",
    "inputs": [
      {
        "name": "level",
        "type": "uint32",
        "internalType": "uint32"
      }
    ]
  },
  {
    "type": "error",
    "name": "KumplyStoreInvalid",
    "inputs": [
      {
        "name": "store",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "MontoInvalido",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoEsDueno",
    "inputs": [
      {
        "name": "quien",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "NotAgent",
    "inputs": [
      {
        "name": "who",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tier",
        "type": "uint32",
        "internalType": "uint32"
      }
    ]
  },
  {
    "type": "error",
    "name": "NotBusiness",
    "inputs": [
      {
        "name": "who",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tier",
        "type": "uint32",
        "internalType": "uint32"
      }
    ]
  },
  {
    "type": "error",
    "name": "NotPerson",
    "inputs": [
      {
        "name": "who",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tier",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "minLevel",
        "type": "uint32",
        "internalType": "uint32"
      }
    ]
  },
  {
    "type": "error",
    "name": "PlazoInvalido",
    "inputs": [
      {
        "name": "plazo",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "minimo",
        "type": "uint64",
        "internalType": "uint64"
      }
    ]
  },
  {
    "type": "error",
    "name": "PorcentajesInvalidos",
    "inputs": [
      {
        "name": "suma",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ReclamoYaIniciado",
    "inputs": [
      {
        "name": "iniciadoEn",
        "type": "uint64",
        "internalType": "uint64"
      }
    ]
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SafeERC20FailedOperation",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "SaldoInsuficiente",
    "inputs": [
      {
        "name": "pedido",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "disponible",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "SigueVivo",
    "inputs": [
      {
        "name": "venceEn",
        "type": "uint64",
        "internalType": "uint64"
      }
    ]
  },
  {
    "type": "error",
    "name": "SinReclamo",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SinSaldo",
    "inputs": []
  },
  {
    "type": "error",
    "name": "YaLiberada",
    "inputs": [
      {
        "name": "liberadaEn",
        "type": "uint64",
        "internalType": "uint64"
      }
    ]
  }
] as const;
