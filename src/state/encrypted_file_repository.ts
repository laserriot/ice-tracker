import fs from "fs";
import crypto, {randomBytes} from "crypto";

const algorithm = "chacha20-poly1305";
const options = {authTagLength: 16};


export class EncryptedFileRepository {
    private readonly _encryptionKey: Buffer;
    private readonly _path: string;

    constructor(encryptionKey: string, path: string) {
        this._encryptionKey = Buffer.from(encryptionKey, 'hex');
        this._path = path;
    }

    public load<T>(converter: (object: any) => T): T {
        if (! fs.existsSync(this._path)) {
            return converter(null);
        }

        const nonceBase64 = fs.readFileSync(this.noncePath()).toString();
        const nonce = Buffer.from(nonceBase64, 'base64')

        const decipher = crypto.createDecipheriv(algorithm, this._encryptionKey, nonce, options);
        const str = fs.readFileSync(this._path).toString();
        const stateFile = Buffer.from(str, 'base64')
        const decryptedData = decipher.update(stateFile).toString();
        const rawData = JSON.parse(decryptedData)
        return converter(rawData)

    }

    public saveState<T>(state: T) {
        const nonce = randomBytes(12);
        const cipher = crypto.createCipheriv(algorithm, this._encryptionKey, nonce, options);

        const stateString = JSON.stringify(state);
        const encrypted = cipher.update(stateString).toString('base64')
        fs.writeFileSync(this._path, encrypted)
        fs.writeFileSync(this.noncePath(), nonce.toString('base64'))
    }

    private noncePath() {
        return `${this._path}.nonce`;
    }
}