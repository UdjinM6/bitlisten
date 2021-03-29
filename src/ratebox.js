var currentExchange;
var globalRate = -1; // set upon first rate received
var USD_BTC = -1; // set upon first rate received
var BTC_DASH = -1; // set upon first rate received
var USD_DASH = -1; // set upon first rate received

function updateRate() {
    if (globalRate === -1) {
        var checkbox = $("#showDollarCheckBox");
        checkbox.prop("disabled", false);
        checkbox.parent().removeClass("disabled");
    }
    if (currentExchange === "btcusd" && USD_BTC != -1) {
        $("#rate").html(USD_BTC);
    } else if (currentExchange === "dashbtc" && BTC_DASH != -1) {
        $("#rate").html(BTC_DASH);
    } else if (currentExchange === "dashusd" && USD_DASH != -1) {
        $("#rate").html(USD_DASH);
    } else {
        $("#rate").html("---");
    }
    if (USD_DASH != -1) {
        globalRate = USD_DASH;
    } else if (USD_BTC != -1 && BTC_DASH != -1) {
        globalRate = (USD_BTC * BTC_DASH).toFixed(2);
    }
}

$(document).ready(function() {
    // setupBitstampWebSocket();
    // setupPoloniexWebSocket();

    // $.getJSON("https://blockchain.info/ticker?cors=true", function(data) {
    //     USD_BTC = parseFloat(data.USD.last).toFixed(2);
    //     updateRate();
    // });
    // $.getJSON("https://poloniex.com/public?command=returnTicker", function(data) {
    //     BTC_DASH = parseFloat(data.BTC_DASH.last).toFixed(6);
    //     updateRate();
    // });

    setupCoinbaseProWebSocket();

    $.getJSON("https://api.pro.coinbase.com/products/BTC-USD/ticker", function(data) {
        USD_BTC = parseFloat(data.price).toFixed(2);
        updateRate();
    });
    $.getJSON("https://api.pro.coinbase.com/products/DASH-USD/ticker", function(data) {
        USD_DASH = parseFloat(data.price).toFixed(2);
        updateRate();
    });
    $.getJSON("https://api.pro.coinbase.com/products/DASH-BTC/ticker", function(data) {
        BTC_DASH = parseFloat(data.price).toFixed(6);
        updateRate();
    });
});

function setupBitstampWebSocket() {
    // Bitstamp WebSocket API
    var wsuri = "wss://ws.bitstamp.net";
    var socket = new WebSocket(wsuri);

    socket.onopen = function () {
        console.log("Bitstamp WebSocket: Connection open!");
        socket.send('{"event": "bts:subscribe", "data": {"channel": "live_trades_btcusd"}}');
    };

    socket.onclose = function (event) {
        console.log("Bitstamp WebSocket: Connection closed");
        setTimeout(setupBitstampWebSocket, 1000);
    };

    socket.onmessage = function(event) {
        response = JSON.parse(event.data);
        if (response.event === "trade") {
            USD_BTC = parseFloat(response.data.price).toFixed(2);
            updateRate();
        }
    };
}

function setupPoloniexWebSocket() {
    // Poloniex WebSocket API
    var wsuri = "wss://api2.poloniex.com";
    var socket = new WebSocket(wsuri);

    socket.onopen = function () {
        console.log("Poloniex WebSocket: Connection open!");
        socket.send('{"command" : "subscribe", "channel" : 1002}'); // 1002 == tickers
    };

    socket.onclose = function (event) {
        console.log("Poloniex WebSocket: Connection closed");
        setTimeout(setupPoloniexWebSocket, 1000);
    };

    socket.onmessage = function(event) {
        response = JSON.parse(event.data);
        if (response[2] && response[2][0] === 24) { // 24 == BTC_DASH
            BTC_DASH = parseFloat(response[2][1]).toFixed(6);
            updateRate();
        }
    };
}

function setupCoinbaseProWebSocket() {
    // CoinbasePro WebSocket API
    var wsuri = "wss://ws-feed.pro.coinbase.com";
    var socket = new WebSocket(wsuri);

    socket.onopen = function () {
        console.log("CoinbasePro WebSocket: Connection open!");
        socket.send('{"type" : "subscribe", "channels": [{"name": "ticker","product_ids": ["DASH-USD","DASH-BTC","BTC-USD"]}]}');
    };

    socket.onclose = function (event) {
        console.log("CoinbasePro WebSocket: Connection closed");
        setTimeout(setupCoinbaseProWebSocket, 1000);
    };

    socket.onmessage = function(event) {
        response = JSON.parse(event.data);
        if (response.product_id == "DASH-BTC" && response.price) {
            BTC_DASH = parseFloat(response.price).toFixed(6);
            updateRate();
        }
        if (response.product_id == "DASH-USD" && response.price) {
            USD_DASH = parseFloat(response.price).toFixed(2);
            updateRate();
        }
        if (response.product_id == "BTC-USD" && response.price) {
            USD_BTC = parseFloat(response.price).toFixed(2);
            updateRate();
        }
    };
}

switchExchange = function(exchangeName) {
    currentExchange = exchangeName;

    if (exchangeName === "dashusd") {
        $("#dashusdRate").css("color", "#008de4");
        $("#dashbtcRate").css("color", "gray");
        $("#btcusdRate").css("color", "gray");
    }
    if (exchangeName === "dashbtc") {
        $("#dashusdRate").css("color", "gray");
        $("#dashbtcRate").css("color", "#008de4");
        $("#btcusdRate").css("color", "gray");
    }
    if (exchangeName === "btcusd") {
        $("#dashusdRate").css("color", "gray");
        $("#dashbtcRate").css("color", "gray");
        $("#btcusdRate").css("color", "orange");
    }
    updateRate();
};
