<?php

get_header();

?>

    <div id="pbq-wallet-page">
        <div class="pbq-session-form-wrap">
            <div class="pbq-session-form-inner">
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
                <div class="pbq-session-form-content">
                    <h1>Create PUBLIQ Wallet</h1>
                    <h2>Enter the password you would like to use with your wallet.</h2>
                    <form class="pbq-session-form">
                        <input class="pbq-session-input pbq-signup-password-input" name="pbq-signup-password-input" type="password" placeholder="Password" title="Password" />
                        <div class="pbq-session-error-message pbq-session-error-message-empty" style="display: none">Use 8 or more characters with a mix of uppercase and lowercase letters, numbers and symbols. </div>
                        <input class="pbq-session-input pbq-signup-password-confirm-input" name="pbq-signup-confirm-password-input" type="password" placeholder="Confirm password" title="Password" />
                        <div class="pbq-session-error-message pbq-session-error-message-match" style="display: none">Passwords do not match</div>
                        <button class="pbq-session-submit pbq-signup-submit">CREATE</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

<?php

$code = get_query_var('pbq_signup_code');

if(!empty($code)) {
    echo '<script>var pbqPublisherSignupConfirmCode = "'.esc_html($code).'"</script>';
}

get_footer();