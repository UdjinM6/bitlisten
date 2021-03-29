// Set debugmode to true and transactions/trades will be
// randomly generated, and no outside connections will be made.
var DEBUG_MODE = false;

var DONATION_ADDRESS;
var SOUND_DONATION_ADDRESS;

var globalMute = false;

var last_update = 0;

var updateTargets = [];

var transaction_count = 0;
var transaction_total = 0;

// Preload images
var bubbleImage = new Image();
bubbleImage.src = "images/bubble.png";
var blockImage = new Image();
blockImage.src = "images/block.png";

var debugSpawner;

var updateLayoutHeight = function() {
	var newHeight = window.innerHeight;
	if ($("#header").css("display") != "none") newHeight -= $("#header").outerHeight();
	$("#pageSplitter").height(newHeight);
};

$(document).ready(function() {

	DONATION_ADDRESS = $("#donationAddress").html();
	// Because the user has javascript running:
	$("#noJavascript").css("display", "none");

	updateLayoutHeight();

	StatusBox.init(DEBUG_MODE);

	$(".clickSuppress").click(function() {
		$(".clickSuppress").parent().slideUp(300);
	});

	// Create a bubble spawner for testing
	debugSpawner = function() {
		// Generate some test bubbles
		if (Math.random() <= 0.1) {
			// Try to simulate the transaction spread
			var volume;
			var order = Math.random();
			if (order < 0.6) {
				volume = Math.random();
			} else if (order < 0.8) {
				volume = Math.random() * 10;
			} else if (order < 0.95) {
				volume = Math.random() * 100;
			} else {
				volume = Math.random() * 1000;
			}

			if (Math.random() < 0.5)
				new Transaction(volume, false);
			else
				new Transaction(volume, false, volume * 75, 'USD');
		}
	};
	// Spam the following line into console, it's kind of fun.
	// new Transaction(12.345, false);
	// new Block(228158, 123, 12342342243, 153 * 1024);

	// look for url params
	urlParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (results===null){
			return null;
		}
		else{
			return results[1] || 0;
		}
	};

	if(urlParam('hide') == 1) {
		toggleInterface();
	}

	switchExchange("dashusd");
	
	// Attach mouseover qr
	$("#donationAddress").qr();
	$("#donationAddressBitListen").qr();
	$("#musicianDonation").qr();

	// Enable wake lock.
	// (must be wrapped in a user input event handler e.g. a mouse or touch handler)
	var noSleep = new NoSleep();
	document.addEventListener('click', function enableNoSleep() {
		document.removeEventListener('click', enableNoSleep, false);
		console.log("No sleep!");
		noSleep.enable();
	}, false);
});

// Function for handling interface show/hide
var toggleInterface = function() {
	if ($(".interface:hidden").length === 0) {
		$(".interface").fadeOut(500, updateLayoutHeight);
		$("#hideInterface").html("[ Show Interface ]");
		$("#hideInterface").css("opacity", "0.5");
	} else {
		$(".interface").fadeIn(500, updateLayoutHeight);
		$("#hideInterface").html("[ Hide Interface ]");
		$("#hideInterface").css("opacity", "1");
	}
};

var globalUpdate = function(time) {
	window.requestAnimationFrame(globalUpdate);
	var delta = time - last_update;
	txTime += delta/1000;
	last_update = time;
	for (var i = 0; i < updateTargets.length; i++) {
		updateTargets[i].update(delta);
	}
};

var txTime = 0;
var oneDay = 24*60*60;
var txTimeInterval;
var txTimer = function() {
	var days = (txTime / oneDay) >> 0;
	var strTime = new Date(txTime * 1000).toISOString().substr(11, 8);
	$("#txTime").text(days + "d " + strTime);
};

$(window).bind("load", function() {
	if (DEBUG_MODE) {
		setInterval(debugSpawner, 100);
	} else {
		if ($("#blockchainCheckBox").prop("checked"))
			TransactionSocket.init();
	}
	txTimeInterval = setInterval(txTimer, 1000);

	window.requestAnimationFrame(globalUpdate);
	
	Sound.loadup();
	Sound.init();
});

$(window).resize(function() {
	updateLayoutHeight();
});

window.onbeforeunload = function(e) {
	clearInterval(globalUpdate);
	clearInterval(txTimeInterval);
	TransactionSocket.close();
};

