var sys = require("sys");
var binding = require("./binding");

/**
 * Constructor for the connection object
 */
RservConnection = function () {

    this.connection = new binding.Connection;
    this.requests = [];

    var me = this;

    this.connection.addListener("connect", function () { me.connected(); });
    this.connection.addListener("close", function (e) { me.closed(e); });
    this.connection.addListener("result", function (r) { me.result(r); });

    return this;
};

RservConnection.prototype.connect = function (host, port, callback) {
    host = host || '127.0.0.1';
    port = port || 6311;
    this.connectCallback = callback;
    this.connection.connect (host, port);
}

RservConnection.prototype.connected = function () {
    this.dispatch();
    if (this.connectCallback)
        this.connectCallback(true);
}
RservConnection.prototype.closed = function (e) {
    sys.puts ("Disconnected from R: " + e);
}
RservConnection.prototype.result = function (r) {
    var request = this.requests.shift();
    if (request.callback) {
        request.callback(r);
    }
    this.dispatch();
}
RservConnection.prototype.request= function (req, callback) {
    this.requests.push ({request: req, callback: callback});
    this.dispatch();
}

RservConnection.prototype.dispatch = function () {
    if (this.requests.length > 0 && this.connection.state == "idle") {
        this.connection.query (this.requests[0].request);
    }
}

//
// Export the RservConnection object.
//
exports.RservConnection = RservConnection;
