import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/context/WalletContext';
import { WalletSelectModal } from './WalletSelectModal';
import { NetworkWarning } from './NetworkWarning';
import { Wallet, LogOut, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { wallet, disconnect, network, walletType } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = () => {
    switch (walletType) {
      case 'metamask':
        return '🦊';
      case 'coinbase':
        return '🔵';
      case 'trust':
        return '🛡️';
      default:
        return '🌐';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-primary">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">SecureEscrow</h1>
              <p className="text-xs text-muted-foreground">Trustless Payments</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {wallet.isConnected ? (
              <div className="flex items-center gap-3">
                {/* Network indicator */}
                {network && (
                  <div
                    className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                      network.isCorrect
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-warning/10 text-warning border border-warning/20'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        network.isCorrect ? 'bg-success' : 'bg-warning animate-pulse'
                      }`}
                    />
                    {network.name}
                  </div>
                )}

                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium font-mono flex items-center gap-1.5">
                    <span>{getWalletIcon()}</span>
                    {truncateAddress(wallet.address!)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {wallet.balance} ETH
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Disconnect</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowWalletModal(true)}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold animate-pulse-glow"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      {wallet.isConnected && network && !network.isCorrect && (
        <div className="container pt-4">
          <NetworkWarning />
        </div>
      )}

      <WalletSelectModal open={showWalletModal} onOpenChange={setShowWalletModal} />
    </>
  );
};
