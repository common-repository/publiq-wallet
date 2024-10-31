import {MDCDialog} from '@material/dialog';
import { KeyPair } from 'cryptography-ts';
import {PbqNotifier} from "../notifier";
import {PbqCrypt} from "../crypt";
import {PubliqOauth} from "../oauth";

export class PbqBackupPrivateKeyPopup {

    open() {
        if(document.getElementById('pbq-backup-private-key-popup')) {
            document.getElementById('pbq-backup-private-key-popup').remove();
        }

        document.body.insertAdjacentHTML('beforeend', this.getHtml());

        setTimeout(()=>{
            this.wrapper = document.getElementById('pbq-backup-private-key-popup');
            this.dialog = new MDCDialog(this.wrapper);
            this.form = this.wrapper.querySelector('form');
            this.form.addEventListener('submit', this.submitPassword.bind(this));


            this.dialog.listen('MDCDialog:closed', () => {
            });

            this.dialog.open();
        }, 0);

    }

    submitPassword(e){
        e.preventDefault();
        let password = this.wrapper.querySelector('.pbq-input').value;
        let encryptedBrainKey = localStorage.getItem('pbq_encrypted_brain_key');

        if (PbqCrypt.checkPassword(encryptedBrainKey, password)) {
            const brainKey = PbqCrypt.getDecryptedBrainKey(encryptedBrainKey, password);
            this.decryptedPrivateKey = PbqCrypt.getPrivateKey(brainKey);
            this.decryptedBrainKey = PbqCrypt.getDecryptedBrainKey(encryptedBrainKey, password);
        }

        if (this.decryptedPrivateKey) {
            let str = this.getFinalHtml();
            str = str.replace('{private_key}',this.decryptedPrivateKey);

            this.wrapper.querySelector('.mdc-dialog__content').innerHTML = str;

            setTimeout(() => {
                this.backupCheckbox = this.wrapper.querySelector('.pbq-regular-checkbox');
                this.submitButton = this.wrapper.querySelector('.pbq-submit-button');
                this.backupCheckbox.addEventListener('change', (e) => {
                    e.preventDefault();

                    if(e.target.checked === true) {
                        this.submitButton.removeAttribute('disabled');
                    } else {
                        this.submitButton.setAttribute('disabled', 'disabled');
                    }
                });

                this.submitButton.addEventListener('click', (e) => {
                    e.preventDefault();

                    PubliqOauth.setPrivateKeySaved(this.decryptedBrainKey)
                        .then(result => {
                            window.pbqWalletPage.privateKeySaved = 'true';
                            localStorage.setItem('pbq_wallet_private_key_saved', 'true');
                            window.pbqWalletPage.privateKeySection();
                            window.pbqWalletPage.securitySection();
                            this.dialog.close();
                        })
                });
            })
        } else {
            PbqNotifier.open('Incorrect Password');
        }
    }



    getHtml() {
        return '<div id="pbq-backup-private-key-popup" class="mdc-dialog"\n' +
            '     role="alertdialog"\n' +
            '     aria-modal="true"\n' +
            '     aria-labelledby="my-dialog-title"\n' +
            '     aria-describedby="my-dialog-content">\n' +
            '  <div class="mdc-dialog__container">\n' +
            '    <div class="mdc-dialog__surface">\n' +
            '      <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->\n' +
            '      <h2 class="mdc-dialog__title" id="my-dialog-title"><!--\n' +
            '     -->Private key<!--\n' +
            '   --></h2>\n' +
            '      <div class="mdc-dialog__content" id="my-dialog-content">' +
            '        <form>' +
            '          <p>Enter your password to see your private key.</p>' +
            '          <input type="password" class="pbq-input" />' +
            '          <button class="pbq-button">Continue</button>' +
            '        </form>' +
            '      </div>\n' +
            '    </div>\n' +
            '  </div>\n' +
            '  <div class="mdc-dialog__scrim"></div>\n' +
            '</div>'
    }

    getFinalHtml() {
        return '     <p>' +
            '          Private key is a secret key. It is the only way to decrypt the encrypted data. You might need this to transfer your funds to other wallets' +
            '        </p>' +
            '        <div class="pbq-private-key-container">' +
            '           {private_key}' +
            '        </div>' +
            '        <div class="pbq-checkbox-container">' +
            '            <label>' +
            '                <input class="pbq-regular-checkbox" type="checkbox" >' +
            '                <span class="pbq-checkbox-text" >Backed up</span>' +
            '            </label>' +
            '        </div>' +
            '        <div>' +
            '            <button class="pbq-button pbq-submit-button" disabled="disabled">Confirm</button>' +
            '        </div>';
    }
}
