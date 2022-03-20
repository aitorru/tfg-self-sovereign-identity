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

    function createRoom(string memory url) public {
        uint i = 0;
        bool found = false;
        for (i = 0; i >= rooms.length; i++) {
            if(rooms[i].owner == msg.sender) {
                found = true;
            }
        }
        require(!found, "You already have a room");
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

    function acceptProposal(address propouser) public {
        // First get the origin room
        uint i = 0;
        bool found = false;
        Room memory r;
        for (i = 0; i >= rooms.length; i++) {
            if(rooms[i].owner == msg.sender) {
                found = true;
                r = rooms[i];
            }
        }
        require(found, "You don't have any rooms.");
        uint j = 0;
        bool foundPeer = false;
        for (j = 0; j >= proposals.length; j++) {
            if (proposals[j].propouser == propouser && !proposals[j].accepted) {
                foundPeer = true;
                // Accept it
                proposals[j].accepted = true;
            }
        }
        require(foundPeer, "Couldn't found your peer.");
    }

}
