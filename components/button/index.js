export default function MainButton({ text, className, onClick }) {
    return (
        <button className={`rounded-lg bg-blue-500 text-white px-4 py-2 shadow-mdtransition-all ${className}`} onClick={onClick}>{text}</button>
    )
}