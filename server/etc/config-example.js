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
        // "usersFile": "etc/users-example.js",
        // "sessionTimeout": 30 // minutes
    },

    "features": {
        // Features include things like file upload, image creation etc.
        "fileUpload": {
            "enable": true, // or false!

            "maxFileSize": "100kb", // Can be a number and size like 1000k, or 1mb.
                                    // without a number, it assumes megabyte.

            "directory": "/tmp", // A directory accessible to both R-Node and R.

            "Rdirectory": "/tmp" // The "directory" option above, but from R's perspective
                                 // (this is to support jailing).
        }

        , "help": {
            // For R 2.10 or greater, the port that a R help server is running
            // on.
            "serverPort": 22900
        }

    },

    "R": {
        //
        // The base directory of R - default in Ubuntu is /usr/lib/R
        //
        "root": "/usr/lib/R",

        //
        // The base directory from where to find R temporary files
        // This is where we can find R's temporary files. E.g. if
        // R generates a file, '/tmp/rtmpvnvdshf43.txt', we'll find
        // it at: temporaryDirectory + '/tmp/rtmpvnvdshf43.txt'
        //
        "temporaryDirectory": "/",

        // A temporary directory, accessible to R.
        "tempDirectoryFromRperspective": "/tmp", // What R thinks the temp directory is.
        "tempDirectoryFromOurPerspective": "/tmp", // What We know it is. Separate, to allow for jailing of R server instances.

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
        "idleSessionTimeout": 30,

        //
        // To have R-Node run and manage the R server, set this
        // option to true
        //
        "manageRserver": false
    },

    "sessionManagement": {
        // R command files to run after a connection to R is made. There
        // are two types of such R command files:
        //  1. Global files, run all the time.
        //  2. User specific files, run for a specific user.
        //
        // First the directory to find global files:
        // Files in the given directory are read in alphanumeric sorted order, 
        // so it might be useful to name them 001..., 002... etc.
        "postConnectionScripts": "etc/global-scripts/",

        // Now, where to find per-user R files. Files is this directory
        // should include the username in their name, in the format:
        //     *_<name>_*
        //
        // That is, the user's name surrounded by underscores as part of
        // the filename.  
        //
        // The user's files (there can be more than one), are executed one after the other.
        //
        // E.g. if a user's name is jlove, then files may be:
        //   001_jlove_rscript.R
        //   002_jlove_rscript.R
        //
        // etc.
        "perUserPostConnectionScripts": "etc/user-scripts/"
    }
}

