// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title FileShareControl
 * @dev Publicy and allow users into your db
 */
contract FileShareControl {
    // TODO: Allow user to regenerate the url
    struct Room {
        address owner;
        string Orbit_db_url;
    }

    struct Proposal {
        address propouser;
        address proposingTo;
        string orbit_db_identity;
        bool accepted;
    }

    // Declare events. Will be used in js https://stackoverflow.com/questions/69541323/continuously-listening-to-smart-contract-events
    event RoomCreated(address owner, string url);
    event ProposalCreated(address owner, address propouser);
    event ProposalAccepted(address propouser);
    // A dynamically-sized array of `Room` structs.
    Room[] public rooms;
    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;

    function createRoom(string memory url) 
    public 
    {
        // Create a room and push it to the array
        rooms.push(Room(msg.sender, url));
        emit RoomCreated(msg.sender, url);
    }

    function createProposal(address proposingTo, string memory identity)
        public
    {
        proposals.push(Proposal(msg.sender, proposingTo, identity, false));
        emit ProposalCreated(proposingTo, msg.sender);
    }

    function acceptProposal(address propouser) 
    public 
    {
        // First get the origin room
        uint i = 0;
        Room memory r;
        for (; i < rooms.length; i++) {
            if(rooms[i].owner == msg.sender) {
                r = rooms[i];
            }
        }
        uint j = 0;
        bool foundPeer = false;
        for (; j < proposals.length; j++) {
            if (proposals[j].propouser == propouser && !(proposals[j].accepted) && proposals[j].proposingTo == msg.sender) {
                foundPeer = true;
                // Accept it
                proposals[j].accepted = true;
            }
        }
        require(foundPeer, "Couldn't find your peer");
        // Warn the proposer that he is accepted
        emit ProposalAccepted(propouser);
    }

    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

}
