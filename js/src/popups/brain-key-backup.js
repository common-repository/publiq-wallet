import {MDCDialog} from '@material/dialog';
import { KeyPair } from 'cryptography-ts';
import {PbqNotifier} from "../notifier";
import {PbqCrypt} from "../crypt";
import {PubliqOauth} from "../oauth";

export class PbqBackupBrainKeyPopup {

    open() {
        if(document.getElementById('pbq-backup-brain-key-popup')) {
            document.getElementById('pbq-backup-brain-key-popup').remove();
        }

        document.body.insertAdjacentHTML('beforeend', this.getHtml());

        setTimeout(()=>{
            this.wrapper = document.getElementById('pbq-backup-brain-key-popup');
            this.dialog = new MDCDialog(this.wrapper);
            this.form = this.wrapper.querySelector('form');
            this.form.addEventListener('submit', this.submitPassword.bind(this));

            this.dialog.listen('MDCDialog:closed', () => {
                this.decryptedBrainKey = null;
            });

            this.dialog.open();
        }, 0);

    }

    submitPassword(e){
        e.preventDefault();
        let password = this.wrapper.querySelector('.pbq-input').value;
        let encryptedBrainKey = localStorage.getItem('pbq_encrypted_brain_key');

        if (PbqCrypt.checkPassword(encryptedBrainKey, password)) {
            this.decryptedBrainKey = PbqCrypt.getDecryptedBrainKey(encryptedBrainKey, password);
        }

        if (this.decryptedBrainKey) {
            let str = this.getSeconStepHtml();
            str = str.replace('{brain_key}',this.decryptedBrainKey);

            this.wrapper.querySelector('.mdc-dialog__content').innerHTML = str;

            setTimeout(() => {
                this.wrapper.querySelector('.pbq-next-button').addEventListener('click', this.initThirdStep.bind(this));
            },0);

        } else {
            PbqNotifier.open('Incorrect Password');
        }
    }

    initThirdStep(e) {
        e.preventDefault();

        let html = this.getFinalStepHtml();

        let chuckSize = 4;

        this.checkingPhrasesArray = [];
        this.decryptedBrainKeySplited = this.decryptedBrainKey.split(' ');
        if (Array.isArray(this.decryptedBrainKeySplited)) {
            this.chuckedBrainKeyArray = [];
            let nextChunckedList;
            let randomPhrasekey;
            for (let i = 0; i < this.decryptedBrainKeySplited.length; i += chuckSize) {
                nextChunckedList = this.decryptedBrainKeySplited.slice(i, chuckSize + i);
                const rand = nextChunckedList[Math.floor(Math.random() * nextChunckedList.length)];
                this.decryptedBrainKeySplited.map((k, v) => (rand == k) ? randomPhrasekey = v : '');
                this.checkingPhrasesArray.push(randomPhrasekey);
                this.chuckedBrainKeyArray.push(nextChunckedList);
            }
            this.checkingPhrasesArray = PbqBackupBrainKeyPopup.shuffle(this.checkingPhrasesArray);
        }

        html = html.replace(/{first_index}/g,this.checkingPhrasesArray[0] + 1);
        html = html.replace(/{first_data_index}/g,this.checkingPhrasesArray[0]);
        html = html.replace(/{second_index}/g,this.checkingPhrasesArray[1] + 1);
        html = html.replace(/{second_data_index}/g,this.checkingPhrasesArray[1]);
        html = html.replace(/{third_index}/g,this.checkingPhrasesArray[2] + 1);
        html = html.replace(/{third_data_index}/g,this.checkingPhrasesArray[2]);
        html = html.replace(/{fourth_index}/g,this.checkingPhrasesArray[3] + 1);
        html = html.replace(/{fourth_data_index}/g,this.checkingPhrasesArray[3]);

        this.wrapper.querySelector('.mdc-dialog__content').innerHTML = html;

        setTimeout(() => {
            this.wrapper.querySelector('.pbq-back-btn').addEventListener('click', () => {
                this.dialog.close();
            });


            this.backupForm = this.wrapper.querySelector('#pbq-backup-bk-form');

            this.backupForm.addEventListener('submit', this.submitBackup.bind(this));
        },0);
    }

