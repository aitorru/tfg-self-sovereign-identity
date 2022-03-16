import '../styles/globals.css';
import 'tailwindcss/tailwind.css';
import { Web3ReactProvider } from '@web3-react/core';
import Web3 from 'web3';
import React from 'react';
import { AppContextProvider } from '../context';
import { QueryClientProvider, QueryClient } from 'react-query';

export const UserContext = React.createContext();
const queryClient = new QueryClient();


function MyApp({ Component, pageProps }) {
	function getLibrary(provider) {
		const library = new Web3(provider);
		return library;
	}
	return <React.StrictMode>
		<QueryClientProvider client={queryClient} >
			<Web3ReactProvider getLibrary={getLibrary} libraryName={'web3.js'}>
				<AppContextProvider>
					<Component {...pageProps} />
				</AppContextProvider>
			</Web3ReactProvider>
		</QueryClientProvider>
	</React.StrictMode>;
}

export default MyApp;
