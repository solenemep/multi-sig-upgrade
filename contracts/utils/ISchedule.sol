//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface ISchedule {
    event ScheduledCall(address indexed sender, address indexed contractAddress, bytes taskId);
    event CanceledCall(address indexed sender, bytes taskId);
    event RescheduledCall(address indexed sender, bytes taskId);

    // Schedule call the contract.
    // Returns a boolean value indicating whether the operation succeeded.
    function scheduleCall(
        address contractAddress, // The contract address to be called in future.
        uint256 value, // How much native token to send alone with the call.
        uint256 gasLimit, // The gas limit for the call. Corresponding fee will be reserved upfront and refunded after call.
        uint256 storageLimit, // The storage limit for the call. Corresponding fee will be reserved upfront and refunded after call.
        uint256 minDelay, // Minimum number of blocks before the scheduled call will be called.
        bytes calldata inputData // The input data to the call.
    ) external returns (bool); // Returns a boolean value indicating whether the operation succeeded.

    // Cancel schedule call the contract.
    // Returns a boolean value indicating whether the operation succeeded.
    function cancelCall(
        bytes calldata taskId // The task id of the scheduler. Get it from the `ScheduledCall` event.
    ) external returns (bool); // Returns a boolean value indicating whether the operation succeeded.

    // Reschedule call the contract.
    // Returns a boolean value indicating whether the operation succeeded.
    function rescheduleCall(
        uint256 minDelay, // Minimum number of blocks before the scheduled call will be called.
        bytes calldata taskId // The task id of the scheduler. Get it from the `ScheduledCall` event.
    ) external returns (bool); // Returns a boolean value indicating whether the operation succeeded.
}
