// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Attendance} from "../src/Attendance.sol";

/**
 * forge script Deploy --rpc-url "https://sepolia.base.org" --account dev --sender $SENDER  --broadcast -vvvv --verify --verifier-url "https://api-sepolia.basescan.org/api" --etherscan-api-key $BASESCAN_API_KEY
 */
contract Deploy is Script {
    function run() public {
        vm.startBroadcast();

        address owner = 0x1Fc6116aF900A6F27A9330ab5D31639eef92f56D; // my wallet
        new Attendance(owner);

        vm.stopBroadcast();
    }
}
