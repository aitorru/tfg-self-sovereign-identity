import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { useEffect } from 'react';
import MainButton from '../components/button'

export default function Login() {
    // Default MetaMask injected connector.
    const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42, 1337] }) // 1337 means the localhost address.
    // QR remote connector
    const walletconnect = new WalletConnectConnector({
        rpc: { 1: `https://relay.walletconnect.com/?apiKey=${process.env.WALLETCONNECT}` },
        qrcode: true
    })
    const context = useWeb3React();
    console.log(context);
    const { connector, library, chainId, account, activate, deactivate, active, error } = context;

    const activateMetaMask = () => {
        activate(injected);
    }
    const activeWalletConnect = () => {
        activate(walletconnect);
    }

    useEffect(() => {
        console.log(active);
    }, [active])

    return (
        <div className="h-full min-h-screen flex flex-col justify-center">
            <div className="flex1">
                <div className="container mx-auto">
                    <div className="flex flex-col gap-3 items-center w-full h-96 bg-gray-100 rounded-lg shadow-lg">
                        <h1 className='text-3xl pt-2'>Login</h1>
                        <h1>{chainId ?? ''}</h1>
                        <h1>
                            {account ?? ''}
                        </h1>
                        {!active ? <MainButton text={"Activate MetaMask"} onClick={activateMetaMask} /> : null}
                        {!active ? <MainButton text={"Activate WalletLink"} onClick={activeWalletConnect} /> : null}
                    </div>
                </div>
            </div>
        </div>

    )
}