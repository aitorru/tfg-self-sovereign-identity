import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { useEffect } from 'react';
import MainButton from '../components/button'
import jsonInterface from '../soliditySource/build/contracts/Storage.json'
var Contract = require('web3-eth-contract');

export default function Login() {
    // Default MetaMask injected connector.
    const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42, 1337] }) // 1337 means the localhost address.
    // QR remote connector
    const walletconnect = new WalletConnectConnector({
        rpc: { 1: `https://relay.walletconnect.com/?apiKey=${process.env.WALLETCONNECT}` },
        qrcode: true
    })
    const context = useWeb3React();
    const { connector, library, chainId, account, activate, deactivate, active, error } = context;

    const activateMetaMask = () => {
        activate(injected);
    }
    const activeWalletConnect = () => {
        activate(walletconnect);
    }
    const sendReqToBlockChain = async () => {
        const ethers = library;
        Contract.setProvider(ethers);
        // Retrive the 
        var contract = new Contract(jsonInterface['abi'], '0xb63d437c7d969CF20EaCF000Cc02C66d4b8C982c'); // TODO: the jsonInterface has the contract address
        //await contract.methods.emitAll("hola", "mundo").send({ from: account, gasPrice: 21000 });
        var result = await contract.methods.retriveAll().send({ from: account, gasPrice: 21000 });
        console.log(result);
    }
    const uploadSaltNPepperToBlockchain = () => {
        const ethers = library;
        Contract.setProvider(ethers);
        // Retrive the 
        var contract = new Contract(jsonInterface['abi'], '0xb63d437c7d969CF20EaCF000Cc02C66d4b8C982c');
    }

    useEffect(() => {
        console.log(active);
    }, [active])

    return (
        <div className="h-full min-h-screen flex flex-col justify-center">
            <div className="flex1">
                <div className="container mx-auto">
                    <div className="flex flex-col gap-3 items-center w-full h-96 bg-gray-100 rounded-lg shadow-lg">
                        <h1 className='text-3xl'>Login</h1>
                        {active ? <h1>{chainId ?? null}</h1> : null}
                        {active ? <h1>{account ?? null}</h1> : null}
                        {active ? <MainButton text={"Send req"} onClick={sendReqToBlockChain} /> : null}
                        {!active ? <h1 className='text-2xl'>Select any of the following wallet connection methods</h1> : null}
                        {!active ? <MainButton text={"Activate injected (MetaMask)"} onClick={activateMetaMask} /> : null}
                        {!active ? <MainButton text={"Activate WalletLink (QR)"} onClick={activeWalletConnect} /> : null}
                    </div>
                </div>
            </div>
        </div>

    )
}