/*
Not to exiciting code, only used to create devnet Solana accounts with 2 SOL each
Copied all this code from: https://yihau.github.io/solana-web3-demo/tour/create-keypair.html
*/

import { Connection,Keypair, LAMPORTS_PER_SOL  } from "@solana/web3.js";
import * as bs58 from "bs58";

const connection = new Connection("https://api.devnet.solana.com");
(async () => {  
  {
    //Generate Keypair and output its public and private key
    const keypair = Keypair.generate();
    console.log(`public key: ${keypair.publicKey.toBase58()}`);   
    console.log(`private key(bs58): ${bs58.encode(keypair.secretKey)}`);

    //Add some sol to the wallet
    const feePayer = Keypair.fromSecretKey(keypair.secretKey);
    let txhash: string = await connection.requestAirdrop(feePayer.publicKey, 2e9);

    //Output the transaction id
    console.log(`txhash: ${txhash}`);

    //(a)Wait till the transaction is confirmed before retrieving the balance
    await connection.confirmTransaction(txhash);
    let balance = await connection.getBalance(feePayer.publicKey);
    console.log(`${balance / LAMPORTS_PER_SOL} SOL`);

  }
})();