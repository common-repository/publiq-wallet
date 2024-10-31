import {PbqCrypt} from "../crypt";
import {PbqNotifier} from "../notifier";
import {PbqTransferConfirmPopup} from "./transfer-confirm";
import {MDCDialog} from '@material/dialog';

export class PbqTransferPasswordPopup {

    open(publicKey, amount, memo, fee) {
        this.publicKey = publicKey;
        this.amount = amount;
        this.memo = memo;
        this.fee = fee;


        if(document.getElementById('pbq-transfer-password-popup')) {
            document.getElementById('pbq-transfer-password-popup').remove();
        }

        document.body.insertAdjacentHTML('beforeend', this.getHtml());

        setTimeout(()=>{
            this.wrapper = document.getElementById('pbq-transfer-password-popup');
            this.dialog = new MDCDialog(this.wrapper);
            this.form = this.wrapper.querySelector('form');
            this.form.addEventListener('submit', this.submit.bind(this));

            this.dialog.listen('MDCDialog:closed', () => {
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
            if(!this.confirmPopup){
                this.confirmPopup = new PbqTransferConfirmPopup(this.decriptedPrivateKey);
            }

            this.dialog.close();
            this.confirmPopup.open(this.publicKey, this.amount, this.memo, this.fee);
        } else {
            PbqNotifier.open('Incorrect Password');
        }
    }

    getHtml() {
        return '<div id="pbq-transfer-password-popup" class="mdc-dialog"\n' +
            '     role="alertdialog"\n' +
            '     aria-modal="true"\n' +
            '     aria-labelledby="my-dialog-title"\n' +
            '     aria-describedby="my-dialog-content">\n' +
            '  <div class="mdc-dialog__container">\n' +
            '    <div class="mdc-dialog__surface">\n' +
            '      <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->\n' +
            '      <h2 class="mdc-dialog__title" id="my-dialog-title"><!--\n' +
            '     -->Transfer<!--\n' +
            '   --></h2>\n' +
            '      <div class="mdc-dialog__content" id="my-dialog-content">' +
            '        <form>' +
            '          <p>Enter your password to proceed.</p>' +
            '          <input type="password" class="pbq-input" />' +
            '          <button class="pbq-button">Continue</button>' +
            '        </form>' +
            '      </div>\n' +
            '    </div>\n' +
            '  </div>\n' +
            '  <div class="mdc-dialog__scrim"></div>\n' +
            '</div>'
    }
}
