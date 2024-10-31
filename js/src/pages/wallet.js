import {PubliqAccount} from "../account";
import {PbqNotifier} from "../notifier";
import {PbqShowPrivateKeyPopup} from "../popups/show-private-key";
import {PbqShowBrainKeyPopup} from "../popups/show-brain-key";
import {PbqCrypt} from "../crypt";
import {PbqPostponeBrainKeyPopup} from "../popups/postpone-brain-key";
import {PbqUtils} from "../utils";
import { validate } from 'cryptography-ts/bin/public-key-validator';
import {PbqTransferPasswordPopup} from "../popups/transfer-password";
import {PbqBackupBrainKeyPopup} from "../popups/brain-key-backup";
import {PbqBackupPrivateKeyPopup} from "../popups/private-key-backup";
import {PubliqOauth} from "../oauth";

export class PbqWalletPage {
    constructor(wrapper, token) {
        this.wrapper = wrapper;
        this.token = token;

        this.encryptedBrainKey = localStorage.getItem('pbq_encrypted_brain_key');

        this.load();
    }

    load() {
        let url = new URL(pbqL10n.ajaxUrl)

        var params = [['action', 'pbq_wallet_content']];

        url.search = new URLSearchParams(params)
        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    this.wrapper.innerHTML = result.content;

                    setTimeout(() => {
                        this.init()
                    }, 0);
                }
            });
    }

    init() {
        this.brainKeySaved = localStorage.getItem('pbq_wallet_brain_key_saved');
        this.privateKeySaved = localStorage.getItem('pbq_wallet_private_key_saved');
        this.brainKeySeen = localStorage.getItem('pbq_wallet_brain_key_seen');
        let accordions = [...document.querySelectorAll('.pbq-single-tab-heading')];

        if (accordions.length) {
            accordions.forEach(accordion => {
                accordion.addEventListener('click', PbqWalletPage.toggleAccordion);
            })
        }

        PbqWalletPage.bindTabs();

        document.getElementById('pbq-wallet-signout').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        this.securityWrap = document.querySelector('.pbq-security');
        this.brainKeyWrap = document.querySelector('.pbq-brain-key-section');
        this.backupWrap = document.querySelector('.pbq-backup-form');


        this.getUserInfo();
        this.securitySection();
        this.privateKeySection();
        this.brainKeySection();

        let copyBtns = [...this.wrapper.querySelectorAll('.copy-btn')];

        if (copyBtns.length) {
            copyBtns.forEach(copyBtn => {
                copyBtn.addEventListener('click', this.copyContext.bind(this));
            })
        }

        document.getElementById('pbq-show-private-key').addEventListener('click', () => {
            if (!this.privateKeyPopup) {
                this.privateKeyPopup = new PbqShowPrivateKeyPopup();
            }

            setTimeout(() => {
                this.privateKeyPopup.open();
            }, 0);
        });

        document.getElementById('pbq-show-brain-key').addEventListener('click', () => {
            if (!this.brainKeyPopup) {
                this.brainKeyPopup = new PbqShowBrainKeyPopup();
            }

            setTimeout(() => {
                this.brainKeyPopup.open();
            }, 0);
        });

        this.transferAmountInput = document.getElementById('pbq-transfer-amount');
        this.transferForm = document.getElementById('pbq-transfer-form');
        this.transferAddressInput = document.getElementById('pbq-transfer-address');
        this.transferMemoInput = document.getElementById('pbq-transfer-memo');

        this.transferAmountInput.addEventListener('keyup', this.validateAmount.bind(this));
        this.transferForm.addEventListener('submit', this.transfer.bind(this));

        this.brainKeyForm = this.brainKeyWrap.querySelector('.pbq-brain-key-form');
        if(this.brainKeyForm){
            this.brainKeyForm.addEventListener('submit', this.showBrainKey.bind(this));
        }
        this.brainKeyWrap.querySelector('#pbq-brain-key-backup-later').addEventListener('click', () => {
            if(!this.postponeBrainKeyPopup){
                this.postponeBrainKeyPoup = new PbqPostponeBrainKeyPopup(this.decryptedBrainKey);
            }

            this.postponeBrainKeyPoup.open();
        })


        let brainKeyBackupButtons = [...document.querySelectorAll('.pbq-backup-brain-key')];

        brainKeyBackupButtons.forEach(btn =>{
            btn.addEventListener('click', (e) => {
                e.preventDefault();
               if(!this.brainKeyBackupPopup){
                   this.brainKeyBackupPopup = new PbqBackupBrainKeyPopup();
               }

               this.brainKeyBackupPopup.open();
            });
        });


        this.wrapper.querySelector('.pbq-backup-private-key').addEventListener('click', (e) => {
            e.preventDefault();

            if(!this.privateKeyBackupPopup) {
                this.privateKeyBackupPopup = new PbqBackupPrivateKeyPopup();
            }

            this.privateKeyBackupPopup.open();
        })

    }


    validateAmount(e){
        let amount = e.target.value;
        let fee = 0;

        let erroElem = e.target.parentNode.querySelector('.pbq-error-msg');

        if(PbqUtils.calcAmount(amount) > (PbqUtils.calcAmount(this.balance) - PbqUtils.calcAmount(fee))) {
            erroElem.style.display = 'block';
        } else {
            erroElem.style.display = 'none';
        }
    }

    transfer(e) {
        e.preventDefault();

        let amount = this.transferAmountInput.value;
        let fee = 0;
        let address =this.transferAddressInput.value;
        let memo = this.transferMemoInput.value;

        if(PbqUtils.calcAmount(amount) <= 0 || PbqUtils.calcAmount(amount) > (PbqUtils.calcAmount(this.balance) - PbqUtils.calcAmount(fee))) {
            PbqNotifier.open('Invalid amount');
            return;
        }

        if(this.publicKey === address){
            PbqNotifier.open('Cannot transfer to same account');
            return;
        }

        if(!validate('TPBQ', address)){
            PbqNotifier.open('Invalid Address');
            return;
        }

        if(!this.transferPasswordPopup){
            this.transferPasswordPopup = new PbqTransferPasswordPopup();
        }

        this.transferPasswordPopup.open(address, amount, memo, fee);

    }

    copyContext(e) {
        e.preventDefault();
        PbqWalletPage.copyToClipboard(e.target.closest('.pbq-field-wrap').querySelector('.pbq-field').textContent);
        PbqNotifier.open('Copied');
    }

    brainKeySection() {
        if (this.brainKeySaved === 'true') {
            document.getElementById('pbq-brain-key-wrap').classList.add('pbq-form-line-verified');
        }
        //
    }

    privateKeySection() {
        if (this.privateKeySaved === 'true') {
            document.getElementById('pbq-private-key-wrap').classList.add('pbq-form-line-verified');
        }
        //
    }

    securitySection() {
        this.brainKeySaved = localStorage.getItem('pbq_wallet_brain_key_saved');
        this.privateKeySaved = localStorage.getItem('pbq_wallet_private_key_saved');
        this.brainKeySeen = localStorage.getItem('pbq_wallet_brain_key_seen');

        if (this.brainKeySaved === 'true' && this.brainKeySeen === 'true' && this.privateKeySaved === 'true') {
            this.securityWrap.style.display = 'none';
            this.brainKeyWrap.style.display = 'none';
            this.backupWrap.style.display = 'block';
            return;
        }

        if(this.brainKeySeen !== 'true') {
            this.backupWrap.style.display = 'none';
            this.securityWrap.style.display = 'block';
            this.brainKeyWrap.style.display = 'block';
            if(this.securityWrap){
                this.securityWrap.querySelector('.backup-info').innerHTML = 'You have to backup your recovery phrase. It is strongly recommended to store the backup copies in physically separate, offline environment. If someone were to find your recovery phrase they could access your wallet.Your recovery phrase is the only way to reset your web wallet password.';
                if(this.securityWrap.querySelector('.backup-steps')) {
                    this.securityWrap.querySelector('.backup-steps').remove();
                }
                if(this.securityWrap.querySelector('.pbq-security-footer')) {
                    this.securityWrap.querySelector('.pbq-security-footer').remove();
                }
                if(this.securityWrap.querySelector('.pbq-security-level-1')) {
                    this.securityWrap.querySelector('.pbq-security-level-1').remove();
                }
                if(this.securityWrap.querySelector('.pbq-security-level-2')) {
                    this.securityWrap.querySelector('.pbq-security-level-2').remove();
                }

            }

            this.brainKeyWrap.querySelector('.pbq-brain-key-details').style.display = 'none';
            this.initBrainKeyForm();
        } else if(this.brainKeySaved === 'true' && this.privateKeySaved === 'true') {
            this.brainKeyWrap.style.display = 'none';
            this.securityWrap.style.display = 'block';
            this.backupWrap.style.display = 'none';
            this.securityWrap.querySelector('.pbq-security-content').remove();
            this.securityWrap.querySelector('.pbq-security-footer').remove();
        } else if(this.brainKeySaved === 'true' || this.privateKeySaved === 'true') {
            this.brainKeyWrap.style.display = 'none';
            this.securityWrap.style.display = 'block';
            this.backupWrap.style.display = 'block';
            if(this.securityWrap.querySelector('.pbq-security-level-2')) {
                this.securityWrap.querySelector('.pbq-security-level-2').remove();
            }
        } else {
            this.brainKeyWrap.style.display = 'none';
            this.securityWrap.style.display = 'none';
            this.backupWrap.style.display = 'block';
        }
    }

    initBrainKeyForm() {
        this.brainKeyWrap.querySelector('.pbq-brain-key-inner').insertAdjacentHTML('beforeend', this.getBrainKeyForm());
        setTimeout(() => {

        }, 0);
    }

    showBrainKey(e) {
        e.preventDefault();

        let password = this.brainKeyForm.querySelector('.pbq-brain-key-form-password').value;

        if(PbqCrypt.checkPassword(this.encryptedBrainKey, password)) {
            this.decryptedBrainKey = PbqCrypt.getDecryptedBrainKey(this.encryptedBrainKey, password);
        }

        if (this.decryptedBrainKey) {
            this.brainKeyForm.remove();

            this.brainKeyWrap.querySelector('.pbq-brain-key-details').style.display = 'block';
            this.brainKeyWrap.querySelector('#pbq-brain-key-first-time').innerHTML = this.decryptedBrainKey;

            PubliqOauth.setBrainKeySeen(this.decryptedBrainKey)
                .then(result => {
                    if(result.status === 204) {
                        localStorage.setItem('pbq_wallet_brain_key_seen', 'true');
                        this.brainKeySeen = 'true';
                    }
                });
        } else {
            PbqNotifier.open('Incorrect Password');
        }
    }

    getBrainKeyForm() {
        return '<form class="pbq-brain-key-form">\n' +
            '                    <input type="password" class="pbq-brain-key-form-password pbq-input" placeholder="Password" />\n' +
            '                    <button class="pbq-brain-key-submit pbq-button">Show</button>\n' +
            '                </form>';
    }

    logout() {
        localStorage.removeItem('pbq_oauth_token');
        localStorage.removeItem('pbq_encrypted_brain_key');
        localStorage.removeItem('pbq_wallet_brain_key_saved');
        localStorage.removeItem('pbq_wallet_private_key_saved');
        localStorage.removeItem('pbq_wallet_brain_key_seen');
        window.location.reload();
    }

    getUserInfo() {
        PubliqAccount.getUserInfo(this.token)
            .then(response => {
                if (response.status === 401) {
                    this.logout();
                }

                return response.json();
            })
            .then(result => {
                if (result.hasOwnProperty('publicKey')) {
                    PubliqAccount.setAccountInfo(result);

                    document.getElementById('pbq-qr').innerHTML = '<img class="qr-code-img" src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=' + result.publicKey + '&choe=UTF-8&chld=L|1" alt="QR code" />';
                    document.getElementById('pbq-public-key').innerHTML = result.publicKey;
                    document.getElementById('pbq-address').innerHTML = result.publicKey;
                    document.getElementById('pbq-user-email').innerHTML = result.email;

                    this.publicKey = result.publicKey;

                    this.getBalance();
                }
            });
    }

    getBalance() {
        PubliqAccount.getBalance(this.publicKey)
            .then(response => response.json())
            .then(
                result => {
                    console.log(result);
                    if (result.hasOwnProperty('whole') && result.hasOwnProperty('fraction')) {
                        let balanceString = PbqUtils.getBalanceString(result.whole, result.fraction)//result.whole.toLocaleString() + '.' + parseInt(result.fraction);
                        this.balance = balanceString;
                        document.getElementById('pbq-balance').innerHTML = balanceString//.toLocaleString().replace(/[0]+$/, '');
                    }
                }
            )
    }

    static bindTabs() {
        var menuElements = [...document.querySelectorAll('[data-tab]')];
        for (let i = 0; i < menuElements.length; i++) {
            menuElements[i].addEventListener('click', PbqWalletPage.changeTab);
        }
    }

    static changeTab(e) {
        e.preventDefault();
        document.querySelector('.b-nav-tab.active').classList.remove('active');

        document.querySelector('.b-tab.active').classList.remove('active');
        e.currentTarget.classList.add('active');
        let id = e.currentTarget.getAttribute('data-tab');
        document.getElementById(id).classList.add('active');

    }

    static toggleAccordion(e) {
        let sectionElem = e.target.closest('.pbq-single-tab');
        e.target.classList.toggle('toggle-icon');

        sectionElem.querySelector('.pbq-tab-content').classList.toggle('close-acc');
    }

    static copyToClipboard(str) {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    };
}
