// GENERADO por contracts/script/export-abi.mjs. No editar a mano: correr `node script/export-abi.mjs`.
export const kumplyStoreAbi = [
  {
    "type": "function",
    "name": "verify",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "subject",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "verified",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "tier",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "timestamp",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "expiry",
        "type": "uint64",
        "internalType": "uint64"
      }
    ]
  }
] as const;