    submitBackup(e) {
        e.preventDefault();

        let firstInput = this.backupForm.querySelector('.pbq-backup-bk-first-input');
        let secondInput = this.backupForm.querySelector('.pbq-backup-bk-second-input');
        let thirdInput = this.backupForm.querySelector('.pbq-backup-bk-third-input');
        let fourthInput = this.backupForm.querySelector('.pbq-backup-bk-fourth-input');

        let firstInputIndex = firstInput.getAttribute('data-index');
        let secondInputIndex = secondInput.getAttribute('data-index');
        let thirdInputIndex = thirdInput.getAttribute('data-index');
        let fourthInputIndex = fourthInput.getAttribute('data-index');


        if ((this.decryptedBrainKeySplited[firstInputIndex].trim() === firstInput.value.trim())
            && (this.decryptedBrainKeySplited[secondInputIndex].trim() === secondInput.value.trim())
            && (this.decryptedBrainKeySplited[thirdInputIndex].trim() === thirdInput.value.trim())
            && (this.decryptedBrainKeySplited[fourthInputIndex].trim() === fourthInput.value.trim())
        ) {
            PubliqOauth.setBrainKeySaved(this.decryptedBrainKey)
                .then(data => {
                    window.pbqWalletPage.brainKeySaved = 'true';
                    localStorage.setItem('pbq_wallet_brain_key_saved', 'true');
                    window.pbqWalletPage.brainKeySection();
                    window.pbqWalletPage.securitySection();
                    window.pbqWalletPage.privateKeySection();
                    this.dialog.close();
                });
        } else {
            this.backupForm.querySelector('.pbq-text-error').style.display = 'block';

        }
    }

    static shuffle(array) {
        let counter = array.length;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            const index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            const temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }


    getHtml() {
        return '<div id="pbq-backup-brain-key-popup" class="mdc-dialog"\n' +
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

    getSeconStepHtml() {
        return '     <p>' +
            '          If someone were to find your recovery phrase they could access your wallet. It is strongly recommended to store your recovery phrase in physically separate, offline environment.' +
            '        </p>' +
            '        <p class="pbq-only-way-text">' +
            '          Your recovery phrase is the only way to reset your web wallet password.' +
            '        </p>' +
            '        <div class="pbq-private-key-container">' +
            '           {brain_key}' +
            '        </div>' +
            '        <p>In the next step, you will need to enter four words from the recovery phrase in a random order.</p>' +
            '        <div class="pbq-submit-container">' +
            '            <button class="pbq-button pbq-next-button" type="button">Next</button>' +
            '        </div>';
    }


    getFinalStepHtml() {
        return '     <p>' +
            '          Please enter the words from your recovery phrase in the required order.' +
            '        </p>' +
            '<form id="pbq-backup-bk-form">' +
            '    <div class="pbq-backup-form-inner">' +
            '        <div class="pbq-backup-bk-input-wrap">' +
            '            <input type="text" class="pbq-backup-bk-first-input" data-index="{first_data_index}" />' +
            '            <span>Word {first_index}</span>' +
            '        </div>' +
            '        <div class="pbq-backup-bk-input-wrap">' +
            '            <input type="text" class="pbq-backup-bk-second-input" data-index="{second_data_index}" />' +
            '            <span>Word {second_index}</span>' +
            '        </div>' +
            '        <div class="pbq-backup-bk-input-wrap">' +
            '            <input type="text" class="pbq-backup-bk-third-input" data-index="{third_data_index}" />' +
            '            <span>Word {third_index}</span>' +
            '        </div>' +
            '        <div class="pbq-backup-bk-input-wrap">' +
            '            <input type="text" class="pbq-backup-bk-fourth-input" data-index="{fourth_data_index}" />' +
            '            <span>Word {fourth_index}</span>' +
            '        </div>' +
            '    </div>' +
            '    <div class="pbq-see-btns">' +
            '        <button class="pbq-button pbq-back-btn">Back</button>' +
            '        <button class="pbq-button pbq-done-btn">Done</button>' +
            '    </div>' +
            '<span  class="pbq-text-error">Something went wrong. Make sure you entered the words from recovery phrase in correct order.</span>' +
            '</form>';
    }
}
