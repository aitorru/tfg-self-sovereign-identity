import { useWeb3React } from '@web3-react/core';
import MainButton from '../button';
import Link from 'next/link';

export default function Header() {
	const context = useWeb3React();
	const { active } = context;
	return (
		<div className="border-b-2">
			<div className="container mx-auto p-4">
				<div className="flex align-middle justify-around">
					<h1 className="text-center text-3xl">TFG self sovering identity</h1>
					{active 
						? 
						<span className="animate-pulse inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-green-700 self-center"></span>
						:
						<Link href="/login" passHref>
							<a>
								<MainButton text="Login" />
							</a>
						</Link>
					}
					
				</div>
			</div>
		</div>

	);
}