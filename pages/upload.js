import { useWeb3React } from '@web3-react/core';
import Header from '../components/header';
import { useState, useEffect, useRef } from 'react';
// import { useCallbackRef } from 'use-callback-ref';
import Head from 'next/head';
import MainButton from '../components/button';
import useAppContext from '../context';
import { encrypt, readfile } from '../utils';
import jsonInterface from '../contracts/artifacts/FileShareControl.json';
import { ipfsOptions } from '../utils/consts';
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');
const Contract = require('web3-eth-contract');
const ADDRESS = process.env.SMARTCONTRACTADDRESS || '0x00BAe29852b041B8612A35C8Cf6959CD480C7058';
var contract = undefined;


export default function Upload() {
	const [ address, setAddress ] = useState('');
	const [ connectionActive, setConnectionActive ] = useState(false);
	const [ rooms, setRooms ] = useState({});
	const [ peers, setPeers ] = useState({});
	const [ selectedAddress, setSelectedAddress ] = useState('');
	const [ requestedAddress, setRequestedAddress ] = useState('');
	const [ notifications, setNotifications ] = useState([]);
	const imageUpload = useRef();
	const { ipfs, setIpfs, DID, DB, setDB, OrbitDBidentity, setOrbitDBidentity } = useAppContext();
	const context = useWeb3React();
	const { account, library, active } = context;

	useEffect(() => {
		if(!active) return;
		// If contract is undefined initialize it 
		if(contract !== undefined) return;
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
			console.log(rooms);
			setRooms({...rooms});
		});
		contract.events.ProposalCreated(function(error, result) {
			if (error) {
				console.error(error);
				return;
			}
			if(result === null) {
				console.error('Result is null');
				return;
			}
			console.log(result);
			// Do the job
			// Check owner
			if(result.returnValues.owner !== account) return;
			// Check the presence in the array.
			const found = notifications.find(n => n.proposer === result.returnValues.proposer);
			// The data associated to the proposer will never change, so we don't need to update anything.
			if(found === undefined) {
				setNotifications([ ...notifications,{
					owner: result.returnValues.owner,
					proposer: result.returnValues.proposer,
					identity: result.returnValues.identity,
				}]);
			}
			
		});
		contract.events.ProposalAccepted(function(error, result) {
			if (error) console.log(error);
			if (result === null) {
				console.error('Result is null');
				return;
			}
			console.log(result, result.returnValues.proposer === account, account);
			// Do the job
			if(result.returnValues.proposer === account) handleConnectToPeerDatabase();

		});
	}, []);

	// Connect to IPFS
	useEffect(async () => {
		// Connect to ipfs
		if (!ipfs) {
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
		if (!ipfs) return;
		// Create identity https://github.com/orbitdb/orbit-db/blob/main/GUIDE.md#creating-an-identity
		const Identities = require('orbit-db-identity-provider');
		let options = { id: account };
		const identity = await Identities.createIdentity(options);
		console.log(identity);
		// Create instance
		// Mantain connection to pesist data
		const orbitdb = await OrbitDB.createInstance(ipfs, { identity });
		options = {
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
	const handleRequestToDatabase = async (owner, url) => {
		if (!OrbitDB.isValidAddress(url)) return;
		try {
			// Create identity
			const Identities = require('orbit-db-identity-provider');
			let options = { id: account };
			const identity = await Identities.createIdentity(options);
			setOrbitDBidentity(identity);
			//Update state
			setRequestedAddress(url);
			// Call smart contract. The identity must be a string and parsed later.
			contract.methods.createProposal(owner, JSON.stringify(identity)).send({ from: account, gasPrice: '20000000000' });
			
		} catch (error) {
			console.error(error);
		}
	};
	// eslint-disable-next-line no-unused-vars
	const handleAcceptRequestToDatabase = async (identity, proposer) => {
		// Grant access to existing db.
		await DB.access.grant('write', identity.publicKey);
		// Contact smart contract
		contract.methods.acceptProposal(proposer).send({ from: account, gasPrice: '20000000000' });
		// Remove the notification
		console.log(proposer, notifications);
		const newNotificationsFiltered = notifications.map(n => {
			console.log(n);
			if (n.proposer !== proposer) {
				return n;
			}
		});
		// FIXME: Being empty cause the array to be undefined, while the scpread operator causes it to render an undefined [0] index.
		console.log(newNotificationsFiltered);
		if (newNotificationsFiltered !== undefined) {
			setNotifications([...newNotificationsFiltered]);
		} else {
			setNotifications([]);
		}
	};
	// eslint-disable-next-line no-unused-vars
	const handleConnectToPeerDatabase = async () => {
		// FIXME: ipfs is false (?)
		if(!ipfs) return;
		// Create instance
		const orbitdb = await OrbitDB.createInstance(ipfs, { identity: OrbitDBidentity });
		// Connect to remote db
		const db = await orbitdb.open(requestedAddress);
		setDB(db);
		// Replicate db in local storage
		await db.load();
		// Change UI after connection
		setConnectionActive(true);
		// Update UI
		setRequestedAddress('');
		// Update UI
		setAddress(db.address.toString());
		// Retrive a safe DID and upload it
		const DID_safe = DID;
		Object.keys(DID_safe).forEach((key) =>
			DID_safe[key] === undefined ? delete DID_safe[key] : {}
		);
		await db.put(account, DID_safe);
	};

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
			<div className="container flex flex-col items-center justify-center mx-auto gap-5">
				{!connectionActive && (
					<>
						<h1 className='text-4xl'>Existing rooms</h1>
						<div className='flex flex-row flex-wrap justify-center'>
							{
								Object.keys(rooms).map((r) => {
									if(r.owner === account) return null;
									return (
										<p 
											className='px-4 py-2 bg-blue-200 rounded-lg cursor-pointer transition-all hover:bg-blue-300'
											key={rooms[r].owner}
											onClick={() => handleRequestToDatabase(rooms[r].owner, rooms[r].url)}
										>
											{rooms[r].owner}
										</p>
									);
								})
							}
						</div>
						{
							requestedAddress &&
							<p>Attemting to connect to {requestedAddress}</p>
						}
						<h1 className='text-3xl'>Connect to one or just create a room</h1>
						<div className="flex flex-row justify-around w-full gap-5">
							<MainButton onClick={handleCreateDB} text={'Create room'} />
						</div>
					</>
				)}
				{address && <h1>Connected to {address}</h1>}
				{connectionActive && (
					<h1 className="mt-3 text-4xl text-center">Select a peer</h1>
				)}
				<div className="flex flex-row overflow-x-auto gap-5">
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
							className="p-2 px-5 text-xl border-2 border-blue-500 rounded-xl"
							ref={imageUpload}
						/>
						<MainButton
							onClick={handleFileEncryptAndUpload}
							className={'hover:scale-110 transition-all'}
							text={'Upload'}
						/>
					</div>
				) : (
					<div className="flex flex-col justify-center h-0 overflow-hidden gap-5 transition-all">
						<input
							type="file"
							className="p-2 px-5 text-xl border-2 border-blue-500 rounded-xl"
							ref={imageUpload}
						/>
					</div>
				)}
				{connectionActive && (
					<h1 className="mt-3 text-4xl text-center">Download zone</h1>
				)}
				<div className="flex flex-row overflow-x-auto gap-5">
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
									className="px-4 py-2 bg-blue-200 rounded-lg cursor-pointer transition-all hover:bg-blue-300"
									key={peers[k].ipfsFile.path}>
									{peers[k].fileName}
								</h1>
							);
						})
					}
				</div>
			</div>
			<div className='absolute flex flex-col-reverse items-end bottom-2 gap-5 right-2'>
				{
					// eslint-disable-next-line no-unused-vars
					notifications.map(i => {
						return (
							<div key={i.proposer} className='relative flex flex-col p-5 cursor-default bg-slate-300 rounded-xl w-fit transition-all'>
								<h1 className=''>Would you like to accept<br></br>
									<span className='overflow-hidden text-xs truncate hover:text-base transition-all'>{i.proposer}</span>
									<br></br> to the room?</h1>
								<div className='flex flex-row gap-5'>
									<button className='flex-grow p-2 bg-blue-400 rounded-lg' onClick={() => handleAcceptRequestToDatabase(i.identity, i.proposer)}>ye</button>
									<button className='flex-grow p-2 bg-blue-400 rounded-lg'>na</button>
								</div>
							</div>
						);
					}
					)
				}
			</div>
		</>
	);
}
