import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

export function hexer(data) {
	return Buffer.from(data, 'utf8').toString('hex');
}

export function encrypt(data, publicKey) {
	// generate ephemeral keypair
	const ephemeralKeyPair = nacl.box.keyPair();

	let pubKeyUInt8Array;
	try {
		pubKeyUInt8Array = naclUtil.decodeBase64(publicKey);
	} catch (err) {
		throw new Error('Bad public key');
	}

	const msgParamsUInt8Array = naclUtil.decodeUTF8(data);
	const nonce = nacl.randomBytes(nacl.box.nonceLength);

	// encrypt
	const encryptedMessage = nacl.box(
		msgParamsUInt8Array,
		nonce,
		pubKeyUInt8Array,
		ephemeralKeyPair.secretKey,
	);

	// handle encrypted data
	const output = {
		version: 'x25519-xsalsa20-poly1305',
		nonce: naclUtil.encodeBase64(nonce),
		ephemPublicKey: naclUtil.encodeBase64(ephemeralKeyPair.publicKey),
		ciphertext: naclUtil.encodeBase64(encryptedMessage),
	};
		// Convert it to a String for a hex convert
	const strigified = JSON.stringify(output);
	// Create a buffer and pass it to metamask
	const buffer = Buffer.from(strigified, 'utf8');
	return buffer;
}

