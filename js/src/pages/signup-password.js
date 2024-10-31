import {PubliqOauth} from "../oauth";
import {MDCLinearProgress} from '@material/linear-progress';
import {PubliqAccount} from "../account";

export class PbqSignupPasswordPage {
    constructor(wrapper, stringToSign, code) {
        this.wrapper = wrapper;

        this.code = code;
        this.stringToSign = stringToSign;

        this.init();
    }

    init() {
        this.form = this.wrapper.querySelector('.pbq-session-form');
        this.formWrapper = this.wrapper.querySelector('.pbq-session-form-inner');
        this.passwordField = this.wrapper.querySelector('.pbq-signup-password-input');
        this.passwordConfirmField = this.wrapper.querySelector('.pbq-signup-password-confirm-input');
        this.errorMessageEmpty = this.wrapper.querySelector('.pbq-session-error-message-empty');
        this.errorMessageMatch = this.wrapper.querySelector('.pbq-session-error-message-match');
        this.progressElement = this.wrapper.querySelector('.mdc-linear-progress');

        this.progressBar = new MDCLinearProgress(this.progressElement);
        this.progressBar.determinate = false;
        this.progressBar.close();

        this.form.addEventListener('submit', this.submit.bind(this));
    }

    submit(e) {
        e.preventDefault();

        let password = this.passwordField.value;
        let passwordConfirm = this.passwordConfirmField.value;

        if (!password || !password.match(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)) {
            this.errorMessageEmpty.style.display = 'block';
            return false;
        }

        if (password !== passwordConfirm) {
            this.errorMessageMatch.style.display = 'block';
            return false;
        }

        this.errorMessageEmpty.style.display = 'none';
        this.errorMessageMatch.style.display = 'none';

        this.formWrapper.classList.add('pbq-session-form-loading');
        this.progressBar.open();

        PubliqOauth.signupComplete(this.stringToSign, this.code, password)
            .then(response => response.json())
            .then(
                result => {
                    if(result.brainKey) {
                        localStorage.setItem('pbq_encrypted_brain_key', result.brainKey);
                        PubliqAccount.setAccountInfo(result);
                        PubliqAccount.authenticate(result.token)
                            .then(result => {
                                window.location = pbqL10n.adminPageUrl;
                            });


                    } else {
                        this.formWrapper.classList.remove('pbq-session-form-loading');
                        this.progressBar.close();
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
            });
    }
}
