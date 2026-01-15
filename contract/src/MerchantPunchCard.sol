// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @notice A merchant punch card contract for tracking customer purchases and product catalog.
contract MerchantPunchCard {
    address public owner;

    mapping(uint256 itemId => CatalogItem item) public catalog;

    struct CatalogItem {
        string name;
    }

    /**
     * Queue storing the last 10 item IDs purchased by each customer
     *
     * customer => [itemId1, itemId2, ..., itemId10]
     */
    mapping(address customer => uint256[10] lastPurchasedItems)
        public customerPurchaseHistory;

    /**
     * Errors can provide more context about why an execution failed
     * Errors can have named arguments
     */
    error NotOwner(address sender, address owner);
    error InvalidItemName(string name);

    /**
     * Events or "logs" can be emitted to enable easier offchain parsing of state changes
     * Events can have named arguments
     */
    event ProductRegistered(uint256 indexed itemId, string name);
    event PurchaseProcessed(address indexed customer, uint256[] itemIds);

    // Constructors are run only when deploying a contract
    constructor(address owner_) {
        owner = owner_;
    }

    /**
     * Function structure: name, arguments, visibility, mutability, return type
     *
     * Visibility defines who can call
     * - external: only outside of this contract
     * - public: both internal and external
     * - internal: only this contract
     * - private: internal but excludes inheriting contracts
     *
     * Mutability defines access to storage
     * - [none]: read+write access
     * - view: read-only access
     * - pure: no access
     */

    /// @notice Get the last 10 purchased item IDs for a customer.
    function getPurchaseHistory(
        address customer
    ) external view returns (uint256[10] memory) {
        return customerPurchaseHistory[customer];
    }

    /// @notice Get catalog items by their IDs.
    function getCatalogItems(
        uint256[] calldata itemIds
    ) external view returns (CatalogItem[] memory) {
        CatalogItem[] memory items = new CatalogItem[](itemIds.length);

        for (uint256 i = 0; i < itemIds.length; i++) {
            items[i] = catalog[itemIds[i]];
        }

        return items;
    }

    /// @notice Process a purchase of a list of items.
    function processPurchase(uint256[] calldata itemIds) external {
        // Update customer's purchase history
        for (uint256 i = 0; i < itemIds.length; i++) {
            uint256 itemId = itemIds[i];

            // Shift existing items to the right (remove last, add new to front)
            for (uint256 j = 9; j > 0; j--) {
                customerPurchaseHistory[msg.sender][
                    j
                ] = customerPurchaseHistory[msg.sender][j - 1];
            }

            // Add new item to the front
            customerPurchaseHistory[msg.sender][0] = itemId;
        }

        emit PurchaseProcessed(msg.sender, itemIds);
    }

    /// @notice Register a new product to the catalog.
    /// @dev Only the owner can register products.
    function registerProduct(uint256 itemId, string memory name) external {
        // Check sender is owner
        if (msg.sender != owner) revert NotOwner(msg.sender, owner);

        // Check item name is not empty
        if (bytes(name).length == 0) revert InvalidItemName(name);

        // Add product to catalog
        catalog[itemId] = CatalogItem({name: name});

        emit ProductRegistered(itemId, name);
    }
}
