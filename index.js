const Web3 = require('web3');
const fs = require('fs')

var WSWEB3 = 'ws://localhost:8546'  // WebSocket endpoint for the RPC server

var web3 = new Web3(Web3.givenProvider || WSWEB3);

const timer = ms => new Promise(res => setTimeout(res, ms))

async function main(){

    endblock = await web3.eth.getBlockNumber()
    startBlock = endblock - 5000;
    var contractMapTo = new Map();
    var contractMapGasUsed = new Map();

    for (let i = startBlock; i<endblock ; i++) {
        console.log("Block: " + i);
        var blockObject = await web3.eth.getBlock(i);
        var allTransactions = blockObject.transactions;
        for (let j = 0; j < allTransactions.length; j++) {
            var transaction = allTransactions[j];
            var transactionObject = await web3.eth.getTransactionReceipt(transaction);
            var gasUsed = transactionObject.gasUsed;
            var tx_to = transactionObject.to;
            if (contractMapTo.has(tx_to)) {
                let gasUsedValue = parseInt(contractMapGasUsed.get(tx_to));
                gasUsedValue += parseInt(gasUsed);
                contractMapGasUsed.set(tx_to, gasUsedValue);
                contractMapTo.set(tx_to, contractMapTo.get(tx_to) + 1);
            }else{
                contractMapTo.set(tx_to, 1);
                contractMapGasUsed.set(tx_to, parseInt(gasUsed));
            }
        }
        
    }

    let now = Math.floor(new Date().getTime() / 1000)

    console.log(contractMapTo)
    console.log(contractMapGasUsed)

    await fs.appendFile(`./output/outTo-${now}.csv`, `contract, txs` , function (err) {
        if (err) throw err;
        console.log('Created output file : ' + `./output/outTo-${now}.csv`);
    });

    await timer(1000)


    for (var [key, value] of contractMapTo.entries()) {
        await fs.appendFile(`./output/outTo-${now}.csv`, `\n${key}, ${value}` , function (err) {
            if (err) throw err;
            
        });
    }

    await fs.appendFile(`./output/outGasUsed-${now}.csv`, `contract, gasUsed` , function (err) {
        if (err) throw err;
        console.log('Created output file : ' + `./output/outGasUsed-${now}.csv`);
    });

    await timer(1000)


    for (var [key, value] of contractMapGasUsed.entries()) {
        await fs.appendFile(`./output/outGasUsed-${now}.csv`, `\n${key}, ${value}` , function (err) {
            if (err) throw err;
            
        });
    }


    await timer(10000)

    process.exit(0)

}

main()
