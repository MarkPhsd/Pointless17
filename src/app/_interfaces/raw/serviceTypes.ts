// Generated by https://quicktype.io
// Generated by https://quicktype.io

export interface IServiceType {
  id:                    number;
  name:                  string;
  description           :string;
  positiveNegative:      number;
  isRegisterTransaction: boolean;
  taxItems:              boolean;
  showOrderType:         boolean;
  retailServiceType:     number;
  managerRequired:       number;
  showTipOption:         number;
  printerName:           string;
  icon       :           string;
  apiOrder          :    boolean;
  onlineOrder       :    boolean;
  promptScheduleTime  :  boolean;
  deliveryService     : boolean;
  orderMinimumTotal  :  number;
  instructions:          string;
  shippingInstructions : string;
  scheduleInstructions : string;
  defaultProductID1    : number;
  defaultProductID2    : number;
  functionChoice      : number;
  functionChoice2     : number;
  functionChoice3     : number;
  requireNumOfGuests  : number;
  promptForOrderName  : number;
  filterType          : number;
}
