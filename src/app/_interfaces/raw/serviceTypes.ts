// Generated by https://quicktype.io
// Generated by https://quicktype.io
import { IMenuItem } from "../menu/menu-products";

export interface IServiceType {
  id:                    number;
  name:                  string;
  description           :string;
  positiveNegative:      number;
  isRegisterTransaction: boolean;
  taxItems:              boolean;
  showOrderType:         boolean;
  retailType       :     boolean;
  managerRequired:       number;
  showTipOption:         number;
  printerName:           string;
  icon       :           string;
  apiOrder          :    boolean;
  onlineOrder       :    boolean;
  promptScheduleTime  :  boolean;
  deliveryService     : boolean;
  orderMinimum        :  number;
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

  serviceColor: string;
  listFontColor:string;
  buttonColor: string;

  // serviceFilterType   : number;
  // ALTER TABLE tblServiceType ALTER COLUMN ServiceColor VARCHAR(15);
  // ALTER TABLE tblServiceType ALTER COLUMN ListFontColor VARCHAR(15);
  // ALTER TABLE tblServiceType ALTER COLUMN ButtonColor VARCHAR(15)
  assignOrderToCloser : boolean;
  assignCloserToOrder : boolean;

  onOrderClose: number;
  actionOne   : number;
  actionTwo   : number;
  menuItem1:  IMenuItem;
  menuItem2:  IMenuItem;
}


export interface IServiceTypePOSPut {
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
