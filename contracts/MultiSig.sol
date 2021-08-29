//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

import "./utils/ISchedule.sol";
import "./utils/Address.sol";

// MULTI-SIG ADMIN CONTRACT
contract MultiSig is AccessControlEnumerable, ADDRESS {
    using Counters for Counters.Counter;
    bytes32 public constant ADMIN = keccak256("ADMIN");
    uint256 private _threshold;
    ISchedule public scheduler = ISchedule(ADDRESS.SCHEDULE);

    enum Vote {
        Yes,
        No
    }

    enum Status {
        Running,
        Approved,
        Rejected
    }

    struct Proposal {
        Status status;
        address upgrade;
        uint256 period;
        uint256 nbYes;
        uint256 nbNo;
        uint256 createdAt;
    }

    Counters.Counter private _id;
    mapping(uint256 => Proposal) private _proposal;
    mapping(address => mapping(uint256 => bool)) private _hasVoted;

    event Proposed(address indexed sender, uint256 id);
    event Approved(uint256 id);
    event Rejected(uint256 id);

    constructor(
        address admin1,
        address admin2,
        address admin3,
        uint256 threshold_
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN, admin1);
        _setupRole(ADMIN, admin2);
        _setupRole(ADMIN, admin3);
        _threshold = threshold_;
    }

    function propose(address upgrade, uint256 period) public onlyRole(ADMIN) returns (uint256) {
        _id.increment();
        uint256 id = _id.current();
        _proposal[id] = Proposal(Status.Running, upgrade, period, 0, 0, block.timestamp);
        emit Proposed(msg.sender, id);
        return id;
    }

    function vote(uint256 id, Vote vote_) public onlyRole(ADMIN) {
        require(_hasVoted[msg.sender][id] == false, "MultiSig: already voted");
        require(_proposal[id].status == Status.Running, "MultiSig: not a running proposal");
        uint256 totalVoters = getRoleMemberCount(ADMIN);

        // if time is over, we check decision
        if (block.timestamp > _proposal[id].createdAt + _threshold) {
            if (_proposal[id].nbYes > _proposal[id].nbNo) {
                _proposal[id].status = Status.Approved;
                /*scheduler.scheduleCall(
                    address(this),
                    0,
                    100000,
                    100,
                    _proposal[id].period,
                    abi.encodeWithSignature(
                        "upgrade(address,uin256)",
                        _proposal[id].upgrade
                        _proposal[id].period
                    )
                );*/
                emit Approved(id);
            } else if (_proposal[id].nbYes <= _proposal[id].nbNo) {
                _proposal[id].status = Status.Rejected;
                emit Rejected(id);
            }
        }
        // if time is not over we count the vote
        else {
            if (vote_ == Vote.Yes) {
                _proposal[id].nbYes += 1;
            } else if (vote_ == Vote.No) {
                _proposal[id].nbNo += 1;
            }
            _hasVoted[msg.sender][id] = true;

            // if count of vote leads to a decision
            if (_proposal[id].nbYes + _proposal[id].nbNo == totalVoters) {
                if (_proposal[id].nbYes > _proposal[id].nbNo) {
                    _proposal[id].status = Status.Approved;
                    /*scheduler.scheduleCall(
                    address(this),
                    0,
                    100000,
                    100,
                    _proposal[id].period,
                    abi.encodeWithSignature(
                        "upgrade(address,uin256)",
                        _proposal[id].upgrade
                        _proposal[id].period
                    )
                );*/
                    emit Approved(id);
                } else if (_proposal[id].nbYes <= _proposal[id].nbNo) {
                    _proposal[id].status = Status.Rejected;
                    emit Rejected(id);
                }
            }
        }
    }

    function proposalById(uint256 id) public view returns (Proposal memory) {
        return _proposal[id];
    }

    function hasVoted(address account, uint256 id) public view returns (bool) {
        return _hasVoted[account][id];
    }

    function threshold() public view returns (uint256) {
        return _threshold;
    }
}
