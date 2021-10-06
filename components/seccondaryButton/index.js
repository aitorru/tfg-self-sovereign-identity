export default function SeccondaryButton({ text, className }) {
    return (
        <button className={`rounded-lg bg-gray-200 text-black px-4 py-2 shadow-mdtransition-all ${className}`}>{text}</button>
    )
}