export const SHORT_REF_LENGTH = 6;
export const SHORT_REF_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

const BASE = 32n;
const MOD = BASE ** BigInt(SHORT_REF_LENGTH);
const A = 1_103_515_245n;
const B = 123_456_789n;
const A_INVERSE = modInverse(A, MOD);
const ALPHABET_INDEX = new Map(
  [...SHORT_REF_ALPHABET].map((character, index) => [character, BigInt(index)])
);

export function publicIdFromInt(id: bigint): string {
  if (id < 0n || id >= MOD) throw new Error("id out of range");
  return toBase32Fixed((id * A + B) % MOD);
}

export function intFromPublicId(shortRef: string): bigint {
  const encodedId = fromBase32Fixed(shortRef.toUpperCase());
  const id = ((encodedId - B) * A_INVERSE) % MOD;
  return (id + MOD) % MOD;
}

function modInverse(value: bigint, modulo: bigint): bigint {
  let oldRemainder = value;
  let remainder = modulo;
  let oldCoefficient = 1n;
  let coefficient = 0n;

  while (remainder !== 0n) {
    const quotient = oldRemainder / remainder;

    [oldRemainder, remainder] = [
      remainder,
      oldRemainder - quotient * remainder,
    ];
    [oldCoefficient, coefficient] = [
      coefficient,
      oldCoefficient - quotient * coefficient,
    ];
  }

  if (oldRemainder !== 1n) throw new Error("value is not invertible");

  return ((oldCoefficient % modulo) + modulo) % modulo;
}

function toBase32Fixed(value: bigint): string {
  let encoded = "";
  let remaining = value;
  for (let i = 0; i < SHORT_REF_LENGTH; i++) {
    encoded = SHORT_REF_ALPHABET[Number(remaining % BASE)] + encoded;
    remaining /= BASE;
  }
  return encoded;
}

function fromBase32Fixed(shortRef: string): bigint {
  if (shortRef.length !== SHORT_REF_LENGTH) {
    throw new Error(`short ref must be ${SHORT_REF_LENGTH} characters`);
  }

  let decoded = 0n;
  for (const character of shortRef) {
    const value = ALPHABET_INDEX.get(character);
    if (value === undefined) {
      throw new Error("short ref contains invalid character");
    }

    decoded = decoded * BASE + value;
  }

  return decoded;
}
