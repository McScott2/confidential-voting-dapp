// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";

contract ConfidentialVoting is SepoliaZamaFHEVMConfig, GatewayCaller {
    struct Poll {
        string title;
        string description;
        string[] options;
        uint256 startTime;
        uint256 endTime;
        bool finalized;
        address creator;
        mapping(address => bool) hasVoted;
        mapping(uint256 => euint32) encryptedVotes;
        mapping(uint256 => uint32) decryptedVotes;
    }

    uint256 public pollCount;
    mapping(uint256 => Poll) public polls;
    mapping(uint256 => mapping(address => bool)) public hasRequestedDecryption;

    event PollCreated(
        uint256 indexed pollId,
        string title,
        address indexed creator,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed pollId,
        address indexed voter
    );
    
    event PollFinalized(
        uint256 indexed pollId,
        uint256[] results
    );

    event DecryptionRequested(
        uint256 indexed pollId,
        uint256 indexed optionIndex
    );

    modifier pollExists(uint256 _pollId) {
        require(_pollId < pollCount, "Poll does not exist");
        _;
    }

    modifier pollActive(uint256 _pollId) {
        Poll storage poll = polls[_pollId];
        require(block.timestamp >= poll.startTime, "Poll has not started yet");
        require(block.timestamp <= poll.endTime, "Poll has ended");
        require(!poll.finalized, "Poll is finalized");
        _;
    }

    modifier pollEnded(uint256 _pollId) {
        Poll storage poll = polls[_pollId];
        require(block.timestamp > poll.endTime, "Poll is still active");
        _;
    }

    function createPoll(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint256 _duration
    ) external returns (uint256) {
        require(_options.length >= 2, "Must have at least 2 options");
        require(_options.length <= 10, "Maximum 10 options allowed");
        require(_duration >= 1 hours, "Duration must be at least 1 hour");
        require(_duration <= 30 days, "Duration cannot exceed 30 days");

        uint256 pollId = pollCount++;
        Poll storage newPoll = polls[pollId];
        
        newPoll.title = _title;
        newPoll.description = _description;
        newPoll.options = _options;
        newPoll.startTime = block.timestamp;
        newPoll.endTime = block.timestamp + _duration;
        newPoll.creator = msg.sender;
        newPoll.finalized = false;

        for (uint256 i = 0; i < _options.length; i++) {
            newPoll.encryptedVotes[i] = TFHE.asEuint32(0);
            TFHE.allowThis(newPoll.encryptedVotes[i]);
        }

        emit PollCreated(pollId, _title, msg.sender, newPoll.startTime, newPoll.endTime);
        
        return pollId;
    }

    function vote(
        uint256 _pollId,
        bytes calldata _encryptedChoice
    ) external pollExists(_pollId) pollActive(_pollId) {
        Poll storage poll = polls[_pollId];
        require(!poll.hasVoted[msg.sender], "Already voted");

        euint32 choice = TFHE.asEuint32(_encryptedChoice);
        
        ebool validChoice = TFHE.lt(choice, TFHE.asEuint32(uint32(poll.options.length)));
        require(TFHE.decrypt(validChoice), "Invalid choice");

        for (uint256 i = 0; i < poll.options.length; i++) {
            euint32 optionIndex = TFHE.asEuint32(uint32(i));
            ebool isChoice = TFHE.eq(choice, optionIndex);
            euint32 increment = TFHE.select(isChoice, TFHE.asEuint32(1), TFHE.asEuint32(0));
            
            poll.encryptedVotes[i] = TFHE.add(poll.encryptedVotes[i], increment);
            TFHE.allowThis(poll.encryptedVotes[i]);
        }

        poll.hasVoted[msg.sender] = true;
        
        emit VoteCast(_pollId, msg.sender);
    }

    function requestDecryption(
        uint256 _pollId,
        uint256 _optionIndex
    ) external pollExists(_pollId) pollEnded(_pollId) {
        Poll storage poll = polls[_pollId];
        require(_optionIndex < poll.options.length, "Invalid option index");
        require(!hasRequestedDecryption[_pollId][msg.sender], "Already requested");

        hasRequestedDecryption[_pollId][msg.sender] = true;

        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(poll.encryptedVotes[_optionIndex]);
        
        Gateway.requestDecryption(
            cts,
            this.callbackDecryption.selector,
            0,
            block.timestamp + 100,
            false
        );

        emit DecryptionRequested(_pollId, _optionIndex);
    }

    function callbackDecryption(
        uint256 /*requestId*/,
        uint32 decryptedVote
    ) public onlyGateway {
    }

    function finalizePoll(uint256 _pollId) external pollExists(_pollId) pollEnded(_pollId) {
        Poll storage poll = polls[_pollId];
        require(!poll.finalized, "Poll already finalized");
        require(msg.sender == poll.creator, "Only creator can finalize");

        poll.finalized = true;

        uint256[] memory results = new uint256[](poll.options.length);
        
        emit PollFinalized(_pollId, results);
    }

    function getPollDetails(uint256 _pollId) 
        external 
        view 
        pollExists(_pollId) 
        returns (
            string memory title,
            string memory description,
            string[] memory options,
            uint256 startTime,
            uint256 endTime,
            bool finalized,
            address creator
        ) 
    {
        Poll storage poll = polls[_pollId];
        return (
            poll.title,
            poll.description,
            poll.options,
            poll.startTime,
            poll.endTime,
            poll.finalized,
            poll.creator
        );
    }

    function hasVoted(uint256 _pollId, address _voter) 
        external 
        view 
        pollExists(_pollId) 
        returns (bool) 
    {
        return polls[_pollId].hasVoted[_voter];
    }

    function isPollActive(uint256 _pollId) 
        external 
        view 
        pollExists(_pollId) 
        returns (bool) 
    {
        Poll storage poll = polls[_pollId];
        return block.timestamp >= poll.startTime && 
               block.timestamp <= poll.endTime && 
               !poll.finalized;
    }

    function getDecryptedResult(uint256 _pollId, uint256 _optionIndex)
        external
        view
        pollExists(_pollId)
        returns (uint32)
    {
        Poll storage poll = polls[_pollId];
        require(poll.finalized, "Poll not finalized");
        require(_optionIndex < poll.options.length, "Invalid option");
        return poll.decryptedVotes[_optionIndex];
    }
}
