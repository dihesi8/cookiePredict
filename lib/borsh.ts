// Minimal borsh-compatible reader/writer, hand-rolled so field offsets
// for Market/Position (including the variable-length Option<bool>
// outcome field) are handled explicitly and match programs/cookiepredict
// byte-for-byte. Swap for @coral-xyz/anchor's Program/BorshCoder once you
// have a real `anchor build` IDL — this is a bridge until then.

export class BinaryWriter {
  private chunks: Buffer[] = [];

  u8(v: number) {
    const b = Buffer.alloc(1);
    b.writeUInt8(v);
    this.chunks.push(b);
    return this;
  }
  bool(v: boolean) {
    return this.u8(v ? 1 : 0);
  }
  u64(v: bigint) {
    const b = Buffer.alloc(8);
    b.writeBigUInt64LE(v);
    this.chunks.push(b);
    return this;
  }
  i64(v: bigint) {
    const b = Buffer.alloc(8);
    b.writeBigInt64LE(v);
    this.chunks.push(b);
    return this;
  }
  bytes(b: Buffer) {
    this.chunks.push(b);
    return this;
  }
  string(s: string) {
    const utf8 = Buffer.from(s, "utf8");
    const len = Buffer.alloc(4);
    len.writeUInt32LE(utf8.length);
    this.chunks.push(len, utf8);
    return this;
  }
  toBuffer() {
    return Buffer.concat(this.chunks);
  }
}

export class BinaryReader {
  private offset = 0;
  constructor(private buf: Buffer) {}

  skip(n: number) {
    this.offset += n;
    return this;
  }
  pubkeyBytes(): Buffer {
    const b = this.buf.subarray(this.offset, this.offset + 32);
    this.offset += 32;
    return b;
  }
  u8(): number {
    const v = this.buf.readUInt8(this.offset);
    this.offset += 1;
    return v;
  }
  bool(): boolean {
    return this.u8() !== 0;
  }
  u64(): bigint {
    const v = this.buf.readBigUInt64LE(this.offset);
    this.offset += 8;
    return v;
  }
  i64(): bigint {
    const v = this.buf.readBigInt64LE(this.offset);
    this.offset += 8;
    return v;
  }
  optionBool(): boolean | null {
    const tag = this.u8();
    if (tag === 0) return null;
    return this.bool();
  }
  string(): string {
    const len = this.buf.readUInt32LE(this.offset);
    this.offset += 4;
    const s = this.buf.subarray(this.offset, this.offset + len).toString("utf8");
    this.offset += len;
    return s;
  }
}
