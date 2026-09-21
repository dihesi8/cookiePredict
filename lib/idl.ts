// Hand-written to mirror programs/cookiepredict/src/lib.rs.
// Verified against the real anchor-build-generated target/idl/cookiepredict.json
// on 2026-09-18 — every discriminator below matched byte-for-byte, so this
// file is confirmed correct, not just a plausible guess.

export const COOKIEPREDICT_PROGRAM_ID =
  "7pe1JdksBwUZfgNWen1VRWtVSYQ4mimPnFPNUbUYyi4A";

export const IDL = {
  version: "0.1.0",
  name: "cookiepredict",
  instructions: [
    {
      name: "createMarket",
      discriminator: [103, 226, 97, 235, 200, 188, 251, 254],
      accounts: [
        { name: "authority", isMut: true, isSigner: true },
        { name: "market", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "marketId", type: "u64" },
        { name: "closeTs", type: "i64" },
        { name: "resolveTs", type: "i64" },
      ],
    },
    {
      name: "enterPosition",
      discriminator: [155, 188, 11, 3, 25, 152, 183, 147],
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "market", isMut: true, isSigner: false },
        { name: "position", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "side", type: "bool" },
        { name: "amount", type: "u64" },
      ],
    },
    {
      name: "resolveMarket",
      discriminator: [155, 23, 80, 173, 46, 74, 23, 239],
      accounts: [
        { name: "authority", isMut: false, isSigner: true },
        { name: "market", isMut: true, isSigner: false },
      ],
      args: [{ name: "outcome", type: "bool" }],
    },
    {
      name: "claimWinnings",
      discriminator: [161, 215, 24, 59, 14, 236, 242, 221],
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "market", isMut: true, isSigner: false },
        { name: "position", isMut: true, isSigner: false },
      ],
      args: [],
    },
    {
      name: "createChallenge",
      discriminator: [170, 244, 47, 1, 1, 15, 173, 239],
      accounts: [
        { name: "creator", isMut: true, isSigner: true },
        { name: "recipient", isMut: false, isSigner: false },
        { name: "market", isMut: false, isSigner: false },
        { name: "challenge", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "creatorSide", type: "bool" },
        { name: "amount", type: "u64" },
        { name: "expiryTs", type: "i64" },
      ],
    },
    {
      name: "acceptChallenge",
      discriminator: [195, 227, 139, 241, 55, 193, 153, 105],
      accounts: [
        { name: "recipient", isMut: true, isSigner: true },
        { name: "challenge", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "cancelChallenge",
      discriminator: [231, 253, 0, 151, 179, 94, 5, 152],
      accounts: [
        { name: "creator", isMut: true, isSigner: true },
        { name: "challenge", isMut: true, isSigner: false },
      ],
      args: [],
    },
    {
      name: "settleChallenge",
      discriminator: [242, 58, 232, 150, 127, 199, 11, 204],
      accounts: [
        { name: "winner", isMut: true, isSigner: false },
        { name: "market", isMut: false, isSigner: false },
        { name: "challenge", isMut: true, isSigner: false },
      ],
      args: [],
    },
    {
      name: "createProfile",
      discriminator: [225, 205, 234, 143, 17, 186, 50, 220],
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "profile", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "nickname", type: "string" },
        { name: "pfpUrl", type: "string" },
      ],
    },
    {
      name: "updateProfile",
      discriminator: [98, 67, 99, 206, 86, 115, 175, 1],
      accounts: [
        { name: "user", isMut: false, isSigner: true },
        { name: "profile", isMut: true, isSigner: false },
      ],
      args: [
        { name: "nickname", type: "string" },
        { name: "pfpUrl", type: "string" },
      ],
    },
  ],
  accounts: [
    {
      name: "Market",
      discriminator: [219, 190, 213, 55, 0, 227, 198, 154],
    },
    {
      name: "Position",
      discriminator: [170, 188, 143, 228, 122, 64, 247, 208],
    },
    {
      name: "Challenge",
      discriminator: [119, 250, 161, 121, 119, 81, 22, 208],
    },
    {
      name: "UserProfile",
      discriminator: [32, 37, 119, 205, 179, 180, 13, 194],
    },
  ],
} as const;
