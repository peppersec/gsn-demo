pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol";

contract Counter is GSNRecipient {
  uint256 public value;

  function increase() public {
    value += 1;
  }

  event Withdraw(address who);
  event PostRelayCall(uint actualCharge, bytes context, address recipient);
  event CallData(bytes encodedFunction);

  function withdrawViaRelayer(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[3] memory input) public {
    emit Withdraw(address(input[2]));
  }

  function acceptRelayedCall(
    address relay,
    address from,
    bytes memory encodedFunction,
    uint256 transactionFee,
    uint256 gasPrice,
    uint256 gasLimit,
    uint256 nonce,
    bytes memory approvalData,
    uint256 maxPossibleCharge
  ) public view returns (uint256, bytes memory) {
    // if (!compareBytesWithSelector(encodedFunction, this.withdrawViaRelayer.selector)) {
    //   return (2, "Only withdrawViaRelayer can be called");
    // }
    bytes memory recipient;
    assembly {
      let dataPointer := add(encodedFunction, 32)
      let recipientPointer := mload(add(dataPointer, 324)) // 4 + (8 * 32) + (32) + (32) == selector + proof + root + nullifier
      mstore(recipient, 32) // save array length
      mstore(add(recipient, 32), recipientPointer) // save recipient address
    }
    return (0, recipient);
  }

  // this func is called by RelayerHub right before calling a target func
  function preRelayedCall(bytes calldata /*context*/) external returns (bytes32) {}


  // this func is called by RelayerHub right after calling a target func
  function postRelayedCall(bytes memory context, bool /*success*/, uint actualCharge, bytes32 /*preRetVal*/) public {
    // IRelayHub relayHub = IRelayHub(getHubAddr());
    address payable recipient;
    assembly {
      recipient := mload(add(context, 32))
    }
    emit PostRelayCall(actualCharge, context, recipient);

    // recipient.transfer(mixDenomination - actualCharge);
    // relayHub.depositFor.value(actualCharge)(address(this));
    // or we can send actualCharge somewhere else...
  }

  function compareBytesWithSelector(bytes memory data, bytes4 sel) internal pure returns (bool) {
    return data[0] == sel[0]
        && data[1] == sel[1]
        && data[2] == sel[2]
        && data[3] == sel[3];
  }
}