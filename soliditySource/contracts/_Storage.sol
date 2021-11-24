// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract Storage {
    string salt;
    string password; // Stored with bcrypt
    event SaltnPepper(string password, string salt);

    /**
     * @dev Store the salt for bcrypt
     * @param _salt value to store
     */
    function storeSalt(string memory _salt) private {
        salt = _salt;
    }

    /**
     * @dev Store the password for bcrypt
     * @param _password value to store
     */
    function storePassword(string memory _password) private {
        password = _password;
    }

    /**
     * @dev Return value
     * @return value of salt
     */
    function retrieveSalt() private view returns (string memory) {
        return salt;
    }

    function retrivePassword() private view returns (string memory) {
        return password;
    }

    /**
     * @dev Return all data via a event
     */
    function retriveAll() public {
        emit SaltnPepper(retrivePassword(), retrieveSalt());
    }

    /**
     * @param _password The encrypted password
     * @param _salt The salt used
     */
    function emitAll(string memory _password, string memory _salt) public {
        storePassword(_password);
        storeSalt(_salt);
    }
}
