export class PbqUtils {
    static calcAmount(amount, fractionCoif = Math.pow(10, 8)) {
        return amount * fractionCoif;
    }

    static getBalanceString(whole, fraction) {
        let balance;
        if (fraction) {
            balance = `${whole}.${fraction}`;
        } else {
            balance = `${whole}.000`;
        }
        return balance;
    }

    static multFloats(a, b) {
        const atens = Math.pow(10, String(a).length - String(a).indexOf('.') - 1), btens = Math.pow(10, String(b).length - String(b).indexOf('.') - 1);
        return Math.round((a * atens) * (b * btens) / (atens * btens));
    }
}
