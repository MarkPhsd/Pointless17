import { ProductSearchModel } from "../search-models/product-search";
import { IPOSOrderSearchModel } from "../transactions/posorder";

export interface IUser {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  authdata?: string;
  resetCode?: string;
  email: string;
  sourceURL: string;
  token: string;
  phone: string;
  roles: string;
  type:  string;
  employeeID: number;
  metrcUser: string;
  metrcKey: string;
  loginAttempts: number;
  message: string;
  errorMessage: string;
  sortMenu: string;
  preferences: string;
  userPreferences: UserPreferences;
}

export interface UserPreferences {
  disableWarnOrderDelete: boolean;
  darkMode: boolean;
  swapMenuOrderPlacement: boolean;
  orderFilter: IPOSOrderSearchModel
  product: ProductSearchModel;
  showAllOrders: boolean;
  firstTime_notifyShowAllOrders: boolean;
  firstTime_FilterOrderInstruction: boolean;
  enableCoachMarks: boolean;
  contactPreference: number;
  orderID: number;
  ebayItemJSONHidden: boolean;
  headerColor: string;
  messagingPreference: number;
  metrcUseMetrcLabel: boolean;
  customerDisplayPin: string;
}

