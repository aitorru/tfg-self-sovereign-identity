import { useWeb3React } from '@web3-react/core';
import Header from '../components/header';
import { useState, useEffect, useRef } from 'react';
// import { useCallbackRef } from 'use-callback-ref';
import Head from 'next/head';
import MainButton from '../components/button';
import useAppContext from '../context';
import { encrypt, readfile } from '../utils';
import jsonInterface from '../contracts/artifacts/FileShareControl.json';
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');
const Contract = require('web3-eth-contract');
const ADDRESS = '0x860e75587B7Ac9d713E232B90913E6fC11638E98';
var contract = undefined;


export default function Upload() {
	const [ address, setAddress ] = useState('');
	const [ connectionActive, setConnectionActive ] = useState(false);
	// 😵‍💫🤞 https://stackoverflow.com/questions/66670473/usestate-not-re-rendering-component-if-it-is-called-inside-callback-function
	// const [,forceUpdate] = useState();
	// const peers = useCallbackRef({}, () => forceUpdate());
	const [ rooms, setRooms ] = useState({});
	const [ peers, setPeers ] = useState({});
	const [ selectedAddress, setSelectedAddress ] = useState('');
	const imageUpload = useRef();
	const { ipfs, setIpfs, DID, DB, setDB } = useAppContext();
	const context = useWeb3React();
	const { account, library, active } = context;

	useEffect(() => {
		if(!active) return;
		// Initialize the contract
		Contract.setProvider(library);
		// Create contract
		contract = new Contract(jsonInterface['abi'], ADDRESS);

		contract.events.RoomCreated(function(error, result) {
			if (error) {
				console.error(error);
				return;
			}
			if(result === null) {
				console.error('Result is null');
				return;
			}
			const returnValues = result.returnValues;
			const found = Object.keys(rooms).find((r) => returnValues.owner === r);
			if (found !== undefined) {
				rooms[returnValues.owner].url = returnValues.url;
			} else {
				rooms[returnValues.owner] = {
					owner: returnValues.owner,
					url: returnValues.url
				};
			}
			setRooms({...rooms});
		});
		contract.events.ProposalCreated(function(error, result) {
			if (!error)console.log(result);
		});
		contract.events.ProposalAccepted(function(error, result) {
			if (!error)console.log(result);
		});
	}, []);

	// Connect to IPFS
	useEffect(async () => {
		// Connect to ipfs
		if (!ipfs) {
			const ipfsOptions = {
				repo: '/ipfs/tfg',
				gategay: '/ip4/127.0.0.1/tcp/5001',
				start: true,
				EXPERIMENTAL: {
					pubsub: true,
				},
				config: {
					Addresses: {
						Swarm: [
							'/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/',
							'/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/QmZzX9T7h1uVy7HgePamnSE9tocAMMXxE9jq3iXkZ7izBB',
							'/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/QmZzX9T7h1uVy7HgePamnSE9tocAMMXxE9jq3iXkZ7izBB',
							'/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/p2p/QmZzX9T7h1uVy7HgePamnSE9tocAMMXxE9jq3iXkZ7izBB',
							'/ip4/0.0.0.0/tcp/4001',
							'/ip6/::/tcp/4001',
							'/ip4/0.0.0.0/udp/4001/quic',
							'/ip6/::/udp/4001/quic',
						],
					},
				},
			};
			const ipfs_local = await IPFS.create(ipfsOptions);

			setIpfs(ipfs_local);
		}
	}, []);

	useEffect(() => {
		if (!DB) return;
		// When the database is ready (ie. loaded), display results
		DB.events.on('ready', () => {
			setPeers({ ...DB.all });
		});
		// When database gets replicated with a peer, display results
		DB.events.on('replicated', () => {
			/**
       * https://blog.logrocket.com/how-when-to-force-react-component-re-render/
       * React evaluates state changes by checking its shallow equality (or reference
       * equality), which checks to see if both the preview and new value for state
       * reference the same object. In our example, we updated one of the properties of the
       * user object, but we technically made setUser the same object reference, and
       * thus, React didn’t perceive any change in its state.
       *
       * https://reactjs.org/docs/react-component.html#state
       */
			setPeers({ ...DB.all });
		});
		// When we update the database, display result
		DB.events.on('write', () => {
			setPeers({ ...DB.all });
		});
	}, [DB]);

	const handleCreateDB = async () => {
		// TODO: Announce room creation using the smart contract
		if (!ipfs) return;

		// Create instance
		// Mantain connection to pesist data
		const orbitdb = await OrbitDB.createInstance(ipfs);
		const options = {
			// Give write access to yourself at first
			accessController: {
				write: [
					orbitdb.identity.id,
				],
			},
		};

		// Create key value db
		const db = await orbitdb.keyvalue(account, options);
		setDB(db);
		// Replicate db in local storage
		await db.load();
		// Change UI after connection
		setConnectionActive(true);
		// Update UI
		setAddress(db.address.toString());
		// Call smart contract
		contract.methods.createRoom(db.address.toString()).send({ from: account, gasPrice: '20000000000' });
		// Obtain DID from global context and upload it
		const DID_safe = DID;
		Object.keys(DID_safe).forEach((key) =>
			DID_safe[key] === undefined ? delete DID_safe[key] : {}
		);
		await db.put(account, DID_safe);
		console.log('Uploaded');
	};
	// const handleConnectToDatabase = async () => {
	// 	if (!OrbitDB.isValidAddress(inputValue)) return;
	// 	try {
	// 		// Create instance
	// 		const orbitdb = await OrbitDB.createInstance(ipfs);
	// 		// Connect to remote db
	// 		const db = await orbitdb.open(inputValue);
	// 		setDB(db);
	// 		// Replicate db in local storage
	// 		await db.load();
	// 		// Change UI after connection
	// 		setConnectionActive(true);
	// 		// Update UI
	// 		setAddress(db.address.toString());
	// 		// Retrive a safe DID and upload it
	// 		const DID_safe = DID;
	// 		Object.keys(DID_safe).forEach((key) =>
	// 			DID_safe[key] === undefined ? delete DID_safe[key] : {}
	// 		);
	// 		await db.put(account, DID_safe);
	// 	} catch (error) {
	// 		console.error(error);
	// 	}
	// };

	const handleFileEncryptAndUpload = async () => {
		const objFile = imageUpload.current.files[0];
		// First we create the file password
		const syncKey = window.crypto.randomUUID();
		const encryptedSyncKey = encrypt(syncKey, peers[selectedAddress].publicKey);
		// We read the file and store it
		const fileBytes = await readfile(objFile).catch(function (err) {
			console.error(err);
		});

		const fileBytesArray = new Uint8Array(fileBytes);

		var pbkdf2iterations = 10000;
		// Use the sync Key for file encryption
		var passphrasebytes = new TextEncoder('utf-8').encode(syncKey);
		var pbkdf2salt = window.crypto.getRandomValues(new Uint8Array(8));

		var passphrasekey = await window.crypto.subtle
			.importKey('raw', passphrasebytes, { name: 'PBKDF2' }, false, [
				'deriveBits',
			])
			.catch(function (err) {
				console.error(err);
			});
		console.log('passphrasekey imported');

		var pbkdf2bytes = await window.crypto.subtle
			.deriveBits(
				{
					name: 'PBKDF2',
					salt: pbkdf2salt,
					iterations: pbkdf2iterations,
					hash: 'SHA-256',
				},
				passphrasekey,
				384
			)
			.catch(function (err) {
				console.error(err);
			});
		console.log('pbkdf2bytes derived');
		pbkdf2bytes = new Uint8Array(pbkdf2bytes);

		const keybytes = pbkdf2bytes.slice(0, 32);
		const ivbytes = pbkdf2bytes.slice(32);

		var key = await window.crypto.subtle
			.importKey('raw', keybytes, { name: 'AES-CBC', length: 256 }, false, [
				'encrypt',
			])
			.catch(function (err) {
				console.error(err);
			});
		console.log('key imported');

		var cipherbytes = await window.crypto.subtle
			.encrypt({ name: 'AES-CBC', iv: ivbytes }, key, fileBytesArray)
			.catch(function (err) {
				console.error(err);
			});

		console.log('plaintext encrypted');
		cipherbytes = new Uint8Array(cipherbytes);

		var resultbytes = new Uint8Array(cipherbytes.length + 16);
		resultbytes.set(new TextEncoder('utf-8').encode('Salted__'));
		resultbytes.set(pbkdf2salt, 8);
		resultbytes.set(cipherbytes, 16);

		const file = await ipfs.add({ content: resultbytes });
		const payload = {
			ipfsFile: file, // It might contain undefined
			hexOfSyncKey: encryptedSyncKey.toString('hex'),
			fileName: objFile.name,
		};
		Object.keys(payload.ipfsFile).forEach((key) =>
			payload.ipfsFile[key] === undefined ? delete payload.ipfsFile[key] : {}
		);
		console.log(payload);
		await DB.put(
			'to' + selectedAddress + '-' + window.crypto.randomUUID(),
			payload
		);
	};

	const handleFileDownload = async (file, hexToDecrypt, fileName) => {
		const syncKey = await window.ethereum.request({
			method: 'eth_decrypt',
			params: [hexToDecrypt, account],
		});
		console.log(syncKey);
		const stream = ipfs.cat(file.path);
		let data = new Uint8Array();

		for await (const chunk of stream) {
			// chunks of data are returned as a Buffer, convert it back to a string
			data = new Uint8Array([...data, ...chunk]);
		}
		console.log(data);
		var cipherbytes = data;
		var pbkdf2iterations = 10000;
		var passphrasebytes = new TextEncoder('utf-8').encode(syncKey);
		var pbkdf2salt = cipherbytes.slice(8, 16);

		var passphrasekey = await window.crypto.subtle
			.importKey('raw', passphrasebytes, { name: 'PBKDF2' }, false, [
				'deriveBits',
			])
			.catch(function (err) {
				console.error(err);
			});
		console.log('passphrasekey imported');

		var pbkdf2bytes = await window.crypto.subtle
			.deriveBits(
				{
					name: 'PBKDF2',
					salt: pbkdf2salt,
					iterations: pbkdf2iterations,
					hash: 'SHA-256',
				},
				passphrasekey,
				384
			)
			.catch(function (err) {
				console.error(err);
			});
		console.log('pbkdf2bytes derived');
		pbkdf2bytes = new Uint8Array(pbkdf2bytes);

		let keybytes = pbkdf2bytes.slice(0, 32);
		let ivbytes = pbkdf2bytes.slice(32);
		cipherbytes = cipherbytes.slice(16);

		var key = await window.crypto.subtle
			.importKey('raw', keybytes, { name: 'AES-CBC', length: 256 }, false, [
				'decrypt',
			])
			.catch(function (err) {
				console.error(err);
			});
		console.log('key imported');

		var plaintextbytes = await window.crypto.subtle
			.decrypt({ name: 'AES-CBC', iv: ivbytes }, key, cipherbytes)
			.catch(function (err) {
				console.error(err);
			});
		console.log('ciphertext decrypted');
		plaintextbytes = new Uint8Array(plaintextbytes);

		var blob = new Blob([plaintextbytes], { type: 'application/download' });
		var blobUrl = URL.createObjectURL(blob);
		console.log(blobUrl);
		var FileSaver = require('file-saver');
		FileSaver.saveAs(blobUrl, fileName);
	};

	// TODO: Delete buttons when connected to orbit db
	return (
		<>
			<Head>
				<title>Upload page</title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<Header />
			<div className="flex flex-col justify-center items-center gap-5 container mx-auto">
				{!connectionActive && (
					<h1 className="text-center text-4xl mt-3">
            Connect to a database or create one to start sharing
					</h1>
				)}
				{!connectionActive && (
					<>
						<h1>Connect to a existing room</h1>
						<div className="flex flex-row gap-5 w-full justify-around">
						
							
							<MainButton onClick={handleCreateDB} text={'Create DB'} />
						</div>
					</>
				)}
				{
					Object.keys(rooms).map((r) => {
						return (
							<p key={r.owner}>{rooms[r].owner}</p>
						);
					})
				}
				{connectionActive && (
					<h1 className="text-center text-4xl mt-3">Select a peer</h1>
				)}
				<div className="flex flex-row gap-5 overflow-x-auto">
					{
						// Its a JSON, not an array so we do this
						Object.keys(peers).map((k) => {
							if (!k.startsWith('0x')) return null;
							return (
								<h1
									onClick={() => {
										setSelectedAddress(peers[k].address);
									}}
									className={`rounded-lg px-4 py-2 transition-all ${
										selectedAddress === peers[k].address
											? 'bg-blue-500 text-white cursor-not-allowed font-bold'
											: 'bg-blue-200 cursor-pointer hover:bg-blue-300'
									}`}
									key={peers[k].address}>
									{peers[k].did}
								</h1>
							);
						})
					}
				</div>
				{connectionActive && selectedAddress !== '' ? (
					<div className="flex flex-col justify-center gap-5">
						<input
							type="file"
							className="border-blue-500 border-2 p-2 px-5 rounded-xl text-xl"
							ref={imageUpload}
						/>
						<MainButton
							onClick={handleFileEncryptAndUpload}
							className={'hover:scale-110 transition-all'}
							text={'Upload'}
						/>
					</div>
				) : (
					<div className="flex flex-col justify-center gap-5 h-0 overflow-hidden transition-all">
						<input
							type="file"
							className="border-blue-500 border-2 p-2 px-5 rounded-xl text-xl"
							ref={imageUpload}
						/>
					</div>
				)}
				{connectionActive && (
					<h1 className="text-center text-4xl mt-3">Download zone</h1>
				)}
				<div className="flex flex-row gap-5 overflow-x-auto">
					{
						// Its a JSON, not an array so we do this
						Object.keys(peers).map((k) => {
							if (!k.startsWith('to')) return null;
							if (!k.startsWith('to' + account)) return null;
							return (
								<h1
									onClick={() => {
										handleFileDownload(
											peers[k].ipfsFile,
											peers[k].hexOfSyncKey,
											peers[k].fileName
										);
									}}
									className="rounded-lg px-4 py-2 transition-all bg-blue-200 cursor-pointer hover:bg-blue-300"
									key={peers[k].ipfsFile.path}>
									{peers[k].fileName}
								</h1>
							);
						})
					}
				</div>
			</div>
		</>
	);
}
