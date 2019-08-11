var rateboxTimeout;
var currentExchange;
var ratebox_ms = 3000; // 3 second update interval

$(document).ready(function() {
    // Bitstamp websocket API
    var pusher = new Pusher('de504dc5763aeef9ff52');
    var channel = pusher.subscribe('live_trades');
    channel.bind('trade', function(ticker) {
        if (currentExchange === "bitstamp")
            $("#rate").html(parseFloat(ticker.price).toFixed(2));
        if (rateboxTimeout) clearTimeout(rateboxTimeout);
    });

    // Poloniex Push API
    var wsuri = "wss://api2.poloniex.com";
    var socket = new WebSocket(wsuri);

    socket.onopen = function () {
        console.log("Poloniex WebSocket: Connection open!");
        socket.send('{"command" : "subscribe", "channel" : 1002}'); // 1002 == tickers
    };

    socket.onclose = function (event) {
        console.log("Poloniex WebSocket: Connection closed");
    };

    socket.onmessage = function(event) {
        // console.log("data " + event.data);
        data = JSON.parse(event.data);
        // console.log('ticker: ' + data[2][0]);
        if (data[2] && data[2][0] === 24 && currentExchange === "poloniex") { // 24 == BTC_DASH
            // console.log('ticker: ' + data[2]);
            $("#rate").html(parseFloat(data[2][1]).toFixed(6));
        }
    };
});

switchExchange = function(exchangeName) {
    clearTimeout(rateboxTimeout);
    currentExchange = exchangeName;
    $("#rate").html("---");

    if (exchangeName === "poloniex") {
        $("#poloniexRate").css("color", "white");
        $("#bitstampRate").css("color", "gray");
        $("#units").html("BTC / DASH");
        $.getJSON("https://poloniex.com/public?command=returnTicker", function(data) {
            $("#rate").html(parseFloat(data.BTC_DASH.last).toFixed(6));
        });
    } else if (exchangeName === "bitstamp") {
        $("#bitstampRate").css("color", "white");
        $("#poloniexRate").css("color", "gray");
        $("#units").html("USD / BTC");
        $.getJSON("https://blockchain.info/ticker?cors=true", function(data) {
            $("#rate").html(parseFloat(data.USD.last).toFixed(2));
        });
    }
};
