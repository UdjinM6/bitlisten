/** 
 *  @constructor
 *  @extends Floatable
 */
const currencyFormatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 0,
	maximumFractionDigits: 2
});

function Transaction(bitcoins, highlight, currency, currencyName) {
	if (document.visibilityState === "visible") {
		Floatable.call(this);

		var maxSize = Math.min(document.body.clientWidth, document.body.clientHeight);
		var minVelocity = 0.5;
		var maxVelocity = 1.0;
		this.area = bitcoins * 100 + 3000;
		this.width = this.height = Math.min(Math.sqrt(this.area / Math.PI) * 2, maxSize);
		this.velocity.y = -1 * ((maxSize - this.width) / (maxSize / (maxVelocity - minVelocity)) + minVelocity);

		this.addImage(bubbleImage, this.width, this.height);
	
	    var bitcoinVal = bitcoins.toFixed(2);
	    var bitcoinString;
	    
	    if(globalShowDollar === true) {
		    bitcoinString = currencyFormatter.format(bitcoins*globalRate);    
    	} else if (bitcoinVal === "0.00") {
	        bitcoinString = "&lt;<span class='bitcoinsymbol'>&nbsp;&nbsp;&nbsp;&nbsp;</span>0.01";
	    } else {
	        bitcoinString = "<span class='bitcoinsymbol'>&nbsp;&nbsp;&nbsp;&nbsp;</span>" + bitcoinVal;
	    }
	
		if (highlight) {
			bitcoinString = '<br /><span style="color: yellow;">' + bitcoinString + '</span><br /><span style="color: cyan;">Donation</span><br /><span style="color: lime;">Thanks!</span>';
		}
		if (currency && currencyName) {
			bitcoinString += '<br />' + currency.toFixed(2) + ' ' + currencyName;
		}
		this.addText(bitcoinString);
		this.initPosition();
		
		// Sound
	    var maxBitcoins = 1000;
	    var minVolume = 0.3;
	    var maxVolume = 0.7;
	    var volume = bitcoins / (maxBitcoins / (maxVolume - minVolume)) + minVolume;
	    if (volume > maxVolume)
		    volume = maxVolume;
	
	    var maxPitch = 100.0;
	    // We need to use a log that makes it so that maxBitcoins reaches the maximum pitch.
	    // Well, the opposite of the maximum pitch. Anyway. So we solve:
	    // maxPitch = log(maxBitcoins + logUsed) / log(logUsed)
	    // For maxPitch = 100 (for 100%) and maxBitcoins = 1000, that gives us...
	    var logUsed = 1.0715307808111486871978099;
	    // So we find the smallest value between log(bitcoins + logUsed) / log(logUsed) and our max pitch...
	    var pitch = Math.min(maxPitch, Math.log(bitcoins + logUsed) / Math.log(logUsed));
	    // ...we invert it so that a bigger transaction = a deeper noise...
	    pitch = maxPitch - pitch;
	    // ...and we play the sound!
	    if(globalScalePitch) {
		    Sound.playPitchAtVolume(volume, pitch);
	    } else {
		    Sound.playRandomAtVolume(volume);
	    }
	}

    transaction_count++;
    transaction_total+=bitcoins;
    $("#txCount").text(transaction_count);
    $("#txTotal").text(transaction_total.toFixed(8));
}

extend(Floatable, Transaction);
