import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import axios from 'axios';
import { useEffect } from 'react';


import MainButton from '../components/button';

export default function Login() {
	// Default MetaMask injected connector.
	const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42, 1337] }); // 1337 means the localhost address.
	// QR remote connector
	const walletconnect = new WalletConnectConnector(
		{
			rpc: { 1: `https://relay.walletconnect.com/?apiKey=${process.env.WALLETCONNECT}` },
			qrcode: true
		}
	);
	const context = useWeb3React();
	const { chainId, account, activate, active } = context;

	const activateMetaMask = () => {
		activate(injected);
	};
	const activeWalletConnect = () => {
		activate(walletconnect);
	};
	const sendReqToBlockChain = async () => {
		// Module is big, import it dynamically
		const { EthrDID } = (await import('ethr-did'));
		const { Web3Provider } = (await import('@ethersproject/providers'));
		const Web3p = new Web3Provider(window.ethereum);
		const ethrDid = new EthrDID({identifier: account, Web3p, chainId});
		console.log(ethrDid);
		const publicKey = await window.ethereum
			.request({
				method: 'eth_getEncryptionPublicKey',
				params: [account]
			});
		const response = await axios.post('/api/encrypt', {publicKey, data: 'Hola mundo'});
		console.log(response);

		window.ethereum
			.request({
				method: 'eth_decrypt',
				params: [response.data.payload, account]
			})
			.then(console.log);
	};

	useEffect(() => {
	}, [active]);

	return (
		<div className="h-full min-h-screen flex flex-col justify-center">
			<div className="flex1">
				<div className="container mx-auto">
					<div className="flex flex-col gap-3 items-center w-full h-96 bg-gray-100 rounded-lg shadow-lg">
						<h1 className='text-3xl'>Login</h1>
						{active ? <h1>{chainId ?? null}</h1> : null}
						{active ? <h1>{account ?? null}</h1> : null}
						{active ? <MainButton text={'Send req'} onClick={sendReqToBlockChain} /> : null}
						{!active ? <h1 className='text-2xl'>Select any of the following wallet connection methods</h1> : null}
						{!active ? <MainButton text={'Activate with injected (MetaMask)'} onClick={activateMetaMask} /> : null}
						{!active ? <MainButton text={'Activate with WalletConnect (QR)'} onClick={activeWalletConnect} /> : null}
					</div>
				</div>
			</div>
		</div>

	);
}