import MainButton from '../button';
import SeccondaryButton from '../seccondaryButton';
import Link from 'next/link';

export default function HeroSection() {
	return (
		<div className="container mx-auto">
			<div className="flex align-middle items-center justify-center h-auto md:h-96">
				<h1 className="text-7xl text-center font-semibold my-10 md:my-0">
                    SSI Login over the Ethereum blockchain, using Next.js
				</h1>
			</div>
			<div className="container mx-auto">
				<div className="grid gap-4 md:grid-cols-2 md:grid-rows-1 grid-cols-1 grid-rows-2 align-middle items-center justify-center justify-items-center h-auto">
					<Link  href="/login" passHref>
						<a className='w-full'>
							<MainButton className="w-11/12 hover:-translate-y-1 hover:scale-105 max-w-xl text-3xl shadow-lg transition-all shadow-blue-500/50" text="Try it out!" />
						</a>
					</Link>
					
					<a className="flex align-middle items-center justify-center justify-items-center w-full" href="https://github.com/aitorru/tfg-self-sovereing-identity" target="_blank" rel="noreferrer">
						<SeccondaryButton className="w-11/12 hover:-translate-y-1 hover:scale-105 max-w-xl text-3xl shadow-lg transition-all" text="Github code" />
					</a>
				</div>
			</div>
		</div>
	);
}