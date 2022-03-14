import { useWeb3React } from '@web3-react/core';
import Header from '../components/header';
import { useState, useEffect, createRef } from 'react';
import Head from 'next/head';
import MainButton from '../components/button';
import useAppContext from '../context';
import { encrypt, readfile } from '../utils';
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');



export default function Upload() {
	let db = null;
	const [ inputValue, setInputValue ] = useState('');
	const [ address, setAddress ] = useState('');
	const [ connectionActive, setConnectionActive ] = useState(false);
	const [ peers, setPeers ] = useState({});
	const [selectedAddress, setSelectedAddress] = useState('');
	const imageUpload = createRef();
	const { ipfs, setIpfs, DID } = useAppContext();
	const handleInputChange = (event) => {
		setInputValue(event.target.value);
	};
	const context = useWeb3React();
	const { account } = context;

	// Connect to IPFS 
	useEffect(async () => {
		// Connect to ipfs
		if(!ipfs) {
			const ipfsOptions = { 
				repo: '/ipfs/tfg',
				start: true,
				EXPERIMENTAL: {
					pubsub: true,
				},
				config: {
					Addresses: {
						Swarm: [
							'/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/'
						]
					},
				}
			};
			const ipfs_local = await IPFS.create(ipfsOptions);
			setIpfs(ipfs_local);	
		}
		
	}, []);

	const handleCreateDB = async () => {
		if(db || !ipfs) return;
		
		// Create instance
		// Mantain connection to pesist data
		const orbitdb = await OrbitDB.createInstance(ipfs);
		const options = {
			// Give write access to everyone
			accessController: {
				write: ['*']
			}
		};
		// Create key value db
		db = await orbitdb.keyvalue(account, options);
		// Replicate db in local storage
		await db.load();
		// Change UI after connection
		setConnectionActive(true);
		// Update UI
		setAddress(db.address.toString());
		// When the database is ready (ie. loaded), display results
		db.events.on('ready', () => handlePeersUpdate());
		// When database gets replicated with a peer, display results
		db.events.on('replicated', () => handlePeersUpdate());
		// When we update the database, display result
		db.events.on('write', () => handlePeersUpdate());
		// Obtain DID from global context and upload it
		const DID_safe = DID;
		Object.keys(DID_safe).forEach(key => DID_safe[key] === undefined ? delete DID_safe[key] : {});
		await db.put(account, DID_safe);
		console.log('Uploaded');
	};
	const handleConnectToDatabase = async () => {
		if(!OrbitDB.isValidAddress(inputValue)) return;
		try {
			// Create instance
			const orbitdb = await OrbitDB.createInstance(ipfs);
			// Connect to remote db
			db = await orbitdb.open(inputValue);
			// Replicate db in local storage
			await db.load();
			// Change UI after connection
			setConnectionActive(true);
			// Update UI (just because)
			setAddress(db.address.toString());
			// When the database is ready (ie. loaded), display results
			db.events.on('ready', () => handlePeersUpdate());
			// When database gets replicated with a peer, display results
			db.events.on('replicated', () => handlePeersUpdate());
			// When we update the database, display result
			db.events.on('write', () => handlePeersUpdate());
			

			// Retrive a safe DID and upload it
			const DID_safe = DID;
			Object.keys(DID_safe).forEach(key => DID_safe[key] === undefined ? delete DID_safe[key] : {});
			await db.put(account, DID_safe);
			console.log(db.all);
		} catch (error) {
			console.error(error);
		}
	};

	const handlePeersUpdate = async () => {
		setPeers(db.all);
	};

	const handleFileEncryptAndUpload = async () => {
		const objFile = imageUpload.current.files[0];
		// First we create the file password
		const syncKey = window.crypto.randomUUID();
		const encryptedSyncKey = encrypt(syncKey, peers[selectedAddress].publicKey);
		// We read the file and store it
		const fileBytes = await readfile(objFile)
			.catch(function(err){
				console.error(err);
			});	
		
		const fileBytesArray = new Uint8Array(fileBytes);

		var pbkdf2iterations=10000;
		var passphrasebytes=new TextEncoder('utf-8').encode(syncKey);
		var pbkdf2salt=window.crypto.getRandomValues(new Uint8Array(8));


		var passphrasekey = await window.crypto.subtle.importKey('raw', passphrasebytes, {name: 'PBKDF2'}, false, ['deriveBits'])
			.catch(function(err){
				console.error(err);
			});
		console.log('passphrasekey imported');

		var pbkdf2bytes = await window.crypto.subtle.deriveBits({'name': 'PBKDF2', 'salt': pbkdf2salt, 'iterations': pbkdf2iterations, 'hash': 'SHA-256'}, passphrasekey, 384)		
			.catch(function(err){
				console.error(err);
			});
		console.log('pbkdf2bytes derived');
		pbkdf2bytes = new Uint8Array(pbkdf2bytes);

		const keybytes = pbkdf2bytes.slice(0,32);
		const ivbytes = pbkdf2bytes.slice(32);

		var key = await window.crypto.subtle.importKey('raw', keybytes, {name: 'AES-CBC', length: 256}, false, ['encrypt']) 
			.catch(function(err){
				console.error(err);
			});
		console.log('key imported');		

		var cipherbytes = await window.crypto.subtle.encrypt({name: 'AES-CBC', iv: ivbytes}, key, fileBytesArray)
			.catch(function(err){
				console.error(err);
			});

		console.log('plaintext encrypted');
		cipherbytes = new Uint8Array(cipherbytes);

		var resultbytes = new Uint8Array(cipherbytes.length+16);
		resultbytes.set(new TextEncoder('utf-8').encode('Salted__'));
		resultbytes.set(pbkdf2salt, 8);
		resultbytes.set(cipherbytes, 16);

		var blob = new Blob([resultbytes], {type: 'application/download'});
		var blobUrl=URL.createObjectURL(blob);

		console.log(encryptedSyncKey.toString('hex'), blobUrl);

	};

	// TODO: Delete buttons when connected to orbit db
	return (
		<>
			<Head>
				<title>Upload page</title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<Header />
			<div className='flex flex-col justify-center items-center gap-5 container mx-auto'>
				{!connectionActive && <h1 className='text-center text-4xl mt-3'>Connect to a database or create one to start sharing</h1>}
				<div className='flex flex-row gap-5 w-full justify-around'>
					{
						connectionActive
							?
							null
							:
							<>
								<input className="placeholder-blue-500 placeholder-opacity-50 rounded-3xl py-1 px-2 border border-indigo-500 focus:border-indigo-900 w-3/4"
									type="text"
									placeholder="Orbit DB address..."
									value={inputValue}
									onChange={handleInputChange} />
								<MainButton onClick={handleConnectToDatabase} text={'Connect to DB'} />
								<MainButton onClick={handleCreateDB} text={'Create DB'} />
							</>
					}
				</div>
				{address === '' ? null : <h1>Share this with your destination: <span className='font-bold'>{address}</span></h1>}
				{connectionActive && <h1 className='text-center text-4xl mt-3'>Select a peer</h1>}
				<div className='flex flex-row gap-5 overflow-x-auto'>
					{
						// Its a JSON, not an array so we do this
						Object.keys(peers).map(
							(k) => {
								return <h1
									onClick={() => {
										setSelectedAddress(peers[k].address);
									}}
									className={`rounded-lg px-4 py-2 transition-all ${selectedAddress === peers[k].address ? 'bg-blue-500 text-white cursor-not-allowed font-bold' : 'bg-blue-200 cursor-pointer hover:bg-blue-300'}`}
									key={peers[k].address}>
									{peers[k].did}
								</h1>;
							}
						)
					}
				</div>
				{
					connectionActive && selectedAddress !== ''
						?
						<div className='flex flex-col justify-center gap-5'>
							<input
								type="file"
								className="border-blue-500 border-2 p-2 px-5 rounded-xl text-xl"
								ref={imageUpload}
							/>
							<MainButton onClick={handleFileEncryptAndUpload} className={'hover:scale-110 transition-all'} text={'Upload'} />
						</div>
						:
						<div className='flex flex-col justify-center gap-5 w-0 overflow-hidden transition-all'>
							<input
								type="file"
								className="border-blue-500 border-2 p-2 px-5 rounded-xl text-xl"
								ref={imageUpload}
							/>
						</div>
				}
				
			</div>
		</>
	);
}