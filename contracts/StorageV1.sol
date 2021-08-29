//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract StorageV1 is OwnableUpgradeable, UUPSUpgradeable {
    string private _data1;

    event Data1Set(address indexed account, string data1);

    function initialize() public initializer {
        __Ownable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function setData1(string memory data1_) public {
        _data1 = data1_;
        emit Data1Set(msg.sender, data1_);
    }

    function getData1() public view returns (string memory) {
        return _data1;
    }

    function version() public pure virtual returns (string memory) {
        return "v1.0";
    }
}
