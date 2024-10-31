import { KeyPair } from 'cryptography-ts';
import PubliqTransaction from 'blockchain-models-ts/bin/models/PubliqTransaction';
import * as Fingerprint2 from 'fingerprintjs2';
import { stringToSha256 } from 'cryptography-ts/bin/utils';

export class PubliqOauth {

    static signupOrSignin(email, route = null) {
        let data = {
            email: email,
        };

        if(route) {
            data['relativeRoute'] = route;
        }

        return fetch(pbqL10n.env.oauthApiUrl + '/user/authentication', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    static signupConfirmation(code) {
        return fetch(pbqL10n.env.oauthApiUrl + '/user/signup/confirmation/'+code,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
    }

    static signupComplete(stringToSign, code, password) {
        KeyPair.setRandomKey(PubliqOauth.randomKey);
        const keyPair = new KeyPair();
        const encryptedBrainKey = keyPair.getEncryptedBrainKeyByPassword(password);
        const publicKey = keyPair.PpublicKey;
        const signedString = PubliqOauth.getSignedString(stringToSign, keyPair.BrainKey);
        this.brainKey = keyPair.BrainKey;

        return fetch(pbqL10n.env.oauthApiUrl + '/user/signup/complete', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                confirmationCode: code,
                brainKey: encryptedBrainKey,
                publicKey: publicKey,
                signedString: signedString
            })
        });
    }

    static signinAuthenticate(email, route = null) {
        let data = {
            email: email,
        };

        if(route) {
            data['relativeRoute'] = route;
        }

        return fetch(pbqL10n.env.oauthApiUrl + '/user/authenticate',{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    static signinCheckCode(code) {
        return fetch(pbqL10n.env.oauthApiUrl + '/user/signin/check-code/'+code,{
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
    }

    static signinGetToken(encryptedBrainKey, stringToSign, code, password) {
        const brainKeyData = KeyPair.decryptBrainKeyByPassword(encryptedBrainKey, password);

        if (!brainKeyData.isValid) {
            return Promise.reject('invalid brain key');
        }

        const brainKey = brainKeyData.brainKey;
        const keyPair = new KeyPair(brainKey);
        const signedString = PubliqOauth.getSignedString(stringToSign, keyPair.BrainKey);
        const url = pbqL10n.env.oauthApiUrl + '/user/signin/get-token';
        PubliqOauth.brainKey = brainKey;

        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: code,
                signedString: signedString
            })
        })
    }

    static getSignedString(stringToSign, brainKey) {
        const now = new Date(new Date(stringToSign * 1000));
        const now_1h = new Date(now.getTime() + 60 * 60 * 1000);
        const keyPair = new KeyPair(brainKey.trim());
        const transactionObj = new PubliqTransaction({
            creation: +now,
            expiry: +now_1h,
            fee: {
                whole: 0,
                fraction: 0
            },
            action: {},
        });
        return keyPair.signMessage(JSON.stringify(transactionObj.toJson()));
    }

    static generateRandomKey () {
        Fingerprint2.get({}, (components) => {
            const fingerprint = Fingerprint2.x64hash128(components.map(function (component) { return component.value; }).join(''), 31).trim();
            const currentTime = new Date().getTime();

            const averageHash = `${fingerprint}${currentTime}`;
            const encodedAverageHash = stringToSha256(averageHash).substring(0, 8);

            PubliqOauth.randomKey = parseInt(encodedAverageHash, 16);
        });
    }

    static setBrainKeySaved(brainKey) {
        const url = pbqL10n.env.oauthApiUrl + '/user/brain-key-saved';
        const signedEmptyObjectData = this.getSignedEmptyObject(brainKey.trim());

        return fetch(url, {
           method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signedEmptyObjectData)
        });
    }

    static setPrivateKeySaved(brainKey) {
        const url = pbqL10n.env.oauthApiUrl + '/user/private-key-saved';
        const signedEmptyObjectData = PubliqOauth.getSignedEmptyObject(brainKey.trim());
        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signedEmptyObjectData)
        });
    }

    static setBrainKeySeen(brainKey) {
        const url = pbqL10n.env.oauthApiUrl + '/user/brain-key-seen';
        const signedEmptyObjectData = this.getSignedEmptyObject(brainKey.trim());

        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signedEmptyObjectData)
        });
    }

    static getSignedEmptyObject(brainKey) {
        const keyPair = new KeyPair(brainKey.trim());
        const signedData = PubliqOauth.getSignedData(brainKey.trim(), {});
        return {
            publicKey: keyPair.PpublicKey,
            signedString: signedData.signedString,
            creationDate: signedData.creation
        };
    }

    static getSignedData(brainKey, actionObj) {
        const now = new Date(); // 1554369066000
        const now_1h = new Date(now.getTime() + 60 * 60 * 1000);
        const keyPair = new KeyPair(brainKey.trim());
        const transactionObj = new PubliqTransaction({
            creation: +now,
            expiry: +now_1h,
            fee: {
                whole: 0,
                fraction: 0
            },
            action: actionObj
        });
        return {
            signedJson: JSON.stringify(transactionObj.toJson()),
            signedString: keyPair.signMessage(JSON.stringify(transactionObj.toJson())),
            creation: Math.floor(now.getTime() / 1000),
            expiry: Math.floor(now_1h.getTime() / 1000),
        };
    }
}
