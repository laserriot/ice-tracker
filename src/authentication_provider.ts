import * as crypto  from 'crypto';

export class ShrimpyAuthenticationProvider {

    public readonly _publicKey: string;
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

        this._publicKey = publicKey;
        // decode the base64 secret
        this._privateKey = Buffer.from(privateKey, 'base64');
    }

    public sign(prehashString: string): string {
        // create a sha256 hmac with the secret
        const hmac = crypto.createHmac('sha256', this._privateKey);

        // hash the prehash string and base64 encode the result
        return hmac.update(prehashString).digest('base64');
    }
}
