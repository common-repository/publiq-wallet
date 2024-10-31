import {MDCDialog} from '@material/dialog';
import {PbqCrypt} from "../crypt";
import {PbqNotifier} from "../notifier";
import PubliqNotEnoughBalance from 'blockchain-models-ts/bin/models/PubliqNotEnoughBalance';


export class PbqTransferConfirmPopup {

    constructor(brainKey) {
        this.decryptedBrainKey = brainKey;
    }

    open(publicKey, amount, memo, fee) {
        this.publicKey = publicKey;
        this.amount = amount;
        this.memo = memo;
        this.fee = fee;

        if(document.getElementById('pbq-transfer-confirm-popup')) {
            document.getElementById('pbq-transfer-confirm-popup').remove();
        }

        let html = this.getHtml();

        html = html.replace('{address}', this.publicKey);
        html = html.replace('{amount}', this.amount);
        html = html.replace('{fee}', this.fee);
        html = html.replace('{memo}', this.memo);

        document.body.insertAdjacentHTML('beforeend', html);

        setTimeout(()=>{
            this.wrapper = document.getElementById('pbq-transfer-confirm-popup');
            this.dialog = new MDCDialog(this.wrapper);
            this.confirmBtn = this.wrapper.querySelector('#pbq-transfer-confirm-btn');
            this.cancelBtn = this.wrapper.querySelector('#pbq-transfer-cancel-btn');

            this.confirmBtn.addEventListener('click', this.transfer.bind(this));
            this.cancelBtn.addEventListener('click', (e) => {
               e.preventDefault();
               this.dialog.close();
            });

            this.dialog.listen('MDCDialog:closed', () => {

            });

            this.dialog.open();
        }, 0);
    }

    transfer(e) {
        e.preventDefault();


        PbqCrypt.transfer(this.decryptedBrainKey,this.publicKey,this.amount,this.memo)
            .then(response => response.json())
            .then(data => {
                const isValidData = PbqCrypt.checkBlockChainResponse(data);
                if (isValidData.success) {
                    PbqNotifier.open('Your transaction is successfully complete');
                    window.pbqWalletPage.getBalance();
                } else {
                    if (isValidData.data instanceof PubliqNotEnoughBalance) {
                        PbqNotifier.open('Your balance is not enough');
                    } else {
                        PbqNotifier.open('Transfer failed');
                    }
                }
            });
    }

    getHtml() {
        return '<div id="pbq-transfer-confirm-popup" class="mdc-dialog"\n' +
            '     role="alertdialog"\n' +
            '     aria-modal="true"\n' +
            '     aria-labelledby="my-dialog-title"\n' +
            '     aria-describedby="my-dialog-content">\n' +
            '  <div class="mdc-dialog__container">\n' +
            '    <div class="mdc-dialog__surface">\n' +
            '      <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->\n' +
            '      <h2 class="mdc-dialog__title" id="my-dialog-title"><!--\n' +
            '     -->Review and confirm your transfer<!--\n' +
            '   --></h2>\n' +
            '      <div class="mdc-dialog__content" id="my-dialog-content">' +
            '        <form class="pbq-transfer-confirm-form">' +
            '          <p>Please note, there is no way to cancel confirmed transaction.</p>' +
            '          <div class="pbq-divs pbq-address">' +
            '              <span>Recipient address: </span>' +
            '              <span>{address}</span>' +
            '          </div>' +
            '          <div class="pbq-divs pbq-short">' +
            '              <span>Amount: </span>' +
            '              <span>{amount} PBQ</span>' +
            '          </div>' +
            '          <div class="pbq-divs pbq-short">' +
            '              <span>Transaction fee: </span>' +
            '              <span>{fee} PBQ</span>' +
            '          </div>' +
            '          <div class="pbq-divs">' +
            '              <span>Message: </span>' +
            '              <span>{memo}</span>' +
            '          </div>' +
            '          <div class="pbq-last-btn-div pbq-transaction-btns">' +
            '              <button class="pbq-button" id="pbq-transfer-confirm-btn">Confirm</button>' +
            '              <button class="pbq-button pbq-cancel-btn" id="pbq-transfer-cancel-btn" >Cancel</button>' +
            '          </div>' +
            '          ' +
            '        </form>' +
            '      </div>\n' +
            '    </div>\n' +
            '  </div>\n' +
            '  <div class="mdc-dialog__scrim"></div>\n' +
            '</div>'
    }
}
