ethereum
    .request({ method: 'eth_getBalance', params: ['0x73359C80C90ccB2f7493CC5965ABe3bc68199Bf9', 'latest'] })
    .then((resp) => console.log(+resp/1000000000000000000))
