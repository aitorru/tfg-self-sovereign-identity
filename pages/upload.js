import { useWeb3React } from '@web3-react/core';
import Header from '../components/header';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import MainButton from '../components/button';
import useAppContext from '../context';
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');
let db = null;


export default function Upload() {
	const [ inputValue, setInputValue ] = useState('');
	const [ address, setAddress ] = useState('');
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
			const ipfsOptions = { repo : './ipfs', };
			const ipfs_local = await IPFS.create(ipfsOptions);
			setIpfs(ipfs_local);	
		}
		
	}, []);

	const handleCreateDB = async () => {
		if(db || !ipfs) return;
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
		// Update UI
		setAddress(db.address.toString());
		// Obtain DID from global context and upload it
		const DID_safe = DID;
		Object.keys(DID_safe).forEach(key => DID_safe[key] === undefined ? delete DID_safe[key] : {});
		await db.put(account, DID_safe);
		console.log('Uploaded');
	};
	const handleConnectToDatabase = async () => {
		if(!OrbitDB.isValidAddress(inputValue)) return;
		try {
			const orbitdb = await OrbitDB.createInstance(ipfs);
			// Connect to remote db
			db = await orbitdb.open(inputValue);
			// Replicate db in local storage
			await db.load();
			// Update UI
			setAddress(db.address.toString());
			db.events.on('replicated', (e) => {
				// any remote database content is now replicated to your IPFS node
				console.log(e);
			});
			const DID_safe = DID;
			Object.keys(DID_safe).forEach(key => DID_safe[key] === undefined ? delete DID_safe[key] : {});
			await db.put(account, DID_safe);
			console.log(db.all);
		} catch (error) {
			console.error(error);
		}
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
				<h1 className='text-center text-4xl mt-3'>Connect to a database or create one to start sharing</h1>
				<div className='flex flex-row gap-5 w-full justify-around'>
					<input className="placeholder-blue-500 placeholder-opacity-50 rounded-3xl py-1 px-2 border border-indigo-500 focus:border-indigo-900 w-3/4"
						type="text"
						placeholder="Orbit DB address..."
						value={inputValue}
						onChange={handleInputChange} />
					<MainButton onClick={handleConnectToDatabase} text={'Connect to DB'} />
					<MainButton onClick={handleCreateDB} text={'Create DB'} />
				</div>
				{address === '' ? null : <h1>Share this with your destination: {address}</h1>}
				<input className='text-center' type="file"></input>
			</div>
		</>
	);
}