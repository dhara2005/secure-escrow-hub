import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WalletSelectModal } from './WalletSelectModal';
import { Wallet, Shield, Lock, Zap } from 'lucide-react';

export const ConnectWalletPrompt: React.FC = () => {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Hero Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl animate-pulse" />
          <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Shield className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="gradient-text">Secure Escrow</span>
            <br />
            <span className="text-foreground">for Freelancers</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Trustless payments powered by smart contracts. Create escrows, complete work, and get paid securely.
          </p>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-6 text-left">
          <div className="glass-card p-5 rounded-xl space-y-3">
            <div className="p-2 w-fit rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Funds Secured</h3>
            <p className="text-sm text-muted-foreground">
              Payments held in smart contract until work is approved
            </p>
          </div>
          <div className="glass-card p-5 rounded-xl space-y-3">
            <div className="p-2 w-fit rounded-lg bg-success/10">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <h3 className="font-semibold">Dispute Resolution</h3>
            <p className="text-sm text-muted-foreground">
              Fair dispute system with admin arbitration
            </p>
          </div>
          <div className="glass-card p-5 rounded-xl space-y-3">
            <div className="p-2 w-fit rounded-lg bg-warning/10">
              <Zap className="h-5 w-5 text-warning" />
            </div>
            <h3 className="font-semibold">Instant Payments</h3>
            <p className="text-sm text-muted-foreground">
              Withdraw earnings directly to your wallet anytime
            </p>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={() => setShowWalletModal(true)}
          size="lg"
          className="gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6 animate-pulse-glow"
        >
          <Wallet className="h-5 w-5" />
          Connect Wallet to Start
        </Button>

        {/* Supported Wallets */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Supported Wallets</p>
          <div className="flex items-center justify-center gap-4 text-2xl">
            <span title="MetaMask">🦊</span>
            <span title="Coinbase Wallet">🔵</span>
            <span title="Trust Wallet">🛡️</span>
            <span title="Other Web3 Wallets">🌐</span>
          </div>
        </div>
      </div>

      <WalletSelectModal open={showWalletModal} onOpenChange={setShowWalletModal} />
    </div>
  );
};
