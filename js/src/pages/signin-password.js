import {PubliqOauth} from "../oauth";
import {MDCLinearProgress} from '@material/linear-progress';
import {PubliqAccount} from "../account";

export class PbqSigninPasswordPage {
    constructor(wrapper, stringToSign, encryptedBrainKey, code) {
        this.wrapper = wrapper;

        this.code = code;
        this.stringToSign = stringToSign;
        this.encryptedBrainKey = encryptedBrainKey;

        this.init();
    }

    init() {
        this.form = this.wrapper.querySelector('.pbq-session-form');
        this.formWrapper = this.wrapper.querySelector('.pbq-session-form-inner');
        this.passwordField = this.wrapper.querySelector('.pbq-signin-password-input');
        this.errorMessage = this.wrapper.querySelector('.pbq-session-error-message');
        this.progressElement = this.wrapper.querySelector('.mdc-linear-progress');

        this.progressBar = new MDCLinearProgress(this.progressElement);
        this.progressBar.determinate = false;
        this.progressBar.close();

        this.form.addEventListener('submit', this.submit.bind(this));
    }

    submit(e) {
        e.preventDefault();

        let password = this.passwordField.value;

        if (!password.length) {
            this.errorMessage.style.display = 'block';
            return false;
        }

        this.errorMessage.style.display = 'none';
        this.formWrapper.classList.add('pbq-session-form-loading');
        this.progressBar.open();

        PubliqOauth.signinGetToken(this.encryptedBrainKey, this.stringToSign, this.code, password)
            .then(response => response.json())
            .then(
                result => {
                    this.formWrapper.classList.remove('pbq-session-form-loading');
                    this.progressBar.close();
                    if (result.brainKey) {
                        localStorage.setItem('pbq_wallet_brain_key_saved', result.brainKeySaved);
                        localStorage.setItem('pbq_wallet_private_key_saved', result.privateKeySaved);
                        localStorage.setItem('pbq_wallet_brain_key_seen', result.brainKeySeen);
                        this.wrapper.querySelector('.pbq-session-form-inner').innerHTML = '<h2>Signed in successfully</h2>';
                        PubliqAccount.setAccountInfo(result);
                                        PubliqAccount.authenticate(result.token)
                                            .then(result => {
                                                window.location = pbqL10n.adminPageUrl
                                            });
                    }
                },
                () => {
                    this.formWrapper.classList.remove('pbq-session-form-loading');
                    this.progressBar.close();
                }
            )
            .catch(() => {
                this.formWrapper.classList.remove('pbq-session-form-loading');
                this.progressBar.close();
            })
    }
    static validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}
