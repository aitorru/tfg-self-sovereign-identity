// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title FileShareControl
 * @dev Publish and allow users into your db
 */
contract FileShareControl {
    // TODO: Allow user to regenerate the url
    // TODO: Use mapping for better use https://ethereum.stackexchange.com/questions/2385/can-i-save-structs-in-a-mapping
    struct Room {
        address owner;
        string orbit_db_url;
    }

    // TODO: Use mapping for better use
    struct Proposal {
        address proposer;
        address proposalTo;
        string orbit_db_identity;
        bool accepted;
    }

    // Declare events. Will be used in js https://stackoverflow.com/questions/69541323/continuously-listening-to-smart-contract-events
    event RoomCreated(address owner, string url);
    event ProposalCreated(address owner, address proposer);
    event ProposalAccepted(address proposer);
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

    function createProposal(address proposalTo, string memory identity)
        public
    {
        proposals.push(Proposal(msg.sender, proposalTo, identity, false));
        emit ProposalCreated(proposalTo, msg.sender);
    }

    function acceptProposal(address proposer) 
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
            if (proposals[j].proposer == proposer && !(proposals[j].accepted) && proposals[j].proposalTo == msg.sender) {
                foundPeer = true;
                // Accept it
                proposals[j].accepted = true;
            }
        }
        require(foundPeer, "Couldn't find your peer");
        // Warn the proposer that he is accepted
        emit ProposalAccepted(proposer);
    }

}
