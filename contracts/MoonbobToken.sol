// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MoonbobToken
 * @author Moonbob Money Team
 * @notice An ERC-20 token with controlled minting capabilities
 * @dev Extends OpenZeppelin's ERC20 and Ownable contracts
 */
contract MoonbobToken is ERC20, Ownable {
    /// @notice The address authorized to mint new tokens
    address public minter;

    /**
     * @notice Emitted when the minter address is updated
     * @param oldMinter The previous minter address
     * @param newMinter The new minter address
     */
    event MinterUpdated(address indexed oldMinter, address indexed newMinter);

    /**
     * @notice Thrown when caller is not the authorized minter
     */
    error NotMinter();

    /**
     * @notice Thrown when attempting to set minter to zero address
     */
    error InvalidMinterAddress();

    /**
     * @notice Initializes the Moonbob token
     * @dev Sets the token name, symbol, and initial minter
     * @param initialOwner The address that will own the contract
     * @param initialMinter The address authorized to mint tokens
     */
    constructor(
        address initialOwner,
        address initialMinter
    ) ERC20("Moonbob Token", "MOONBOB") Ownable(initialOwner) {
        if (initialMinter == address(0)) revert InvalidMinterAddress();
        minter = initialMinter;
        emit MinterUpdated(address(0), initialMinter);
    }

    /**
     * @notice Mints new tokens to a specified address
     * @dev Can only be called by the authorized minter address
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint (in wei units)
     */
    function mint(address to, uint256 amount) external {
        if (msg.sender != minter) revert NotMinter();
        _mint(to, amount);
    }

    /**
     * @notice Updates the authorized minter address
     * @dev Can only be called by the contract owner
     * @param newMinter The new address authorized to mint tokens
     */
    function setMinter(address newMinter) external onlyOwner {
        if (newMinter == address(0)) revert InvalidMinterAddress();
        address oldMinter = minter;
        minter = newMinter;
        emit MinterUpdated(oldMinter, newMinter);
    }

    /**
     * @notice Returns the number of decimals used for token amounts
     * @dev Overrides the default ERC20 decimals (18)
     * @return The number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
