/**
 * User configuration - basically a map of users to passwords
 * Passwords are SHA256 protected, with the given salt at the 
 * front of the name -
 * i.e. the SHA256 value is from the string:
 *
 *  salt + username + password 
 *
 *  (The password is not stored in this file obviously)
 *
 * The tools/rnpasswd program will allow you to and and manage
 * users in this file.
 */
users = {
    'username': {
        salt: 'somerandomedigits',
        password: 'SHA256STRING'
    },
    'nextusername': {
        salt: 'somerandomedigits',
        password: 'SHA256STRING'
    },
}
