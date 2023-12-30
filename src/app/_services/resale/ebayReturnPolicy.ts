interface EbayReturnPolicy {
  categoryTypes: Array<{ default: boolean, name: string }>;
  description: string;
  extendedHolidayReturnsOffered: boolean;
  internationalOverride: {
    returnMethod: string;
    returnPeriod: { unit: string, value: number };
    returnsAccepted: boolean;
    returnShippingCostPayer: string;
  };
  marketplaceId: string;
  name: string;
  refundMethod: string;
  restockingFeePercentage: string;
  returnInstructions: string;
  returnMethod: string;
  returnPeriod: { unit: string, value: number };
  returnsAccepted: boolean;
  returnShippingCostPayer: string;
}
