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
    mapping (address => Room) rooms;
    // TODO: Use mapping for better use
    struct Proposal {
        address proposer;
        address proposalTo;
        string orbit_db_identity;
        bool accepted;
    }
    mapping (address => Proposal) proposals;

    // Declare events. Will be used in js https://stackoverflow.com/questions/69541323/continuously-listening-to-smart-contract-events
    event RoomCreated(address owner, string url);
    event ProposalCreated(address owner, address proposer, string identity);
    event ProposalAccepted(address proposer);

    function createRoom(string memory url) 
    public 
    {
        // We cannot use "rooms[address] = Room(0x00000...0, "...")"
        // because the right hand side creates a memory-struct "Room" that contains a mapping
        Room storage r      = rooms[msg.sender];
        r.owner             = msg.sender;
        r.orbit_db_url      = url;
        emit RoomCreated(msg.sender, url);
    }

    function createProposal(address proposalTo, string memory identity)
        public
    {
        Proposal storage p  = proposals[msg.sender];
        p.proposer          = msg.sender;
        p.proposalTo        = proposalTo;
        p.orbit_db_identity = identity;
        emit ProposalCreated(proposalTo, msg.sender, identity);
    }

    function acceptProposal(address proposer) 
    public 
    {
        // First get the origin room
        Room memory r = rooms[msg.sender];
        // Check if the room exists. If not, the struct is generated with default values.
        // Default value of address
        require(r.owner != 0x0000000000000000000000000000000000000000, "You don't have any room.");
        
        Proposal memory p = proposals[proposer];
        // Proposal checks
        require(p.proposer !=  0x0000000000000000000000000000000000000000 && p.proposalTo != 0x0000000000000000000000000000000000000000, "The proposal doesn't exists.");
        require(p.proposalTo == msg.sender, "You are not the origin");
        require(p.proposer == proposer, "(+_+)");
        require(!(p.accepted), "The proposal is already accepted");
        // Warn the proposer that he is accepted
        emit ProposalAccepted(proposer);
    }

}
