import '../styles/globals.css';
import 'tailwindcss/tailwind.css';
import { Web3ReactProvider } from '@web3-react/core';
import Web3 from 'web3';

function MyApp({ Component, pageProps }) {
	function getLibrary(provider) {
		const library = new Web3(provider);
		return library;
	}
	return <Web3ReactProvider getLibrary={getLibrary} libraryName={'web3.js'}><Component {...pageProps} /></Web3ReactProvider>;
}

export default MyApp;
