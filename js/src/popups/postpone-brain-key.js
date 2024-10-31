import {MDCDialog} from '@material/dialog';
import {PubliqOauth} from "../oauth";

export class PbqPostponeBrainKeyPopup {

    constructor(brainKey){
        this.decryptedBrainKey = brainKey;
    }
    open() {
        if(document.getElementById('pbq-postpone-brain-key-popup')) {
            document.getElementById('pbq-postpone-brain-key-popup').remove();
        }

        document.body.insertAdjacentHTML('beforeend', this.getHtml());

        setTimeout(()=>{
            this.wrapper = document.getElementById('pbq-postpone-brain-key-popup');
            this.dialog = new MDCDialog(this.wrapper);

            this.wrapper.querySelector('.pbq-postpone-bk-no-btn').addEventListener('click', (e) => {
                e.preventDefault();
                this.dialog.close();
            });

            this.wrapper.querySelector('.pbq-postpone-bk-yes-btn').addEventListener('click', (e) => {
                e.preventDefault();

                let brainKey = localStorage.getItem('pbq_encrypted_brain_key');
                PubliqOauth.setBrainKeySeen(this.decryptedBrainKey)
                    .then(result => {
                        if(result.status === 204) {

                            this.dialog.close();
                            localStorage.setItem('pbq_wallet_brain_key_seen', 'true');
                            window.pbqWalletPage.brainKeySeen = 'true';
                            window.pbqWalletPage.securitySection();
                            window.pbqWalletPage.privateKeySection();
                            window.pbqWalletPage.brainKeySection();
                        }
                    });

            });

            this.dialog.listen('MDCDialog:closed', () => {
                this.decryptedBrainKey = null;
            });

            this.dialog.open();
        }, 0);

    }

    getHtml() {
        return '<div id="pbq-postpone-brain-key-popup" class="mdc-dialog"\n' +
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
            '      <div class="mdc-dialog__content">' +
            '          <p>Are you sure you want to postpone your recovery phrase backup?</p>' +
            '          <p class="pbq-keys-text" >In case you press>In case you press "Yes" and forget your password until next login, there will be no way to restore your wallet.</p>' +
            '          <div class="pbq-btn-div">' +
            '              <button class="pbq-button pbq-postpone-bk-no-btn">NO</button>' +
            '              <button class="pbq-button  pbq-postpone-bk-yes-btn">YES</button>' +
            '          </div>' +
            '      </div>\n' +
            '    </div>\n' +
            '  </div>\n' +
            '  <div class="mdc-dialog__scrim"></div>\n' +
            '</div>'
    }
}
