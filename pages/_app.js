import '../styles/globals.css'
import 'tailwindcss/tailwind.css'
import { Web3ReactProvider } from '@web3-react/core'
var Web3 = require('web3');

function MyApp({ Component, pageProps }) {
  function getLibrary(provider) {
    const library = new Web3(provider);
    return library
  }
  return <Web3ReactProvider getLibrary={getLibrary}><Component {...pageProps} /></Web3ReactProvider>
}

export default MyApp
