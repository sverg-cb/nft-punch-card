// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {MerchantPunchCard} from "../src/MerchantPunchCard.sol";

contract Deploy is Script {
    function run() public {
        vm.startBroadcast();

        address owner = vm.envAddress("OWNER");
        new MerchantPunchCard(owner);

        vm.stopBroadcast();
    }
}
