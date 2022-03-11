export function hexer(data) {
	return Buffer.from(data, 'utf8').toString('hex');
}