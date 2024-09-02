import { useChain } from '@cosmos-kit/react';
import { getSigningOsmosisClient, osmosis } from '@orchestra_labs/symphonyjs';
import { Coin } from '@cosmjs/amino';
import { useToast } from '@/hooks/useToast';
import { DeliverTxResponse, isDeliverTxSuccess } from '@cosmjs/stargate';

const { swapSend } = osmosis.market.v1beta1.MessageComposer.withTypeUrl;

export const useSwapTx = (chainName: string) => {
  const {
    address: signerAddress,
    isWalletConnected,
    getRpcEndpoint,
    getOfflineSignerAmino,
  } = useChain(chainName);
  const { toast } = useToast();

  const swapTx = async (
    fromAddress: string,
    toAddress: string,
    offerCoin: Coin,
    askDenom: string,
  ) => {
    if (!fromAddress || !toAddress || !offerCoin || !askDenom) {
      toast({
        title: 'Swap Failed!',
        description: 'Please fill in all the required fields',
      });

      return;
    }

    if (!isWalletConnected || !signerAddress) {
      toast({
        title: 'Swap Failed!',
        description: 'Please connect a wallet',
      });

      return;
    }
    try {
      const client = await getSigningOsmosisClient({
        rpcEndpoint: await getRpcEndpoint(),
        signer: getOfflineSignerAmino(),
      });

      const swapMsg = swapSend({
        fromAddress,
        toAddress,
        offerCoin,
        askDenom,
      });

      // const estimatedFee = await estimateFee([swapMsg]);

      const txToastProgress = toast({
        title: 'Swap in Progress',
        description: 'Waiting for transaction to be included in the block',
      });

      client
        .signAndBroadcast(signerAddress!, [swapMsg], {
          amount: [{ denom: 'note', amount: '1000000' }],
          gas: '100000',
        })
        .then((response: DeliverTxResponse) => {
          txToastProgress.dismiss();
          if (isDeliverTxSuccess(response)) {
            toast({
              title: 'Swap Successful!',
              description: `Transaction ${response.transactionHash} has been included in the block, gas used $note: ${response.gasUsed}`,
            });
          } else {
            toast({
              title: 'Swap Failed!',
              description: `Transaction ${response.transactionHash} failed to be included in the block, error: ${response.rawLog}`,
            });
          }
        });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Swap Failed!',
          description: error.message ?? 'An unexpected error has occured',
        });
      }
    }
  };

  return {
    swapTx,
  };
};
