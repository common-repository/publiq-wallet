import {PbqSignupDialog} from './signup-dialog';
import {PubliqContent} from "./content";
import {PubliqAccount} from "./account";
import {KeyPair} from "cryptography-ts";

(function(){
    let token = localStorage.getItem('pbq_oauth_token');
    let encryptedBrainKey = localStorage.getItem('pbq_encrypted_brain_key');
    let password = localStorage.getItem('pbq_pwd');


    if(!token) {
        // let dialog = new PbqSignupDialog();
        // dialog.open();
    } else {
        PubliqAccount.getUserInfo(token)
            .then(response => {
                if(response.status === 401) {
                    localStorage.removeItem('pbq_oauth_token');
                    localStorage.removeItem('pbq_encrypted_brain_key');
                    localStorage.removeItem('pbq_pwd');
                    window.location.reload();
                }

                return response.json();
            })
            .then(result => {
                if(result.hasOwnProperty('publicKey')) {
                    PubliqAccount.setAccountInfo(result);

                    document.getElementById('pbq-qr').innerHTML = '<img class="qr-code-img" src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl='+result.publicKey+'&choe=UTF-8&chld=L|1" alt="QR code" />';
                    document.getElementById('pbq-public-key').innerHTML = result.publicKey;

                    PubliqAccount.getBalance(result.publicKey)
                        .then(response => response.json())
                        .then(
                            result => {
                                if(result.hasOwnProperty('whole') && result.hasOwnProperty('fraction')) {
                                        let balanceString = result.whole.toLocaleString();
                                        if(result.fraction) {
                                            balanceString += '.' + parseInt(result.fraction);                                        }
                                    document.getElementById('pbq-balance').innerHTML = balanceString.toLocaleString().replace(/[0]+$/, '');
                                }
                            }
                        )
                }
            });


        console.log('token: ' + token);
    }

    /*let testString = '<!-- wp:paragraph -->\n' +
        '<p>advadvadv</p>\n' +
        '<!-- /wp:paragraph -->\n' +
        '\n' +
        '<!-- wp:image {"id":146} -->\n' +
        '<figure class="wp-block-image"><img src="http://localhost/wordpress/wp-content/uploads/2019/04/Matlogo-892x1024.png" alt="" class="wp-image-146"/><figcaption><br></figcaption></figure>\n' +
        '<!-- /wp:image -->\n' +
        '\n' +
        '<!-- wp:image {"id":149} -->\n' +
        '<figure class="wp-block-image"><img src="http://localhost/wordpress/wp-content/uploads/2019/04/27651021_2005864719686330_1151868334_o-576x1024.jpg" alt="" class="wp-image-149"/></figure>\n' +
        '<!-- /wp:image -->';

    PubliqContent.publish(testString);*/


    /*const initialPostStatus = wp.data.select( 'core/editor' ).getEditedPostAttribute( 'status' );

    if ( 'publish' !== initialPostStatus ) {
        // Watch for the publish event.
        let unsubscribe = wp.data.subscribe( () => {
            const currentPostStatus = wp.data.select( 'core/editor' ).getEditedPostAttribute( 'status' );
            if ( 'publish' === currentPostStatus ) {
                let postsaving = wp.data.select('core/editor').isSavingPost();
                let autosaving = wp.data.select('core/editor').isAutosavingPost();
                let success = wp.data.select('core/editor').didPostSaveRequestSucceed();
                let isPublishing = wp.data.select('core/editor').isPublishingPost();
                console.log('Saving: ' + postsaving + ' - Autosaving: ' + autosaving + ' - Success: ' + success + ' -is publishing: ' + isPublishing);
                if (success) {
                    console.log(wp.data.select('core/editor').getEditedPostContent());
                    console.log('sending content to publiq');
                    PubliqContent.publish(wp.data.select('core/editor').getEditedPostContent());
                    unsubscribe();
                }
            }
        });
    }*/

}());


