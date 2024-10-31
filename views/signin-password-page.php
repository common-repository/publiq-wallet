<?php

get_header();

echo '<h1>Complete Sign in to PUBLIQ</h1>';

$code = get_query_var('pbq_signin_code');

if(!empty($code)) {
    echo '<script>var pbqPublisherSigninConfirmCode = "'.esc_html($code).'"</script>';
}

get_footer();