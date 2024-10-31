import {MDCDialog} from '@material/dialog';
import { KeyPair } from 'cryptography-ts';
import {PbqNotifier} from "../notifier";
import {PbqCrypt} from "../crypt";

export class PbqShowBrainKeyPopup {

    open() {
        if(document.getElementById('pbq-brain-key-popup')) {
            document.getElementById('pbq-brain-key-popup').remove();
        }

        document.body.insertAdjacentHTML('beforeend', this.getHtml());

        setTimeout(()=>{
            this.wrapper = document.getElementById('pbq-brain-key-popup');
            this.dialog = new MDCDialog(this.wrapper);
            this.form = this.wrapper.querySelector('form');
            this.form.addEventListener('submit', this.submit.bind(this));

            this.dialog.listen('MDCDialog:closed', () => {
                this.decryptedBrainKey = null;
            });

            this.dialog.open();
        }, 0);

    }

    submit(e){
        e.preventDefault();
        let password = this.wrapper.querySelector('.pbq-input').value;
        let encryptedBrainKey = localStorage.getItem('pbq_encrypted_brain_key');

        if (PbqCrypt.checkPassword(encryptedBrainKey, password)) {
            this.decryptedBrainKey = PbqCrypt.getDecryptedBrainKey(encryptedBrainKey, password);
        }

        if (this.decryptedBrainKey) {
            let str = this.getFinalHtml();
            str = str.replace('{brain_key}',this.decryptedBrainKey);

            this.wrapper.querySelector('.mdc-dialog__content').innerHTML = str;
        } else {
            PbqNotifier.open('Incorrect Password');
        }
    }




    getHtml() {
        return '<div id="pbq-brain-key-popup" class="mdc-dialog"\n' +
            '     role="alertdialog"\n' +
            '     aria-modal="true"\n' +
            '     aria-labelledby="my-dialog-title"\n' +
            '     aria-describedby="my-dialog-content">\n' +
            '  <div class="mdc-dialog__container">\n' +
            '    <div class="mdc-dialog__surface">\n' +
            '      <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->\n' +
            '      <h2 class="mdc-dialog__title" id="my-dialog-title"><!--\n' +
            '     -->Recovery phrase<!--\n' +
            '   --></h2>\n' +
            '      <div class="mdc-dialog__content" id="my-dialog-content">' +
            '        <form>' +
            '          <p>Enter your password to see your recovery phrase</p>' +
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
            '          If someone were to find your recovery phrase they could access your wallet. It is strongly recommended to store your recovery phrase in physically separate, offline environment.' +
            '        </p>' +
            '        <p class="pbq-only-way-text">' +
            '          Your recovery phrase is the only way to reset your web wallet password.' +
            '        </p>' +
            '        <div class="pbq-private-key-container">' +
            '           {brain_key}' +
            '        </div>';
    }
}
