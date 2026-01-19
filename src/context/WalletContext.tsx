import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BrowserProvider, formatEther, Eip1193Provider } from 'ethers';
import { WalletState } from '@/types/escrow';
import { toast } from 'sonner';

export type WalletType = 'metamask' | 'coinbase' | 'trust' | 'injected';

export interface NetworkInfo {
  chainId: number;
  name: string;
  isCorrect: boolean;
}

export interface SupportedNetwork {
  chainId: number;
  name: string;
  rpcUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorer: string;
}

// Configure your target network here - update this to match your deployed contract's network
export const TARGET_CHAIN_ID = 11155111; // Sepolia testnet (change to 1 for mainnet, 137 for Polygon, etc.)

export const SUPPORTED_NETWORKS: Record<number, SupportedNetwork> = {
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://etherscan.io',
  },
  11155111: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
    currency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    currency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://polygonscan.com',
  },
  80001: {
    chainId: 80001,
    name: 'Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    currency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://mumbai.polygonscan.com',
  },
};

interface WalletContextType {
  wallet: WalletState;
  walletType: WalletType | null;
  network: NetworkInfo | null;
  targetChainId: number;
  connect: (type?: WalletType) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  provider: BrowserProvider | null;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const getProvider = (type: WalletType): Eip1193Provider | null => {
  if (typeof window.ethereum === 'undefined') return null;
  
  if (window.ethereum.providers?.length) {
    switch (type) {
      case 'metamask':
        return window.ethereum.providers.find((p) => p.isMetaMask) || null;
      case 'coinbase':
        return window.ethereum.providers.find((p) => p.isCoinbaseWallet) || null;
      default:
        return window.ethereum.providers[0] || null;
    }
  }
  
  return window.ethereum;
};

const detectWalletType = (): WalletType | null => {
  if (typeof window.ethereum === 'undefined') return null;
  
  if (window.ethereum.isMetaMask) return 'metamask';
  if (window.ethereum.isCoinbaseWallet) return 'coinbase';
  if (window.ethereum.isTrust) return 'trust';
  
  return 'injected';
};

const getNetworkName = (chainId: number): string => {
  return SUPPORTED_NETWORKS[chainId]?.name || `Chain ${chainId}`;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    balance: '0',
  });
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const updateNetwork = useCallback(async (browserProvider: BrowserProvider) => {
    try {
      const network = await browserProvider.getNetwork();
      const chainId = Number(network.chainId);
      setNetwork({
        chainId,
        name: getNetworkName(chainId),
        isCorrect: chainId === TARGET_CHAIN_ID,
      });
    } catch (error) {
      console.error('Failed to get network:', error);
    }
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    if (typeof window.ethereum === 'undefined') return;

    const targetNetwork = SUPPORTED_NETWORKS[chainId];
    if (!targetNetwork) {
      toast.error('Unsupported network');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      toast.success(`Switched to ${targetNetwork.name}`);
    } catch (error: any) {
      // If the chain hasn't been added to the wallet
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: targetNetwork.name,
                rpcUrls: [targetNetwork.rpcUrl],
                nativeCurrency: targetNetwork.currency,
                blockExplorerUrls: [targetNetwork.blockExplorer],
              },
            ],
          });
          toast.success(`Added and switched to ${targetNetwork.name}`);
        } catch (addError) {
          toast.error('Failed to add network');
        }
      } else if (error.code === 4001) {
        toast.error('Network switch rejected');
      } else {
        toast.error('Failed to switch network');
      }
    }
  }, []);

  const connect = useCallback(async (type: WalletType = 'injected') => {
    setIsConnecting(true);
    
    const injectedProvider = getProvider(type);
    
    if (!injectedProvider) {
      toast.error('No wallet detected', {
        description: 'Please install a Web3 wallet like MetaMask, Coinbase Wallet, or Trust Wallet.',
      });
      setIsConnecting(false);
      return;
    }

    try {
      const browserProvider = new BrowserProvider(injectedProvider);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        toast.error('No accounts found');
        setIsConnecting(false);
        return;
      }

      const address = accounts[0];
      const balance = await browserProvider.getBalance(address);
      const formattedBalance = formatEther(balance);
      const detectedType = detectWalletType() || type;

      setProvider(browserProvider);
      setWalletType(detectedType);
      setWallet({
        address,
        isConnected: true,
        balance: parseFloat(formattedBalance).toFixed(4),
      });

      // Update network info
      await updateNetwork(browserProvider);

      toast.success('Wallet connected', {
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      if (error.code === 4001) {
        toast.error('Connection rejected', {
          description: 'You rejected the connection request.',
        });
      } else {
        toast.error('Connection failed', {
          description: error.message || 'Failed to connect wallet.',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [updateNetwork]);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      isConnected: false,
      balance: '0',
    });
    setProvider(null);
    setWalletType(null);
    setNetwork(null);
    toast.info('Wallet disconnected');
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined' || !window.ethereum.on) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (wallet.isConnected && accounts[0] !== wallet.address) {
        const injectedProvider = getProvider(walletType || 'injected');
        if (!injectedProvider) return;
        
        const browserProvider = new BrowserProvider(injectedProvider);
        const balance = await browserProvider.getBalance(accounts[0]);
        const formattedBalance = formatEther(balance);

        setProvider(browserProvider);
        setWallet({
          address: accounts[0],
          isConnected: true,
          balance: parseFloat(formattedBalance).toFixed(4),
        });

        toast.info('Account switched', {
          description: `Now using ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    };

    const handleChainChanged = async (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      setNetwork({
        chainId,
        name: getNetworkName(chainId),
        isCorrect: chainId === TARGET_CHAIN_ID,
      });

      if (chainId !== TARGET_CHAIN_ID) {
        toast.warning('Wrong network', {
          description: `Please switch to ${SUPPORTED_NETWORKS[TARGET_CHAIN_ID]?.name || 'the correct network'}`,
        });
      } else {
        toast.success(`Connected to ${getNetworkName(chainId)}`);
      }

      // Refresh balance on network change
      if (wallet.address && provider) {
        try {
          const balance = await provider.getBalance(wallet.address);
          setWallet((prev) => ({
            ...prev,
            balance: parseFloat(formatEther(balance)).toFixed(4),
          }));
        } catch (error) {
          console.error('Failed to refresh balance:', error);
        }
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [wallet.isConnected, wallet.address, walletType, disconnect, provider]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        walletType,
        network,
        targetChainId: TARGET_CHAIN_ID,
        connect,
        disconnect,
        switchNetwork,
        provider,
        isConnecting,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
