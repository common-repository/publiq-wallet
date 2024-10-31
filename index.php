<?php
/**
 * Plugin Name: PUBLIQ Wallet
 * Plugin URI:  https://publiq.network/wordpress
 * Description: WordPress implementation of PUBLIQ Wallet
 * Version:     1.0.0
 * Author:      PUBLIQ
 * Author URI:  https://publiq.network
 * License:     GPL2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: pbq_publisher
 * Domain Path: /languages
 */

define('PBQ_WALLET_VERSION', '1.0.0');
define('PBQ_WALLET_PLUGIN_URL', plugin_dir_url(__FILE__));

if (defined('PBQ_DEBUG') && PBQ_DEBUG === true) {
    function pbq_dd($data)
    {
        echo '<pre>';
        var_dump($data);
        echo '</pre>';
        die;
    }
}

if(!defined('PBQ_DEBUG')) {
    define('PBQ_DEBUG', false);
}


add_action('admin_enqueue_scripts', 'pbq_wallet_admin_scripts');
function pbq_wallet_admin_scripts($hook)
{
    wp_enqueue_style('pbq_wallet_common', PBQ_WALLET_PLUGIN_URL . 'styles/build/common.css', array(), PBQ_WALLET_VERSION);

    if (isset($GLOBALS['pbq_wallet_admin_pages']) && !empty($GLOBALS['pbq_wallet_admin_pages']) && in_array($hook, $GLOBALS['pbq_wallet_admin_pages'])) {
        wp_enqueue_style('pbq_wallet_fonts', 'https://fonts.googleapis.com/css?family=Roboto:400,500,700', array(), PBQ_WALLET_VERSION);
        wp_enqueue_script('pbq_wallet_admin', PBQ_WALLET_PLUGIN_URL . 'js/build/admin.js', array(), PBQ_WALLET_VERSION, true);


        if (PBQ_DEBUG === true) {
            $env = [
                'oauthApiUrl' => 'https://stage-mainnet-oauth.publiq.network/api',
                'walletApiUrl' => 'https://stage-mainnet-wallet-api.publiq.network/api',
                'blockchainApiUrl' => 'https://north.publiq.network/testnet_publiq/api',
                'publicKeyPrefix' => 'TPBQ'
            ];
        } else {
            $env = [
                'oauthApiUrl' => 'https://stage-mainnet-oauth.publiq.network/api',
                'walletApiUrl' => 'https://stage-mainnet-wallet-api.publiq.network/api',
                'blockchainApiUrl' => 'https://north.publiq.network/testnet_publiq/api',
                'publicKeyPrefix' => 'TPBQ'
            ];
        }

        wp_localize_script('pbq_wallet_admin', 'pbqL10n', array(
            'relativeRoute' => ltrim(parse_url(get_home_url(), PHP_URL_PATH), '/'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'env' => $env
        ));
    }
}

add_action('wp_enqueue_scripts', 'pbq_wallet_frontend_scripts');
function pbq_wallet_frontend_scripts()
{
    if (get_query_var('pbq_signin_code') || get_query_var('pbq_signup_code')) {

        wp_enqueue_script('pbq_wallet_frontend', PBQ_WALLET_PLUGIN_URL . 'js/build/frontend.js', array(), PBQ_WALLET_VERSION, true);

        if (PBQ_DEBUG === true) {
            $env = [
                'oauthApiUrl' => 'https://stage-mainnet-oauth.publiq.network/api',
                'walletApiUrl' => 'https://stage-mainnet-wallet-api.publiq.network/api',
                'blockchainApiUrl' => 'https://north.publiq.network/testnet_publiq/api',
                'publicKeyPrefix' => 'TPBQ'
            ];
        } else {
            $env = [
                'oauthApiUrl' => 'https://stage-mainnet-oauth.publiq.network/api',
                'walletApiUrl' => 'https://stage-mainnet-wallet-api.publiq.network/api',
                'blockchainApiUrl' => 'https://north.publiq.network/testnet_publiq/api',
                'publicKeyPrefix' => 'TPBQ'
            ];
        }

        wp_localize_script('pbq_wallet_frontend', 'pbqL10n', array(
            'adminPageUrl' => admin_url('admin.php?page=publiq-wallet'),
            'env' => $env
        ));
    }

    if (get_query_var('pbq_signup_code') || get_query_var('pbq_signin_code')) {
        wp_enqueue_style('pbq_wallet_fonts', 'https://fonts.googleapis.com/css?family=Roboto:400,500,700', array(), PBQ_WALLET_VERSION);
        wp_enqueue_style('pbq_wallet_frontend', PBQ_WALLET_PLUGIN_URL . 'styles/build/frontend.css', array(), PBQ_WALLET_VERSION);
    }
}

add_action('admin_footer', 'pbq_wallet_admin_footer');
function pbq_wallet_admin_footer()
{
    ?>
    <div id="pbq-notifier-snackbar" class="mdc-snackbar">
        <div class="mdc-snackbar__surface">
            <div class="mdc-snackbar__label"
                 role="status"
                 aria-live="polite">

            </div>
        </div>
    </div>
    <?php
}

add_action('init', 'pbq_wallet_rewrite_rule');
function pbq_wallet_rewrite_rule()
{
    add_rewrite_rule('user/signup/confirmation/([^/]+)/?$', 'index.php?pbq_signup_code=$matches[1]', 'top');
    add_rewrite_rule('user/signin/confirmation/([^/]+)/?$', 'index.php?pbq_signin_code=$matches[1]', 'top');
}

add_filter('query_vars', 'pbq_wallet_query_vars');
function pbq_wallet_query_vars($vars)
{
    $vars[] = "pbq_signup_code";
    $vars[] = "pbq_signin_code";
    return $vars;
}

add_action('template_redirect', 'pbq_wallet_rewrite_templates');
function pbq_wallet_rewrite_templates()
{
    if (get_query_var('pbq_signup_code')) {
        add_filter('template_include', function () {
            return __DIR__ . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'pages' . DIRECTORY_SEPARATOR . 'signup-password.php';
        });
    } elseif (get_query_var('pbq_signin_code')) {
        add_filter('template_include', function () {
            return __DIR__ . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'pages' . DIRECTORY_SEPARATOR . 'signin-password.php';
        });
    }
}


register_activation_hook(__FILE__, 'pbq_wallet_activate');
function pbq_wallet_activate()
{
    set_transient('_pbq_wallet_activation_redirect', true, 30);
}

add_action('admin_init', 'pbq_wallet_do_activation_redirect');
function pbq_wallet_do_activation_redirect()
{
    // Bail if no activation redirect
    if (!get_transient('_pbq_wallet_activation_redirect')) {
        return;
    }

    // Delete the redirect transient
    delete_transient('_pbq_wallet_activation_redirect');

    // Bail if activating from network, or bulk
    if (is_network_admin() || isset($_GET['activate-multi'])) {
        return;
    }

    // Redirect to bbPress about page
    wp_safe_redirect(add_query_arg(array('page' => 'pbq-wallet-about'), admin_url('index.php')));

}

add_action('admin_menu', 'pbq_publisher_pages');
function pbq_publisher_pages()
{
    $GLOBALS['pbq_wallet_admin_pages'] = array();

    $GLOBALS['pbq_wallet_admin_pages'][] = add_dashboard_page(
        'Welcome To PUBLIQ',
        'Welcome To PUBLIQ',
        'read',
        'pbq-wallet-about',
        'pbq_wallet_welcome_content'
    );

    $GLOBALS['pbq_wallet_admin_pages'][] = add_menu_page(
        'PUBLIQ',
        'PUBLIQ',
        'manage_options',
        'publiq-wallet',
        'pbq_wallet_admin_page_content',
        PBQ_WALLET_PLUGIN_URL . 'images/icon.jpg'
    );
}

function pbq_wallet_welcome_content()
{
    ?>
    <div class="wrap">

        <h2>Welcome to <img src="<?php echo PBQ_WALLET_PLUGIN_URL . 'images/publiq.svg' ?>" height="29px"
                            style="vertical-align: middle;"/></h2>
    </div>

    <?php
}

function pbq_wallet_admin_page_content()
{
    ?>
    <div id="pbq-wallet-page"></div>
    <?php


}

add_action('wp_ajax_pbq_signin_page_content', 'pbq_wallet_signin_page_content');
function pbq_wallet_signin_page_content()
{

    ob_start();

    require __DIR__ . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'admin' . DIRECTORY_SEPARATOR . 'signin.php';

    $content = ltrim(ob_get_clean());

    echo json_encode(array('success' => 1, 'content' => $content));
    die();
}

add_action('wp_ajax_pbq_signup_page_content', 'pbq_wallet_signup_page_content');
function pbq_wallet_signup_page_content()
{

    ob_start();

    require __DIR__ . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'admin' . DIRECTORY_SEPARATOR . 'signup.php';

    $content = ltrim(ob_get_clean());

    echo json_encode(array('success' => 1, 'content' => $content));
    die();
}

add_action('wp_ajax_pbq_wallet_content', 'pbq_wallet_content');
function pbq_wallet_content()
{

    ob_start();

    require __DIR__ . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'admin' . DIRECTORY_SEPARATOR . 'wallet.php';

    $content = ltrim(ob_get_clean());

    echo json_encode(array('success' => 1, 'content' => $content));
    die();
}
