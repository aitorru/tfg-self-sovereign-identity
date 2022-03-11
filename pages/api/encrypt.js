// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';

export default (req, res) => {
	if(!req.body.publicKey || !req.body.data) {
		res.status(500).json({payload: 'Key or data not present', sent: req.body});
		return;
	}
	const { publicKey, data } = req.body;
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

	const strigified = JSON.stringify(output);

	const buffer = Buffer.from(strigified, 'utf8');


	res.status(200).json({ payload: buffer.toString('hex') });
};
