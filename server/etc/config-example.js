//
// R-Node configuration file.
// Basically this defines the server side configuration for R-Node
// It's pure JSON, except that it allows single line comments
//
{
    "listen": {
        //
        // Whether clients need to log in or not.
        //
        "requireClientLogin": false,

        //
        // The port to listen on.
        //
        "port": 2903,

        //
        // The interface to listen on, or null to listen on all.
        // Set to 'localhost' for more security.
        //
        "interface": null
    },

    "R": {
        //
        // The base directory of R - default in Ubuntu is /usr/lib/R
        //
        "root": "/usr/lib/R",

        //
        // The base directory from where to find R temporary files
        //
        "temporaryDirectory": "/",

        //
        // Username and password to connect to RServe with.
        // Only used if RServe requires a username/password
        //
        "username": "test",
        "password": "test"
    }
}

