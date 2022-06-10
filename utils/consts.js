const ipfsOptions = {
	repo: '/ipfs/tfg',
	gategay: '/ip4/127.0.0.1/tcp/5001',
	start: true,
	EXPERIMENTAL: {
		pubsub: true,
	},
	config: {
		Addresses: {
			Swarm: [
				'/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/',
				'/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/QmZzX9T7h1uVy7HgePamnSE9tocAMMXxE9jq3iXkZ7izBB',
				'/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/QmZzX9T7h1uVy7HgePamnSE9tocAMMXxE9jq3iXkZ7izBB',
				'/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/p2p/QmZzX9T7h1uVy7HgePamnSE9tocAMMXxE9jq3iXkZ7izBB',
				'/ip4/0.0.0.0/tcp/4001',
				'/ip6/::/tcp/4001',
				'/ip4/0.0.0.0/udp/4001/quic',
				'/ip6/::/udp/4001/quic',
			],
		},
	},
};

export {
	ipfsOptions,
};