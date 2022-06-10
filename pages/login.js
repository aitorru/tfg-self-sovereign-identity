import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
// import { v4 as uuidv4 } from 'uuid';


import MainButton from '../components/button';
import useAppContext from '../context';

export default function Login() {
	const router = useRouter();
	const { setDID } = useAppContext();
	const [Status, setStatus] = useState();
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
		setStatus('Generating DID');
		// Module is big, import it dynamically
		const { EthrDID } = (await import('ethr-did'));
		const { Web3Provider } = (await import('@ethersproject/providers'));
		const Web3p = new Web3Provider(window.ethereum);
		// Generate DID
		const ethrDid = new EthrDID({identifier: account, Web3p, chainId});
		// Ask the user for their public key
		// TODO: check for denial
		const publicKey = await window.ethereum
			.request({
				method: 'eth_getEncryptionPublicKey',
				params: [account]
			});
		// Insert public key into DID
		ethrDid.publicKey = publicKey;
		setDID(ethrDid);
		router.push('/upload');



		
		// // Data payload
		// // TODO: Generate UUID
		// const data = 'Hola mundo';
		// // Dynamic import
		// Generate Sync key and encrypt it with the public key
		// const {encrypt} = (await import('../utils'));
		// const buffer = encrypt(uuidv4(), publicKey);
		// ethrDid.key = buffer.toString('hex');
		
		// // All the data you pass needs to be in hex
		// window.ethereum
		// 	.request({
		// 		method: 'eth_decrypt',
		// 		params: [buffer.toString('hex'), account]
		// 	})
		// 	.then(console.log);
	};

	useEffect(() => {
	}, [active]);

	return (
		<div className="h-full min-h-screen flex flex-col justify-center">
			<div className="flex1">
				<div className="container mx-auto">
					<div className="flex flex-col gap-3 items-center w-full h-96 bg-gray-100 rounded-lg shadow-lg">
						<h1 className='text-3xl'>Login</h1>
						{active ? <><h1>Please, <span className='font-bold'>{account ?? null}</span> allow us to store your public key in OrbitDB.</h1></> : null}
						{Status && <h1>{Status}</h1>}
						{active ? <MainButton text={'Continue with login'} onClick={sendReqToBlockChain} /> : null}
						{!active ? <h1 className='text-2xl'>Select any of the following wallet connection methods</h1> : null}
						{!active ? <MainButton text={'Activate with injected (MetaMask)'} onClick={activateMetaMask} /> : null}
						{!active ? <MainButton text={'Activate with WalletConnect (QR)'} onClick={activeWalletConnect} /> : null}
					</div>
				</div>
			</div>
		</div>

	);
}
