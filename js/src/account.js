export class PubliqAccount {

    static setAccountInfo(data) {
        PubliqAccount.accountInfo = data;
    }

    static authenticate(token) {
        return fetch(pbqL10n.env.walletApiUrl + '/user/authenticate',{
            headers: {
                'X-OAUTH-TOKEN': token,
                'Accept': 'application/json',
            }
        })
            .then(response => response.json())
            .then(
            result => {
                PubliqAccount.setAccountInfo(result);
                localStorage.setItem('pbq_oauth_token', result.token);
            }
        );
    }

    static getBalance(publicKey){
        return fetch(pbqL10n.env.walletApiUrl + '/user/'+publicKey+'/balance');
    }

    static getUserInfo(token) {
        return fetch(pbqL10n.env.walletApiUrl +  '/user', {
            headers: {
                'X-API-TOKEN': token,
                'Accept': 'application/json',
            }
        });
    }
}
