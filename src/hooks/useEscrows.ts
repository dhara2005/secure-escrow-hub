import { useState, useCallback } from 'react';
import { Escrow, EscrowStatus } from '@/types/escrow';

export const useEscrows = (userAddress: string | null) => {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [earnings, setEarnings] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  const clientEscrows = escrows.filter(
    (e) => e.employer.toLowerCase() === userAddress?.toLowerCase()
  );

  const freelancerEscrows = escrows.filter(
    (e) => e.employee.toLowerCase() === userAddress?.toLowerCase()
  );

  const createEscrow = useCallback(
    async (description: string, freelancerAddress: string, amount: string) => {
      setIsLoading(true);
      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const newEscrow: Escrow = {
        escrowId: escrows.length + 1,
        employer: userAddress!,
        employee: freelancerAddress,
        jobDesc: description,
        amount: (parseFloat(amount) * 1e18).toString(),
        status: EscrowStatus.Open,
        timestamp: Date.now(),
      };
      
      setEscrows((prev) => [newEscrow, ...prev]);
      setIsLoading(false);
      return newEscrow.escrowId;
    },
    [escrows.length, userAddress]
  );

  const acceptEscrow = useCallback(async (escrowId: number) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEscrows((prev) =>
      prev.map((e) =>
        e.escrowId === escrowId ? { ...e, status: EscrowStatus.InProgress } : e
      )
    );
    setIsLoading(false);
  }, []);

  const submitWork = useCallback(async (escrowId: number) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEscrows((prev) =>
      prev.map((e) =>
        e.escrowId === escrowId ? { ...e, status: EscrowStatus.Completed } : e
      )
    );
    setIsLoading(false);
  }, []);

  const approveAndRelease = useCallback(async (escrowId: number) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEscrows((prev) =>
      prev.map((e) =>
        e.escrowId === escrowId ? { ...e, status: EscrowStatus.Released } : e
      )
    );
    setIsLoading(false);
  }, []);

  const dispute = useCallback(async (escrowId: number) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEscrows((prev) =>
      prev.map((e) =>
        e.escrowId === escrowId ? { ...e, status: EscrowStatus.Disputed } : e
      )
    );
    setIsLoading(false);
  }, []);

  const cancelEscrow = useCallback(async (escrowId: number) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEscrows((prev) =>
      prev.map((e) =>
        e.escrowId === escrowId ? { ...e, status: EscrowStatus.Cancelled } : e
      )
    );
    setIsLoading(false);
  }, []);

  const withdrawEarnings = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setEarnings('0');
    setIsLoading(false);
  }, []);

  return {
    escrows,
    clientEscrows,
    freelancerEscrows,
    earnings,
    isLoading,
    createEscrow,
    acceptEscrow,
    submitWork,
    approveAndRelease,
    dispute,
    cancelEscrow,
    withdrawEarnings,
  };
};
