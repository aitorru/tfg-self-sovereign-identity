import '../styles/globals.css'
import 'tailwindcss/tailwind.css'
import { Web3ReactProvider } from '@web3-react/core'

function MyApp({ Component, pageProps }) {
  function getLibrary(provider, connector) {
    return new Web3Provider(provider) // this will vary according to whether you use e.g. ethers or web3.js
  }
  return <Web3ReactProvider getLibrary={getLibrary}><Component {...pageProps} /></Web3ReactProvider>
}

export default MyApp
