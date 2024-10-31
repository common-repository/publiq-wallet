"use strict";



import {PbqSigninPage} from "./pages/signin";
import {PbqWalletPage} from "./pages/wallet";
import { KeyPair } from 'cryptography-ts';

(function () {
    let walletPageElement = document.getElementById('pbq-wallet-page');

    if (!walletPageElement) {
        return false;
    }

    let token = localStorage.getItem('pbq_oauth_token');

    KeyPair.setPublicKeyPrefix(pbqL10n.env.publicKeyPrefix);

    if (!token) {
        new PbqSigninPage(walletPageElement);
    } else {
        window.pbqWalletPage = new PbqWalletPage(walletPageElement, token);
    }

}());

