<?php

get_header();

echo '<h1>Complete Registration</h1>';

$code = get_query_var('pbq_signup_code');

if(!empty($code)) {
    echo '<script>var pbqPublisherSignupConfirmCode = "'.esc_html($code).'"</script>';
}

get_footer();