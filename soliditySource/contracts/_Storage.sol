// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract Storage {
    uint256 number;
    string salt;
    string password; // Stored with bcrypt

    /**
     * @dev Store the salt for bcrypt
     * @param _salt value to store
     */
    function storeSalt(string memory _salt) public {
        salt = _salt;
    }

    /**
     * @dev Store the password for bcrypt
     * @param _password value to store
     */
    function storePassword(string memory _password) public {
        password = _password;
    }

    /**
     * @dev Return value
     * @return value of salt
     */
    function retrieveSalt() public view returns (string memory) {
        return salt;
    }
}
