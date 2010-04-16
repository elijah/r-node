//
// R-Node configuration file.
// Basically this defines the server side configuration for R-Node
// It's pure JSON, except that it allows single line comments
//
{
    "listen": {
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

    //
    // Authentication module and configuration for the authentication
    //

    "authentication": {
        // Authenticators can be found in the 'authenticators' directory.
        // "none", or "basic-user"
        "type": "none"

        // Rest of authenticator configuration listed here.
        //
        // For "none"  no configuration is necessary.
        // For "basic-user":
        //
        // usersFile: "etc/users-example.js"
        // sessionTimeout: 30 // minutes
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
        "password": "test",

        //
        // R sessions management.
        // Valid values are "single", "perUser"
        //
        "sessionManagement": "single",
            
        //
        // If you have a per-user type of session management,
        // set the length of time to wait before closing an idle
        // session.
        //
        // This is in minutes.
        //
        // It's a good idea to set this longer or equal to than 
        // the authentication session timeout.
        //
        "idleSessionTimeout": 30

    }
}

