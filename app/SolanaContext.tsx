import { ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css'

import { WalletConnectWalletAdapter } from '@walletconnect/solana-adapter'

export const SolanaContext = ({ children }: { children: ReactNode }) => {
	const endpoint = useMemo(() => clusterApiUrl(WalletAdapterNetwork.Devnet), [])

	const wallets = useMemo(
		() => [
			new WalletConnectWalletAdapter({
				network: WalletAdapterNetwork.Mainnet,
				options: {
					projectId: '0e8241f1eccb9d1bf01923357c060fad',
				},
			}),
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>
					{children}
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	)
}