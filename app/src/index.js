import Web3 from "web3";
import votingArtifact from "../../build/contracts/Voting.json";

let candidates = {};
let pricePerToken;

const App = {
  web3: null,
  account: null,
  voting: null,
  contractAddress: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = votingArtifact.networks[networkId];
      this.contractAddress = deployedNetwork.address;
      this.voting = new web3.eth.Contract(
        votingArtifact.abi,
        deployedNetwork.address
      );


      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      this.populateCandidates();
    } catch (error) {
      console.log(error);
      console.error(
        "Could not connect to contract or chain. change Metamask network"
      );
    }
  },

  // count vote for any candidate
  populateCandidates: async function () {
    await this.loadCandidates();
    this.setupCandidateRows();
    await this.populateTokenData();

    // const totalVotesFor = this.voting.methods.totalVotesFor;
    const { totalVotesFor } = this.voting.methods;
    let candidateNames = Object.keys(candidates);
    for (var i = 0; i < candidateNames.length; i++) {
      let name = candidateNames[i];
      var count = await totalVotesFor(this.web3.utils.asciiToHex(name)).call();
      $("." + candidates[name]).html(count);
    }
  },

  // get candidate information
  loadCandidates: async function () {
    const { allCandidates } = this.voting.methods;

    let candidateArray = await allCandidates().call();
    for (let i = 0; i < candidateArray.length; i++) {
      candidates[this.web3.utils.hexToUtf8(candidateArray[i])] =
        "candidate-" + i;
    }
  },

  // set candidate information in html
  setupCandidateRows: function () {
    $(".eth-candidate-rows").empty();
    Object.keys(candidates).forEach(function (candidate) {
      $(".eth-candidate-rows").append(
        '<div class="-dis-f -al-it-s -jus-c-sb -py-5 -fnt-s-smaller"><p class="-w-12 -c-gray-5">' +
        candidate +
        '</p><p class="-w-12 -c-gray-6 ' +
        candidates[candidate] +
        '"></p></div>'
      );
    });
  },

  // get token information
  populateTokenData: async function () {
    const { web3 } = this;
    const { totalTokens, tokensSold, tokenPrice } = this.voting.methods;

    let value = await totalTokens().call();
    $(".eth-tokens-total").html(value.toString());

    value = await tokensSold().call();
    $(".eth-tokens-sold").html(value.toString());

    value = await tokenPrice().call();
    pricePerToken = web3.utils.fromWei(value.toString());
    $(".eth-token-cost").html(pricePerToken + " Ether");

    web3.eth.getBalance(this.contractAddress, function (error, result) {
      $(".eth-contract-balance").html(
        web3.utils.fromWei(result.toString()) + " Ether"
      );
    });
  },

  // buy tokens
  buyTokens: async function () {
    let tokensToBuy = parseInt($("#buy").val());
    let price = tokensToBuy * parseInt(this.web3.utils.toWei(pricePerToken));
    const { buy } = this.voting.methods;

    $("#buy-msg").html("سفارش شما ثبت شده‌است. لطفا صبر کنید...");
    await buy().send({ gas: 140000, value: price, from: this.account });
    $("#buy-msg").html("");
    let balance = await this.web3.eth.getBalance(this.contractAddress);
    $(".eth-contract-balance").html(
      this.web3.utils.fromWei(balance.toString()) + " Ether"
    );
    await this.populateTokenData();
  },

  // vote for candidate
  voteForCandidate: async function () {
    const { web3 } = this;
    let candidateName = $("#candidate").val();
    let voteTokens = $("#vote-tokens").val();
    $("#msg").html(
      "رای شما ارسال شده است، به محض ثبت رای در بلاکچین رای شما شمرده میشود. لطفا صبر کنید..."
    );
    $("#candidate").val("");
    $("#vote-tokens").val("");

    const { totalVotesFor, voteForCandidate } = this.voting.methods;
    await voteForCandidate(
      web3.utils.asciiToHex(candidateName),
      voteTokens
    ).send({ gas: 140000, from: this.account });
    let div_id = candidates[candidateName];
    var count = await totalVotesFor(
      web3.utils.asciiToHex(candidateName)
    ).call();
    $("." + div_id).html(count);
    $("#msg").html("");
  },

  lookupVoterInfo: async function () {
    try {
      let address = $("#voter-info").val();
      const { voterDetails } = this.voting.methods;
      let v = await voterDetails(address).call();
      $(".eth-search-result").removeClass("-dis-n-i");
      $(".eth-tokens-bought").html(v[0].toString());
      let votesPerCandidate = v[1];
      $(".eth-votes-cast").empty();
      let allCandidates = Object.keys(candidates);
      for (let i = 0; i < allCandidates.length; i++) {
        if (votesPerCandidate[i] == undefined) votesPerCandidate[i] = 0;
        $(".eth-votes-cast").append(
          '<div class="-dis-f -al-it-s -jus-c-sb -py-5 -fnt-s-smaller"><p class="-w-12 -c-gray-5">' +
          allCandidates[i] +
          '</p><p class="-w-12 -c-gray-6">' +
          votesPerCandidate[i] +
          "</p></div>"
        );
      }
      $("#search-msg").empty();
    } catch (error) {
      $(".eth-search-result").addClass("-dis-n-i");
      $("#search-msg").html("اکانتی با این مشخصات یافت نشد.");
    }
  }
};

window.App = App;

window.addEventListener("load", function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live"
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545")
    );
  }

  App.start();
});

// handle nav menu and active menu
$(document).ready(function () {
  $(".nav_button").on("click", function () {
    $(".content > div").addClass("-dis-n-i");
    $(".nav_button").removeClass("active");
    $(this).addClass("active");
    $(".content > ." + $(this).attr("data-content")).removeClass("-dis-n-i");
  });
});
