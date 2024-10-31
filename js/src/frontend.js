"use strict";

import {PubliqOauth} from "./oauth";
import {PbqSigninPasswordPage} from "./pages/signin-password";
import {PbqSignupPasswordPage} from "./pages/signup-password";
import {KeyPair} from "cryptography-ts";

(function(){

    KeyPair.setPublicKeyPrefix(pbqL10n.env.publicKeyPrefix);

    //signin
    if(typeof pbqPublisherSigninConfirmCode !== 'undefined'){
        PubliqOauth.signinCheckCode(pbqPublisherSigninConfirmCode)
            .then(response => response.json())
            .then(
                result => {
                    let stringToSign = result.stringToSign;
                    let encryptedBrainKey = result.brainKey;
                    localStorage.setItem('pbq_encrypted_brain_key', result.brainKey);
                    let wrapper = document.getElementById('pbq-wallet-page');
                    new PbqSigninPasswordPage(wrapper, stringToSign, encryptedBrainKey, pbqPublisherSigninConfirmCode);
                },
                () => {
                    //handle error
                }
            )
            .catch(() => {
                //handle error
            });
    }



    //signup
    if(typeof pbqPublisherSignupConfirmCode !== 'undefined'){

        // todo: move
        PubliqOauth.generateRandomKey();

        PubliqOauth.signupConfirmation(pbqPublisherSignupConfirmCode)
            .then(response => response.json())
            .then(
                result => {
                    let stringToSign = result.stringToSign;
                    let wrapper = document.getElementById('pbq-wallet-page');
                    new PbqSignupPasswordPage(wrapper, stringToSign, pbqPublisherSignupConfirmCode)
                },
                () => {
                    //handle error
                }
            )
            .catch(() => {
                //handle error
            });
    }
}());
