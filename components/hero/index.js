import MainButton from "../button";

export default function HeroSection() {
    return (
        <div className="container mx-auto">
            <div className="flex align-middle items-center justify-center h-auto md:h-96">
                <h1 className="text-6xl text-center font-black my-10 md:my-0">
                    SSI Login over the Selenium blockchain, using Next.js
                </h1>
            </div>
            <div className="container mx-auto">
                <div className="grid gap-4 grid-cols-2 align-middle items-center justify-center h-auto">
                    <MainButton className="w-auto md:w-full max-w-xl text-3xl shadow-lg hover:shadow-2xl transition-all" text="Try it out!" />
                    <a href="https://github.com/aitorru/tfg-self-sovereing-identity" target="_blank">
                        <MainButton className="w-auto md:w-full max-w-xl text-3xl shadow-lg hover:shadow-2xl transition-all" text="Github code" />
                    </a>
                </div>
            </div>
        </div>
    )
}