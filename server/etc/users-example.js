/**
 * User configuration - basically a map of users to passwords
 * Passwords are SHA256 protected, with the given salt at the 
 * front of the name -
 * i.e. the SHA256 value is from the string:
 *
 *  salt + username + password
 *
 * The tools/rnpasswd program will allow you to alter this file.
 */
users = {
    name: 'demo',
    salt: 'a1',
    password: ''
}
