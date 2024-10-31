let mix = require('laravel-mix');

mix.options({processCssUrls: false}).sourceMaps();

mix.setPublicPath('./');

/*mix.js('js/signup-confirm.js', 'js/signup-confirm-bundle.js')
    .js('js/signin-password.js', 'js/signin-password-bundle.js')
    .js('js/publish.js', 'js/publish-bundle.js')*/
mix.js('js/src/admin.js', 'js/build/admin.js')
    .js('js/src/frontend.js', 'js/build/frontend.js')
    .sass('styles/src/common.scss', 'styles/build/common.css', {
        includePaths: ['node_modules']
    })
    .sass('styles/src/frontend.scss', 'styles/build/frontend.css', {
        includePaths: ['node_modules']
    });
