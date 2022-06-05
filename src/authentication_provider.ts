import * as crypto  from 'crypto';

export class ShrimpyAuthenticationProvider {

    public readonly publicKey: string;
    private readonly _privateKey: Buffer;

    constructor(
        publicKey: string,
        privateKey: string,
    ) {
        if (!publicKey) {
            throw 'Empty api key';
        }
        if (!privateKey) {
            throw 'Empty api secret';
        }

        this.publicKey = publicKey;
        this._privateKey = Buffer.from(privateKey, 'base64');
    }

    public createSignature(authString: string): string {
        const hmac = crypto.createHmac('sha256', this._privateKey);
        return hmac.update(authString).digest('base64');
    }
}
