import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useWallet, SUPPORTED_NETWORKS, NetworkInfo } from '@/context/WalletContext';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const NetworkWarning: React.FC = () => {
  const { network, switchNetwork, targetChainId } = useWallet();

  if (!network || network.isCorrect) return null;

  const targetNetwork = SUPPORTED_NETWORKS[targetChainId];

  const handleSwitch = async () => {
    await switchNetwork(targetChainId);
  };

  return (
    <Alert variant="destructive" className="border-warning/50 bg-warning/10 mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Wrong Network</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span>
          You're connected to <strong>{network.name}</strong>. Please switch to{' '}
          <strong>{targetNetwork?.name || 'the correct network'}</strong> to use this app.
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSwitch}
          className="gap-2 border-warning text-warning hover:bg-warning/20 w-fit"
        >
          <RefreshCw className="h-3 w-3" />
          Switch Network
        </Button>
      </AlertDescription>
    </Alert>
  );
};
