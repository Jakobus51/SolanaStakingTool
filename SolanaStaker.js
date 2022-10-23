"use strict";
/*
Resources used:
https://docs.solana.com/developing/clients/javascript-reference
https://yihau.github.io/solana-web3-demo/
https://solana-labs.github.io/solana-web3.js/

General approach:
1) Create new empty order.
2) Ask for public key.
3) Ask for stake amount.
4) Ask for private key.
5) Process transaction.
Detailed description of each method can be found above the method.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var dc = require("./DataClasses");
var sw3 = require("@solana/web3.js");
var bs58 = require("bs58");
//Declared prompt and connection globally at top so it can be used in whole class
var prompt = require('prompt-sync')();
var connection = new sw3.Connection("https://api.devnet.solana.com");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\nWelcome to this small Solana staking tool.");
                    order = new dc.Order();
                    console.log(order);
                    askPublicKey(order);
                    console.log(order);
                    return [4 /*yield*/, askAmount(order)];
                case 1:
                    _a.sent();
                    console.log(order);
                    askPrivateKey(order);
                    console.log(order);
                    return [4 /*yield*/, processTransaction(order)];
                case 2:
                    _a.sent();
                    console.log(order);
                    return [2 /*return*/];
            }
        });
    });
}
;
/*
Asks for a public key. Checks if it is a valid public key with the solanaWeb3.PublicKey.isOnCurve() method.
If valid public key proceed otherwise ask again.
*/
function askPublicKey(order) {
    var publicKeyString = prompt('Please enter your public key (bs58 format):');
    try {
        var publicKey = new sw3.PublicKey(publicKeyString);
        if (sw3.PublicKey.isOnCurve(publicKey)) {
            //When valid input is given update the order and exit recursion loop
            order.publicKey = publicKey;
        }
        else {
            console.log("Invalid public key, please try again.\n");
            askPublicKey(order);
        }
    }
    catch (error) {
        console.log("Invalid public key, please try again.\n");
        askPublicKey(order);
    }
}
;
/*
Retrieve the SOL balance of the given publicKey and display it.
Ask user how much he wants to stake if input is a valid number and if he has enough SOL proceed otherwise ask again.
*/
function askAmount(order) {
    return __awaiter(this, void 0, void 0, function () {
        var balance, solToBeStakedString, solToBeStaked;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.getBalance(order.publicKey)];
                case 1:
                    balance = _a.sent();
                    console.log("You current SOL balance is ".concat(balance / sw3.LAMPORTS_PER_SOL, " SOL."));
                    solToBeStakedString = prompt('How much SOL do you want to stake?');
                    try {
                        solToBeStaked = Number(solToBeStakedString);
                        if (solToBeStaked <= (balance / sw3.LAMPORTS_PER_SOL) && solToBeStaked > 0) {
                            //When valid input is given update the order and exit the recursion loop
                            order.amount = solToBeStaked;
                        }
                        else {
                            console.log("Invalid input, make sure your input is a positive number less or equal than your balance\n");
                            askAmount(order);
                        }
                    }
                    catch (error) {
                        console.log("Input not recognized as a number, please try again.\n");
                        askAmount(order);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
;
/*
Tried to implement something extra; the ability to add extra SOL to an already existing staking acount.
But it just creates a new staking account for some reason, learned a lot from it though
*/
//function setStakingAcccount(order: dc.Order){
// let response: string = prompt('Do you want to use an existing staking account? [y/n]');
// switch(response){
//   case 'y':{
//     try{
//       let publicStakingKeyString: string = prompt('Please enter your STAKING public key (bs58 format):');  
//       const publicStakingKey = new sw3.PublicKey(publicStakingKeyString);
//       if(sw3.PublicKey.isOnCurve(publicStakingKey)){
//         //When valid input is given update the order and exit the loop
//         order.existingStakeAccountPublicKey = publicStakingKey;
//         order.useFreshStakingAccount = false;
//       }
//       else{
//         console.log("Invalid public key, please try again.\n");
//         setStakingAcccount(order);
//       }
//     }
//     catch (error) {
//       console.log("Invalid public key, please try again.\n");
//       setStakingAcccount(order);
//     } 
//   }
//   case 'n':{    
//     order.newStakeAccount = sw3.Keypair.generate();
//     order.useFreshStakingAccount = true;
//     break;      
//   }
//   default:{
//     console.log("Please give valid input. Only y or n allowed\n");
//     setStakingAcccount(order); 
//   }   
// } 
//}
/*
Asks for a private key. Checks if the private key corresponds to the earlier given public key.
If they don't match ask again.
*/
function askPrivateKey(order) {
    var privateKeyString = prompt('Please enter your private key (bs58 format):');
    try {
        //Go from your private key to public key and check if it is the same
        var keyPair = sw3.Keypair.fromSecretKey(bs58.decode(privateKeyString));
        if (keyPair.publicKey.toBase58() == order.publicKey.toBase58()) {
            //When valid input is given update the order and exit the recursion loop
            order.privateKey = keyPair.secretKey;
        }
        else {
            console.log("Private key does not match your public key, please try again.\n");
            askPrivateKey(order);
        }
    }
    catch (error) {
        console.log("Private key does not match your public key, please try again.\n");
        askPrivateKey(order);
    }
}
;
/*
Create a new keypair for the staking account
Use the user public key as the payer, stake authority and witdraw authority.
Post transaction and show where the user can find it on the Solana explorer
Wait untill transaction is confirmed.
*/
function processTransaction(order) {
    return __awaiter(this, void 0, void 0, function () {
        var newStakeAccount, userWallet, createAccountTransaction, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    newStakeAccount = sw3.Keypair.generate();
                    userWallet = sw3.Keypair.fromSecretKey(order.privateKey);
                    createAccountTransaction = sw3.StakeProgram.createAccount({
                        fromPubkey: order.publicKey,
                        authorized: new sw3.Authorized(order.publicKey, order.publicKey),
                        lamports: order.amount * sw3.LAMPORTS_PER_SOL,
                        lockup: new sw3.Lockup(0, 0, order.publicKey),
                        stakePubkey: newStakeAccount.publicKey
                    });
                    _a = order;
                    return [4 /*yield*/, connection.sendTransaction(createAccountTransaction, [userWallet, newStakeAccount])];
                case 1:
                    _a.transactionID = _b.sent();
                    console.log("Your transaction is being processed this might take a few seconds...");
                    console.log("You can find your transaction here:\r\nhttps://explorer.solana.com/tx/".concat(order.transactionID, "?cluster=devnet"));
                    return [4 /*yield*/, connection.confirmTransaction(order.transactionID)];
                case 2:
                    _b.sent();
                    console.log("\nSucces!");
                    console.log("You staked ".concat(order.amount, " SOL into stake account: ").concat(newStakeAccount.publicKey));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.log(error_1);
                    console.log("Something went wrong :(");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
;
function runMain() {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, main()];
                case 1:
                    _a.sent();
                    process.exit(0);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error(error_2);
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
;
runMain();
