multisender = () => {

const Metaplex = require('@metaplex/js');
const NodeWallet = Metaplex.NodeWallet;
require('dotenv').config()

const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    Transaction
} = require("@solana/web3.js");

const newPair = new Keypair();

// Storing the wallet credentials

const publicKey = new PublicKey(newPair._keypair.publicKey).toString();
const secretKey = newPair._keypair.secretKey;

var fs = require("fs");

var Buffer = require('buffer/').Buffer;

console.log(process.env.NETWORK);

const network = process.env.NETWORK;
const apiKey = process.env.API_KEY;
const tokenAddress = process.env.TOKEN_ADDRESS;
const fromAddress = process.env.FROM_ADDRESS;

var myHeaders = new Headers();
myHeaders.append("x-api-key", apiKey);
myHeaders.append("Content-Type", "application/json");

fs.readFile("./holders.json" , "utf8", async function(err, data){
    var addresses = JSON.parse(data);
    var arrayAddresses = await getArrayAddresses(addresses);
    var response = generateAirDrop(arrayAddresses);
    console.log(response);
});

async function getArrayAddresses(addresses)
{
    var arrayAddressesAll = [];
    var arrayAddresses = [];
    addresses.forEach((address,i) => {
        arrayAddresses.push({
            "to_address": address,
            "amount": 0.001
        });

        if((i+1) % 100 == 0 || (i+1) == addresses.length){
            arrayAddressesAll.push(arrayAddresses);
            arrayAddresses = [];
        }
    });

    return arrayAddressesAll;
}

async function generateAirDrop(arrayAddresses)
{    
    for(const [index,addresses] of arrayAddresses.entries()){
        var response = await airDropTransaction(addresses);
        var repsonseAssignTransaction = await assignTransaction(response);
        return repsonseAssignTransaction;
    }
};

async function airDropTransaction(addresses)
{
    var raw = JSON.stringify({
        "network": network,
        "token_address": tokenAddress,
        "from_address": fromAddress,
        "transfer_info": addresses
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    
    let response = await fetch("https://api.shyft.to/sol/v1/token/airdrop", requestOptions);

    return response.text();

}

async function assignTransaction(response)
{
    var objResponse = JSON.parse(response);
    var result = objResponse.result;
    var encodedTransaction = JSON.stringify(result.encoded_transaction);

    const connection = new Connection(clusterApiUrl(network), 'confirmed');
    const feePayer = Keypair.fromSecretKey(secretKey);
    const wallet = new NodeWallet(feePayer);

    const recoveredTransaction = Transaction.from(
        Buffer.from(encodedTransaction, 'base64')
    );
    const signedTx = await wallet.signTransaction(recoveredTransaction);
    const confirmTransaction = await connection.sendRawTransaction(
        signedTx.serialize()
    );
    return confirmTransaction;
}

}

module.exports = {multisender};