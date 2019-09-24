pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol";

contract Counter is GSNRecipient {
  uint256 public value;

  function increase() public {
    value += 1;
  }

  event Withdraw(address who);
  event PostRelayCall(uint actualCharge, bytes context, address recipient);

  function withdrawViaRelayer(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[3] memory input) public {
    emit Withdraw(address(input[2]));
  }

  function acceptRelayedCall(
    address relay,
    address from,
    bytes calldata encodedFunction,
    uint256 transactionFee,
    uint256 gasPrice,
    uint256 gasLimit,
    uint256 nonce,
    bytes calldata approvalData,
    uint256 maxPossibleCharge
  ) external view returns (uint256, bytes memory) {
    return _approveRelayedCall();
  }

  // this func is called by RelayerHub right before calling a target func
  function preRelayedCall(bytes calldata /*context*/) external returns (bytes32) {}


  // this func is called by RelayerHub right after calling a target func
  function postRelayedCall(bytes memory context, bool /*success*/, uint actualCharge, bytes32 /*preRetVal*/) public {
    // IRelayHub relayHub = IRelayHub(getHubAddr());
    address payable recipient;
    assembly {
      recipient := sload(add(context, 324)) // 4 + (8 * 32) + (32) + (32) == selector + proof + root + nullifier
    }
    emit PostRelayCall(actualCharge, context, recipient);

    // recipient.transfer(mixDenomination - actualCharge);
    // relayHub.depositFor.value(actualCharge)(address(this));
    // or we can send actualCharge somewhere else...
  }
}