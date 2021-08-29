//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "./StorageV1.sol";

contract StorageV2 is StorageV1 {
    string private _data2;

    event Data2Set(address indexed account, string data2);

    function setData2(string memory data2_) public {
        _data2 = data2_;
        emit Data2Set(msg.sender, data2_);
    }

    function getData2() public view returns (string memory) {
        return _data2;
    }

    function version() public pure virtual override returns (string memory) {
        return "v2.0";
    }
}
