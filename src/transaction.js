/**
 *  @constructor
 *  @extends Floatable
 */
function Transaction(dashs, isDonation, currency, currencyName) {
    if (document.visibilityState === "visible") {
        Floatable.call(this);

        this.area = dashs * 100 + 3000;
        this.width = this.height = Math.sqrt(this.area / Math.PI) * 2;

        this.addImage(bubbleImage, this.width, this.height);

        var dashVal = dashs.toFixed(2);
        var dashString;

        if (dashVal === "0.00") {
            dashString = "&lt;<span class='bitcoinsymbol'>&nbsp;&nbsp;&nbsp;&nbsp;</span>0.01";
        } else {
            dashString = "<span class='bitcoinsymbol'>&nbsp;&nbsp;&nbsp;&nbsp;</span>" + dashVal;
        }

        this.addText(dashString);

        if (isDonation) {
            this.addText('<br /><span style="color: yellow;">Donation</span><br /><span style="color: lime;">Thanks!</span>');
        }

        if (currency && currencyName) {
            this.addText('<br />' + currency.toFixed(2) + ' ' + currencyName);
        }
        this.initPosition();

        // Sound
        var maxDashs = 1000;
        var minVolume = 0.3;
        var maxVolume = 0.7;
        var volume = dashs / (maxDashs / (maxVolume - minVolume)) + minVolume;
        if (volume > maxVolume)
            volume = maxVolume;

        var maxPitch = 100.0;
        // We need to use a log that makes it so that maxDashs reaches the maximum pitch.
        // Well, the opposite of the maximum pitch. Anyway. So we solve:
        // maxPitch = log(maxDashs + logUsed) / log(logUsed)
        // For maxPitch = 100 (for 100%) and maxDashs = 1000, that gives us...
        var logUsed = 1.0715307808111486871978099;
        // So we find the smallest value between log(dashs + logUsed) / log(logUsed) and our max pitch...
        var pitch = Math.min(maxPitch, Math.log(dashs + logUsed) / Math.log(logUsed));
        // ...we invert it so that a bigger transaction = a deeper noise...
        pitch = maxPitch - pitch;
        // ...and we play the sound!
        if(globalScalePitch) {
            Sound.playPitchAtVolume(volume, pitch);
        } else {
            Sound.playRandomAtVolume(volume);
        }

        transaction_count++;

        if (transaction_count === 5) {
            document.getElementById("waitingForTransactions").style.opacity = "0";
        }

    }

}

extend(Floatable, Transaction);
