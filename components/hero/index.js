import MainButton from "../button";
import SeccondaryButton from "../seccondaryButton";

export default function HeroSection() {
    return (
        <div className="container mx-auto">
            <div className="flex align-middle items-center justify-center h-auto md:h-96">
                <h1 className="text-6xl text-center font-black my-10 md:my-0">
                    SSI Login over the Sovrin blockchain, using Next.js
                </h1>
            </div>
            <div className="container mx-auto">
                <div className="grid gap-4 md:grid-cols-2 md:grid-rows-1 grid-cols-1 grid-rows-2 align-middle items-center justify-center justify-items-center h-auto">
                    <MainButton className="w-11/12 hover:-translate-y-1 hover:scale-110 max-w-xl text-3xl shadow-lg  transition-all" text="Try it out!" />
                    <a className="flex align-middle items-center justify-center justify-items-center w-full" href="https://github.com/aitorru/tfg-self-sovereing-identity" target="_blank">
                        <SeccondaryButton className="w-11/12 hover:-translate-y-1 hover:scale-110 max-w-xl text-3xl shadow-lg transition-all" text="Github code" />
                    </a>
                </div>
            </div>
        </div>
    )
}