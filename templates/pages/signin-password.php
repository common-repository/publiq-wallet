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
                    <h1>Log in to PUBLIQ Wallet</h1>
                    <h2>Enter your password to log in.</h2>
                    <form class="pbq-session-form">
                        <input class="pbq-session-input pbq-signin-password-input" name="pbq-signin-password-input" type="password" placeholder="Password" title="Password" />
                        <div class="pbq-session-error-message" style="display: none">Incorrect Credentials</div>
                        <button class="pbq-session-submit pbq-signin-submit">LOG IN</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

<?php

$code = get_query_var('pbq_signin_code');

if(!empty($code)) {
    echo '<script>var pbqPublisherSigninConfirmCode = "'.esc_html($code).'"</script>';
}

get_footer();