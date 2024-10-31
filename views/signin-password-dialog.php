<div class="mdc-dialog"
     id="pbq_signin_password_dialog"
     role="alertdialog"
     aria-modal="true"
     aria-labelledby="pbq-signin-password-dialog-title"
     aria-describedby="pbq-signin-password-dialog-content">
    <div class="mdc-dialog__container">
        <div class="mdc-dialog__surface">
            <div role="progressbar" class="mdc-linear-progress">
                <div class="mdc-linear-progress__buffering-dots"></div>
                <div class="mdc-linear-progress__buffer"></div>
                <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                    <span class="mdc-linear-progress__bar-inner"></span>
                </div>
                <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                    <span class="mdc-linear-progress__bar-inner"></span>
                </div>
            </div>
            <h2 class="mdc-dialog__title" id="pbq-signin-password-dialog-title">Sign in to your PUBLIQ Account</h2>
            <div class="mdc-dialog__content" id="pbq-signin-password-dialog-content">
                <div class="mdc-text-field" id="pbq_signin_pass_field">
                    <input type="password" id="pbq_signin_pass" title="password" class="mdc-text-field__input">
                    <label class="mdc-floating-label" for="pbq_signin_pass">Password</label>
                    <div class="mdc-line-ripple"></div>
                </div>
            </div>
            <footer class="mdc-dialog__actions">
                <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="no"
                        id="pbq_signin_password_close">
                    <span class="mdc-button__label">Close</span>
                </button>
                <button type="button" id="pbq_signin_password_submit" class="mdc-button mdc-button--raised mdc-dialog__button">
                    <span class="mdc-button__label">Submit</span>
                </button>
            </footer>
        </div>
    </div>
    <div class="mdc-dialog__scrim"></div>
</div>
<div class="mdc-snackbar" id="pbq_signin_pass_failed_snackbar">
    <div class="mdc-snackbar__surface">
        <div class="mdc-snackbar__label"
             role="status"
             aria-live="polite">
            Failed to sign in
        </div>
        <div class="mdc-snackbar__actions">
            <button type="button" class="mdc-button mdc-snackbar__action">Dismiss</button>
        </div>
    </div>
</div>