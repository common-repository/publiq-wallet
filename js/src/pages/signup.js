import {PubliqOauth} from "../oauth";
import {MDCLinearProgress} from '@material/linear-progress';
import {PbqSigninPage} from "./signin";

export class PbqSignupPage {
    constructor(wrapper) {
        this.wrapper = wrapper;


        this.load();
    }

    load() {
        let url = new URL(pbqL10n.ajaxUrl)

        var params = [['action', 'pbq_signup_page_content']];

        url.search = new URLSearchParams(params)
        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    this.wrapper.innerHTML = result.content;

                    setTimeout(() => {
                        this.init()
                    }, 0);
                }
            });
    }

    init() {

        this.form = this.wrapper.querySelector('.pbq-session-form');
        this.formWrapper = this.wrapper.querySelector('.pbq-session-form-inner');
        this.emailField = this.wrapper.querySelector('.pbq-signup-email-input');
        this.errorMessage = this.wrapper.querySelector('.pbq-session-error-message');
        this.progressElement = this.wrapper.querySelector('.mdc-linear-progress');

        this.progressBar = new MDCLinearProgress(this.progressElement);
        this.progressBar.determinate = false;
        this.progressBar.close();

        this.form.addEventListener('submit', this.submit.bind(this));

        this.wrapper.querySelector('.pbq-session-signin-init').addEventListener('click', (e) => {
            e.preventDefault();
            this.formWrapper.classList.add('pbq-session-form-loading');
            this.progressBar.open();
            new PbqSigninPage(this.wrapper);
        });
    }

    submit(e) {
        e.preventDefault();

        let email = this.emailField.value;

        if (!PbqSigninPage.validateEmail(email)) {
            this.errorMessage.style.display = 'block';
            return false;
        }

        this.errorMessage.style.display = 'none';
        this.formWrapper.classList.add('pbq-session-form-loading');
        this.progressBar.open();

        PubliqOauth.signupOrSignin(email, pbqL10n.relativeRoute)
            .then(
                result => {
                    this.formWrapper.classList.remove('pbq-session-form-loading');
                    this.progressBar.close();
                    if (result.status === 204 || result.status === 200) {
                        this.wrapper.querySelector('.pbq-session-form-inner').innerHTML = '<h2>Please check your email to access your authorization link.</h2>';
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