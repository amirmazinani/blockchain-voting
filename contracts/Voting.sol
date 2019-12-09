pragma solidity ^0.5.11;

contract Voting {

  struct voter {
    address voterAddress; // The address of the voter
    uint tokensBought;  // The total no. of tokens this voter owns
    uint[] tokensUsedPerCandidate; // Array to keep track of votes per candidate.
  }
  mapping (address => voter) public voterInfo;
  mapping (bytes32 => uint) public votesReceived;
  bytes32[] public candidateList;
  uint public totalTokens; // Total no. of tokens available for this election
  uint public balanceTokens; // Total no. of tokens still available for purchase
  uint public tokenPrice; // Price per token

  constructor(uint tokens, uint pricePerToken, bytes32[] memory candidateNames) public {
    candidateList = candidateNames;
    totalTokens = tokens;
    balanceTokens = tokens;
    tokenPrice = pricePerToken;
  }
  function buy() public payable {
    uint tokensToBuy = msg.value / tokenPrice;
    require(tokensToBuy <= balanceTokens, "There is not enough token");
    voterInfo[msg.sender].voterAddress = msg.sender;
    voterInfo[msg.sender].tokensBought += tokensToBuy;
    balanceTokens -= tokensToBuy;
  }
  function voteForCandidate(bytes32 candidate, uint tokens) public {
    uint availableTokens = voterInfo[msg.sender].tokensBought - totalTokensUsed(voterInfo[msg.sender].tokensUsedPerCandidate);
    require(tokens <= availableTokens, "You don't have enough tokens");
    votesReceived[candidate] += tokens;
    if(voterInfo[msg.sender].tokensUsedPerCandidate.length == 0) {
      for(uint i = 0; i < candidateList.length; i++) {
        voterInfo[msg.sender].tokensUsedPerCandidate.push(0);
      }
    }
    uint index = indexOfCandidate(candidate);
    voterInfo[msg.sender].tokensUsedPerCandidate[index] += tokens;
  }
  function indexOfCandidate(bytes32 candidate) public view returns(uint) {
    for(uint i = 0; i < candidateList.length; i++) {
      if (candidateList[i] == candidate) {
        return i;
      }
    }
    return uint(-1);
  }
  function totalTokensUsed(uint[] memory _tokensUsedPerCandidate) private pure returns (uint) {
    uint totalUsedTokens = 0;
    for(uint i = 0; i < _tokensUsedPerCandidate.length; i++) {
      totalUsedTokens += _tokensUsedPerCandidate[i];
    }
    return totalUsedTokens;
  }
  function voterDetails(address user) public view returns (uint, uint[] memory) {
    return (voterInfo[user].tokensBought, voterInfo[user].tokensUsedPerCandidate);
  }
  function tokensSold() public view returns (uint) {
    return totalTokens - balanceTokens;
  }
  function allCandidates() public view returns (bytes32[] memory) {
    return candidateList;
  }
  function totalVotesFor(bytes32 candidate) public view returns (uint) {
    return votesReceived[candidate];
  }
}