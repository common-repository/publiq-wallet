import {KeyPair} from "cryptography-ts";
import PubliqTransaction from 'blockchain-models-ts/bin/models/PubliqTransaction';
import PubliqFile from 'blockchain-models-ts/bin/models/PubliqFile';
import PubliqContentUnit from 'blockchain-models-ts/bin/models/PubliqContentUnit';
import PubliqTransfer from 'blockchain-models-ts/bin/models/PubliqTransfer';
import PubliqSignedTransaction from 'blockchain-models-ts/bin/models/PubliqSignedTransaction';
import PubliqBroadcast from 'blockchain-models-ts/bin/models/PubliqBroadcast';
import PubliqAuthority from 'blockchain-models-ts/bin/models/PubliqAuthority';
import PubliqDone from 'blockchain-models-ts/bin/models/PubliqDone';
import { createInstanceFromJson } from 'blockchain-models-ts/bin/ModelTypes';
import {PbqUtils} from "./utils";

export class PbqCrypt {
    static getDecryptedBrainKey(brainKeyEncrypted, password) {
        return KeyPair.decryptBrainKeyByPassword(brainKeyEncrypted, password).brainKey;
    }

    static checkPassword(encryptedBrainKey, password) {
        return KeyPair.decryptBrainKeyByPassword(encryptedBrainKey, password).isValid;
    }

    static getDecryptedBrainKey(encryptedBrainKey, password) {
        return KeyPair.decryptBrainKeyByPassword(encryptedBrainKey, password).brainKey;
    }

    static getPrivateKey(brainKey) {
        const keyPair = new KeyPair(brainKey);
        return keyPair.Private.Base58;
    }

    static transfer(brainKey, publicKey, amount, memo) {
        const signTransfer = PbqCrypt.getSignTransfer(brainKey, publicKey, amount, memo);

        return fetch(pbqL10n.env.blockchainApiUrl,{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signTransfer),
        })
    }

    static checkBlockChainResponse(responseData) {
        const dataModel = createInstanceFromJson(responseData);
        if (dataModel.constructor === PubliqDone) {
            return {
                success: true,
                data: dataModel,
                error: null
            };
        } else {
            return {
                success: false,
                data: dataModel,
                error: {}
            };
        }
    }

    static getSignTransfer(fromBrainKey, toPublicKey, amount, memo) {
        const keyPair = new KeyPair(fromBrainKey);
        const fromPublicKey = keyPair.PpublicKey;

        const now = new Date();
        const now_1h = new Date(now.getTime() + (60 * 60 * 1000));

        const amountData = PbqCrypt.amountStringToWholeFraction(amount);

        const transferObj =  new PubliqTransfer( {
            from: fromPublicKey,
            to: toPublicKey,
            amount: amountData,
            message: memo ? memo : ''
        });

        const transactionObj = new PubliqTransaction({
            creation: +now,
            expiry: +now_1h,
            fee: {
                whole: 0, fraction: 0 // todo
            },
            action: transferObj,
        });

        const publiqAuthorityData = new PubliqAuthority({
            address: fromPublicKey,
            signature: keyPair.signMessage(JSON.stringify(transactionObj.toJson()))
        });

        const signedTransactionObj = new PubliqSignedTransaction({
            transactionDetails: transactionObj,
            authorizations: [publiqAuthorityData]
        });

        return new PubliqBroadcast({
            echoes: 2,
            package: signedTransactionObj
        });

    }

    static amountStringToWholeFraction(amountString) {
        const fractionCoif = 100000000;
        const amountArr = ('' + amountString).split('.');
        const whole = amountArr[0] ? +amountArr[0] : 0;
        let fraction = 0;
        if (amountArr[1]) {
            const x = PbqUtils.multFloats((+('0.' + amountArr[1])), fractionCoif);
            fraction = parseInt(x + '', 10);
        }

        return {
            whole,
            fraction
        };
    }
}
