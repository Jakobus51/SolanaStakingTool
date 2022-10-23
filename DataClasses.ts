import * as solanaWeb3 from '@solana/web3.js';

//Create new dataType that gets passed around to fullfill the stake order
export type Order = {
    publicKey: solanaWeb3.PublicKey   
    privateKey: Uint8Array   
    amount: number    
    transactionID: string
}

//Initliaze empty Order type
export function Order(){

};