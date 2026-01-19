import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet, WalletType } from '@/context/WalletContext';
import { Loader2, ExternalLink } from 'lucide-react';

interface WalletOption {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
  downloadUrl: string;
}

const walletOptions: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'The most popular Web3 wallet',
    downloadUrl: 'https://metamask.io/download/',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Secure wallet by Coinbase',
    downloadUrl: 'https://www.coinbase.com/wallet',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Multi-chain crypto wallet',
    downloadUrl: 'https://trustwallet.com/',
  },
  {
    id: 'injected',
    name: 'Browser Wallet',
    icon: '🌐',
    description: 'Use any detected wallet',
    downloadUrl: '',
  },
];

interface WalletSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WalletSelectModal: React.FC<WalletSelectModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { connect, isConnecting } = useWallet();

  const handleConnect = async (walletType: WalletType) => {
    await connect(walletType);
    onOpenChange(false);
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text">Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect to SecureEscrow.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="w-full h-auto py-4 px-4 justify-between bg-secondary/30 border-border hover:border-primary/50 hover:bg-secondary/50 group"
              onClick={() => handleConnect(wallet.id)}
              disabled={isConnecting}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{wallet.icon}</span>
                <div className="text-left">
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {wallet.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {wallet.description}
                  </p>
                </div>
              </div>
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : wallet.downloadUrl ? (
                <ExternalLink
                  className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(wallet.downloadUrl);
                  }}
                />
              ) : null}
            </Button>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          By connecting, you agree to the platform's terms of service.
        </p>
      </DialogContent>
    </Dialog>
  );
};
