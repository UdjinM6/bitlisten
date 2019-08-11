var satoshi = 100000000;
var DELAY_CAP = 20000;
var lastBlockHeight = 0;

var provider_name = "insight.dashevo.org";

var transactionSocketDelay = 1000;

/** @constructor */
function TransactionSocket() {

}

TransactionSocket.init = function() {
    // Terminate previous connection, if any
    if (TransactionSocket.connection)
        TransactionSocket.connection.close();

    var connection = io.connect('https://' + provider_name);
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


    function newTx(bitcoins, isDonation, currency, currencyName) {
        new Transaction(bitcoins, isDonation, currency, currencyName);
    }

    connection.on("tx", function(data) {
        // console.log(provider_name + ': ' + ' data: ' + JSON.stringify(data) + ' vout length: ' + data.vout.length);

        var vout = data.vout;
        for (var i = 0; i < vout.length; i++) {
            // console.log(provider_name + ': tx data: ' + Object.keys(vout[i]) + ' ' + vout[i][Object.keys(vout[i])]);
            // console.log(provider_name + ': tx data: ' + transacted);
            if (Object.keys(vout[i]) == DONATION_ADDRESS) {
                setTimeout(newTx(vout[i][Object.keys(vout[i])] / satoshi, true, '', ''), Math.random() * DELAY_CAP);
            }
        }
        setTimeout(newTx(data.valueOut, false, '', ''), Math.random() * DELAY_CAP);
    });

    connection.on("block", function(blockHash){
        // console.log(provider_name + ': blockHash: ' + blockHash);
        $.getJSON('https://' + provider_name + '/insight-api/block/' + blockHash, function(blockData) {
            // console.log(provider_name + ': blockData: ' + JSON.stringify(blockData));
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
                console.log("New Block");
                new Block(blockHeight, transactions, /*volumeSent*/difficulty, blockSize);
            }
        });
    });
};

TransactionSocket.close = function() {
    if (TransactionSocket.connection)
        TransactionSocket.connection.close();
    StatusBox.closed("blockchain");
};
