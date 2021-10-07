import { useWeb3React } from '@web3-react/core'

export default function Login() {
    const web3React = useWeb3React();

    return (
        <div className="h-full min-h-screen flex flex-col justify-center">
            <div className="flex1">
                <div className="container mx-auto">
                    <div className="flex flex-col items-center w-full h-96 bg-gray-100 rounded-lg shadow-lg">
                        <h1>Login</h1>
                    </div>
                </div>
            </div>
        </div>

    )
}