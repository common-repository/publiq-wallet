import {MDCDialog} from '@material/dialog';
import { KeyPair } from 'cryptography-ts';
import {PbqNotifier} from "../notifier";
import {PbqCrypt} from "../crypt";

export class PbqShowPrivateKeyPopup {

    open() {
        if(document.getElementById('pbq-private-key-popup')) {
            document.getElementById('pbq-private-key-popup').remove();
        }

        document.body.insertAdjacentHTML('beforeend', this.getHtml());

        setTimeout(()=>{
            this.wrapper = document.getElementById('pbq-private-key-popup');
            this.dialog = new MDCDialog(this.wrapper);
            this.form = this.wrapper.querySelector('form');
            this.form.addEventListener('submit', this.submit.bind(this));

            this.dialog.listen('MDCDialog:closed', () => {
                this.decriptedPrivateKey = null;
            });

            this.dialog.open();
        }, 0);

    }

    submit(e){
        e.preventDefault();
        let password = this.wrapper.querySelector('.pbq-input').value;
        let encryptedBrainKey = localStorage.getItem('pbq_encrypted_brain_key');

        if (PbqCrypt.checkPassword(encryptedBrainKey, password)) {
            const brainKey = PbqCrypt.getDecryptedBrainKey(encryptedBrainKey, password);
            this.decriptedPrivateKey = PbqCrypt.getPrivateKey(brainKey);
        }

        if (this.decriptedPrivateKey) {
            let str = this.getFinalHtml();
            str = str.replace('{private_key}',this.decriptedPrivateKey);

            this.wrapper.querySelector('.mdc-dialog__content').innerHTML = str;
        } else {
            PbqNotifier.open('Incorrect Password');
        }
    }



    getHtml() {
        return '<div id="pbq-private-key-popup" class="mdc-dialog"\n' +
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
            '        </div>';
    }
}
