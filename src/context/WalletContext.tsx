import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import { WalletState } from '@/types/escrow';
import { toast } from 'sonner';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

interface WalletContextType {
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  provider: BrowserProvider | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    balance: '0',
  });
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask not detected', {
        description: 'Please install MetaMask to connect your wallet.',
      });
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        toast.error('No accounts found');
        return;
      }

      const address = accounts[0];
      const balance = await browserProvider.getBalance(address);
      const formattedBalance = formatEther(balance);

      setProvider(browserProvider);
      setWallet({
        address,
        isConnected: true,
        balance: parseFloat(formattedBalance).toFixed(4),
      });

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
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      isConnected: false,
      balance: '0',
    });
    setProvider(null);
    toast.info('Wallet disconnected');
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (wallet.isConnected && accounts[0] !== wallet.address) {
        // Account switched
        const browserProvider = new BrowserProvider(window.ethereum!);
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

    const handleChainChanged = () => {
      // Reload the page on chain change as recommended by MetaMask
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [wallet.isConnected, wallet.address, disconnect]);

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect, provider }}>
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
