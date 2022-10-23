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

import * as dc from './DataClasses';
import * as sw3 from '@solana/web3.js';
import * as bs58 from "bs58";

//Declared prompt and connection globally at top so it can be used in whole class
let prompt = require('prompt-sync')();
let connection : sw3.Connection = new sw3.Connection("https://api.devnet.solana.com");

async function main() {  
  console.log("\nWelcome to this small Solana staking tool.");  
  let order : dc.Order = new dc.Order();
  askPublicKey(order);  
  await askAmount(order); 
  askPrivateKey(order);   
  await processTransaction(order); 
};


/*
Asks for a public key. Checks if it is a valid public key with the solanaWeb3.PublicKey.isOnCurve() method.
If valid public key proceed otherwise ask again.
*/
function askPublicKey(order: dc.Order) {
  let publicKeyString: string = prompt('Please enter your public key (bs58 format):');  
  try{
    const publicKey = new sw3.PublicKey(publicKeyString);
    if(sw3.PublicKey.isOnCurve(publicKey)){
      //When valid input is given update the order and exit recursion loop
      order.publicKey = publicKey;
    }
    else{
      console.log("Invalid public key, please try again.\n");
      askPublicKey(order);
    }
  }
  catch (error) {
    console.log("Invalid public key, please try again.\n");
    askPublicKey(order);
  } 
};


/*
Retrieve the SOL balance of the given publicKey and display it.
Ask user how much he wants to stake if input is a valid number and if he has enough SOL proceed otherwise ask again.
*/
async function askAmount(order: dc.Order)  {  
  let balance: number = await connection.getBalance(order.publicKey);
  
  console.log(`You current SOL balance is ${balance / sw3.LAMPORTS_PER_SOL} SOL.`);  
  let solToBeStakedString: string = prompt('How much SOL do you want to stake?');

  try{
    //convert input to number, trow error when invalid input
    let solToBeStaked : number = Number(solToBeStakedString);
    if(solToBeStaked <= (balance / sw3.LAMPORTS_PER_SOL) && solToBeStaked>0 ){
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
  
};

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
function askPrivateKey(order: dc.Order) {  
  let privateKeyString: string = prompt('Please enter your private key (bs58 format):');  
  try{

    //Go from your private key to public key and check if it is the same
    let keyPair: sw3.Keypair = sw3.Keypair.fromSecretKey(bs58.decode(privateKeyString));            
    if(keyPair.publicKey.toBase58() == order.publicKey.toBase58()){
      //When valid input is given update the order and exit the recursion loop
      order.privateKey = keyPair.secretKey;
    }
    else{
      console.log("Private key does not match your public key, please try again.\n");
      askPrivateKey(order);
    }
  }
  catch (error) {
    console.log("Private key does not match your public key, please try again.\n");
    askPrivateKey(order);
  }  
};


/*
Create a new keypair for the staking account
Use the user public key as the payer, stake authority and witdraw authority.
Post transaction and show where the user can find it on the Solana explorer
Wait untill transaction is confirmed.
*/
async function processTransaction(order: dc.Order) {    
  try{
    let newStakeAccount: sw3.Keypair = sw3.Keypair.generate();
    let userWallet: sw3.Keypair = sw3.Keypair.fromSecretKey(order.privateKey);
    let createAccountTransaction = sw3.StakeProgram.createAccount({
      fromPubkey: order.publicKey,
      authorized: new sw3.Authorized(
        order.publicKey,
        order.publicKey,
      ),
      lamports: order.amount * sw3.LAMPORTS_PER_SOL,
      lockup: new sw3.Lockup(0, 0, order.publicKey),
      stakePubkey: newStakeAccount.publicKey,
    });
        
    order.transactionID = await connection.sendTransaction(createAccountTransaction, [userWallet, newStakeAccount]);
    
    console.log(`Your transaction is being processed this might take a few seconds...`); 
    console.log(`You can find your transaction here:\r\nhttps://explorer.solana.com/tx/${order.transactionID}?cluster=devnet`); 
    await connection.confirmTransaction(order.transactionID);

    console.log(`\nSucces!`);
    console.log(`You staked ${order.amount} SOL into stake account: ${newStakeAccount.publicKey}`);
  }

  catch(error){
    console.log(error);
    console.log("Something went wrong :(");
  }
};





async function runMain() {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}; 

runMain();