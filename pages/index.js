import Header from "../components/header";
import HeroSection from "../components/hero";
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>TFG self sovering identity</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Header />
      <HeroSection />
    </>
  )
}
