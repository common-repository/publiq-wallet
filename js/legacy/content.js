import { KeyPair } from 'cryptography-ts';
import PubliqFile from 'blockchain-models-ts/bin/models/PubliqFile';
import PubliqTransaction from 'blockchain-models-ts/bin/models/PubliqTransaction';

export class PubliqContent {

    static publish(content) {
        var m,
            urls = [],
            rex = /<img[^>]*src="([^"]*)"/g;

        while (m = rex.exec(content)) {
            urls.push(m[1]);
        }


        if (urls.length) {
            let requests = [];
            for (let i = 0; i < urls.length; i++) {
                requests.push(fetch(urls[i]).then((result) => {
                    return result.blob();
                }))
            }

            Promise
                .all(requests)
                .then((fileObjects) => {
                    PubliqContent.uploadFiles(fileObjects);
                });
        }

    }

    static uploadFiles(files) {
        let token = localStorage.getItem('pbq_oauth_token');
        let requests = [];
        for (let i = 0; i < files.length; i++) {
            let form = new FormData();
            form.append('file', files[i]);
            requests.push(fetch('http://192.168.20.104:8003/api/file/upload', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-API-TOKEN': token
                },
                body: form
            })
                .then(
                    result => {
                        return result;
                    }
                ))
        }

        Promise
            .all(requests)
            .then((fileObjects) => {
                PubliqContent.signFiles(fileObjects, token)
                    .then(
                        signedFiles => {

                        }
                    );
            });
    }

    static signFiles(files, token) {
        let encryptedBrainKey = localStorage.getItem('pbq_publisher_brainkey');
        const brainKey = KeyPair.decryptBrainKeyByPassword(encryptedBrainKey, password).brainKey;
        const data = files.map(f => this.signFile(f, brainKey));
        const url = `http://192.168.20.104:8003/api/file/sign`;

        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-API-TOKEN': token
            },
            body: JSON.stringify({files: data})
        });
    }

    static signFile(file, brainKey){
        const signData = this.cryptService.getSignedFile(brainKey, file);
        return {
            uri: file,
            signedFile: signData.signedString,
            signedFileString: signData.signedJson,
            creationTime: signData.creation,
            expiryTime: signData.expiry
        };
    }

    static getSignedFile(brainKey, fileUri) {
        const keyPair = new KeyPair(brainKey);
        const fileObj = new PubliqFile({
            uri: fileUri,
            authorAddresses: [keyPair.PpublicKey]
        });
        return this.getSignedData(brainKey, fileObj);
    }

    static getSignedData(brainKey, actionObj) {
        const now = new Date();
        const now_1h = new Date(now.getTime() + (60 * 60 * 1000));
        const keyPair = new KeyPair(brainKey);
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
            creation: Math.round(now.getTime() / 1000),
            expiry: Math.round(now_1h.getTime() / 1000),
        };
    }
}