var satoshi = 100000000;
var DELAY_CAP = 20000;
var lastBlockHeight = 0;

var provider_name = "insight.dash.org";

var transactionSocketDelay = 1000;

/** @constructor */
function TransactionSocket() {

}

function newTx(bitcoins, isDonation, currency, currencyName) {
	new Transaction(bitcoins, isDonation, currency, currencyName);
}

TransactionSocket.init = function() {
	// Terminate previous connection, if any
	if (TransactionSocket.connection)
		TransactionSocket.connection.close();

	{
		var connection = io('https://' + provider_name, {'transports': ['websocket', 'polling']});
		TransactionSocket.connection = connection;

		StatusBox.reconnecting("blockchain");

		connection.on('connect', function () {
			console.log(provider_name + ': Connection open!');
			StatusBox.connected("blockchain");
			connection.emit('subscribe', 'inv');
		});

		connection.on('disconnect', function() {
			console.log(provider_name + ': Connection closed');
			if ($("#blockchainCheckBox").prop("checked"))
				StatusBox.reconnecting("blockchain");
			else
				StatusBox.closed("blockchain");
		});

		connection.on('error', function(error) {
			console.log(provider_name + ': Connection Error: ' + error);
		});

		connection.on("tx", function(data) {
			var vout = data.vout;
			for (var i = 0; i < vout.length; i++) {
				if (Object.keys(vout[i]) == DONATION_ADDRESS) {
					setTimeout(newTx(vout[i][Object.keys(vout[i])] / satoshi, true, '', ''), Math.random() * DELAY_CAP);
				}
			}
			// console.log("https://" + provider_name + "/insight/tx/" + data.txid + " " + data.valueOut);
			setTimeout(newTx(data.valueOut, false, '', ''), Math.random() * DELAY_CAP);
		});

		connection.on("block", function(blockHash){
			$.getJSON('https://' + provider_name + '/insight-api/block/' + blockHash, function(blockData) {
				var blockHeight = blockData.height;
				var transactions = blockData.tx.length;
				// no such info in insight-api :(
				// var volumeSent = blockData.total_out;
				// let's show difficulty instead
				var difficulty = blockData.difficulty;
				var blockSize = blockData.size;
				// Filter out the orphaned blocks.
				if (blockHeight > lastBlockHeight) {
					lastBlockHeight = blockHeight;
					new Block(blockHeight, transactions, /*volumeSent*/difficulty, blockSize);
				}
			});
		});
	}
};

TransactionSocket.close = function() {
	if (TransactionSocket.connection)
		TransactionSocket.connection.close();
	StatusBox.closed("blockchain");
};
