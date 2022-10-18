const Web3 = require('web3');
const fs = require('fs')

var WSWEB3 = 'ws://localhost:8546'  // WebSocket endpoint for the RPC server

var web3 = new Web3(Web3.givenProvider || WSWEB3);

endblock = await web3.eth.getBlockNumber()
startBlock = endblock - 1000;
var contractMapTo = new Map();
var contractMapGasUsed = new Map();

async function main(){

    for (let i = startBlock; i<endblock ; i++) {
        console.log("Block: " + i);
        var blockObject = web3.eth.getBlock(i);
        var allTransactions = blockObject.transactions;
        for (let j = 0; j < allTransactions.length; j++) {
            var transaction = allTransactions[j];
            var transactionObject = web3.eth.getTransaction(transaction);
            var gasUsed = transactionObject.gasUsed;
            var tx_to = transactionObject.to;
            if (contractMapTo.has(tx_to)) {
                let gasUsedValue = contractMapGasUsed.get(tx_to);
                gasUsedValue += gasUsed;
                contractMapGasUsed.set(tx_to, gasUsedValue);
                contractMapTo.set(tx_to, contractMapTo.get(tx_to) + 1);
            }else{
                contractMapTo.set(tx_to, 1);
                contractMapGasUsed.set(tx_to, gasUsed);
            }
        }
        
    }

    let now = Math.floor(new Date().getTime() / 1000)

    fs.appendFile(`./output/outTo-${now}.csv`, `contract, txs` , function (err) {
        if (err) throw err;
        console.log('Created output file : ' + `./output/outTo-${now}.csv`);
    });

    for (var [key, value] of Object.entries(contractMapTo)) {
        fs.appendFile(`./output/outTo-${now}.csv`, `\n${key}, ${value}` , function (err) {
            if (err) throw err;
            console.log('Added to outputFile');
        });
    }

    fs.appendFile(`./output/outGasUsed-${now}.csv`, `contract, txs` , function (err) {
        if (err) throw err;
        console.log('Created output file : ' + `./output/outGasUsed-${now}.csv`);
    });

    for (var [key, value] of Object.entries(contractMapGasUsed)) {
        fs.appendFile(`./output/outGasUsed-${now}.csv`, `\n${key}, ${value}` , function (err) {
            if (err) throw err;
            console.log('Added to outputFile');
        });
    }

    const timer = ms => new Promise(res => setTimeout(res, ms))

    await timer(10000)

    process.exit(0)

}

main()
