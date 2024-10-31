import {MDCSnackbar} from '@material/snackbar';

export class PbqNotifier {

    static open(text) {
        if(!PbqNotifier.snackbar){
            PbqNotifier.snackbar = new MDCSnackbar(document.getElementById('pbq-notifier-snackbar'));
        }

        PbqNotifier.snackbar.labelText = text;
        PbqNotifier.snackbar.timeoutMs = 4000;
        PbqNotifier.snackbar.open();

    }
}
