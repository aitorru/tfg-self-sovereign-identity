import { useWeb3React } from '@web3-react/core';
import MainButton from '../button';

export default function UploadPlatform ({ connectionActive, inputValue, handleInputChange, handleConnectToDatabase, handleCreateDB, address, peers, setSelectedAddress, selectedAddress, imageUpload, handleFileEncryptAndUpload, handleFileDownload }) {
	const context = useWeb3React();
	const { account } = context;

	return (
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
							if(!k.startsWith('0x')) return null;
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
			{connectionActive && <h1 className='text-center text-4xl mt-3'>Download zone</h1>}
			<div className='flex flex-row gap-5 overflow-x-auto'>
				{
					// Its a JSON, not an array so we do this
					Object.keys(peers).map(
						(k) => {
							if(!k.startsWith('to')) return null;
							if(!k.startsWith('to' + account)) return null;
							return <h1
								onClick={() => {
									handleFileDownload(peers[k].ipfsFile, peers[k].hexOfSyncKey, peers[k].fileName);
								}}
								className='rounded-lg px-4 py-2 transition-all bg-blue-200 cursor-pointer hover:bg-blue-300'
								key={peers[k].ipfsFile.path}>
								{peers[k].fileName}
							</h1>;
						}
					)
				}
			</div>
		</div>
	);
}