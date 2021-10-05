import MainButton from "../button";

export default function Header() {
    return (
        <div className="border-b-2">
            <div className="container mx-auto p-4">
                <div className="flex align-middle justify-around">
                    <h1 className="text-center text-3xl">TFG self sovering identity</h1>
                    <MainButton text="Login" />
                </div>
            </div>
        </div>

    )
}