import { IPaymentMethod } from "src/app/_services/transactions/payment-methods.service";
import { TaxRate } from "../menu/menu-categories";
import { ItemType } from "../menu/menu-products";
import { clientType } from "../people/userprofile";
import { PosOrderMenuItem } from "./posorderitems";
// Generated by https://quicktype.io
// Generated by https://quicktype.io


export interface IPOSOrderSearchModel {
  completionDate_From:         string;
  completionDate_To:           string;
  orderDate_From:              string;
  orderDate_To:                string;
  serviceTypes:                string[];
  serviceType:                 string;
  serviceTypeID:               number;
  closedOpenAllOrders:         number;
  employeeID:                  number;
  suspendedOrder:              number;
  pageSize:                    number;
  pageNumber:                  number;
  pageCount:                   number;
  currentPage:                 number;
  lastPage:                    number;
  useNameInAllFieldsForSearch: boolean;
  routeID:                     number;
  routeDetailID:               number;
  greaterThanZero:             number;
  clientID:                    number;
  orderID           :          number;
}


export interface IPOSOrder {
  id:                    number;
  orderTime:             string;
  orderDate:             string;
  completionDate:        string;
  completionTime:        string;
  eta:                   string;
  employeeID:            number;
  clientID:              number;
  serviceTypeID:         number;
  productOrderMemo:      string;
  shippingNumber:        string;
  shipAddress:           string;
  shipAddress2:          string;
  shipCity:              string;
  shipName:              string;
  shipPostal:            string;
  shipState:             string;
  shipSuite:             string;
  shipPostalCode:        string;
  reportRunID:           number;
  employeeName:          string;
  serviceType:           string;
  registerTransaction:   boolean;
  orderPhone:            string;
  onlineOrderID:         string;
  purchaseOrderNumber:   string;
  positiveNegative:      number;
  itemCount:             number;
  subTotal:              number;
  total:                 number;
  taxTotal:              number;
  tax1:                  number;
  tax2:                  number;
  tax3:                  number;
  barTax:                number;
  crv:                   number;
  orderPercentDiscount:  number;
  orderCashDiscount:     number;
  itemCashDiscount:      number;
  itemPercentDiscount:   number;
  gramCount:             number;
  seedCount:             number;
  liquidCount:           number;
  concentrateCount:      number;
  extractCount:          number;
  quantity:              number;
  itemQuantity:          number;
  orderID:               number;
  deviceName:            string;
  preferredScheduleDate: string;
  customerName:          string;
  zrun:                  string;
  routeID:               number;
  routeDetailID:         number;
  suspendedOrder:        boolean;
  posPayments:           PosPayment[];
  clients_POSOrders:     ClientsPOSOrders;
  posOrderItems:         PosOrderItem[];
  balanceRemaining      :number;
  totalPayments         :number;
  voidReason            :string;
  resultMessage         : string;
  history               : boolean;
}

export interface ClientsPOSOrders {
  id:                        number;
  firstName:                 string;
  lastName:                  string;
  phone:                     string;
  zip:                       string;
  state:                     string;
  city:                      string;
  address:                   string;
  email:                     string;
  notes:                     string;
  loyaltyPoints:             number;
  loyaltyPurchaseCount:      number;
  clientUUID:                string;
  uid:                       string;
  clientType:                number;
  totalPurchases:            number;
  initialDate:               string;
  lastAccessedDate:          string;
  company:                   string;
  accountNumber:             string;
  userName:                  string;
  cellPhone:                 string;
  apiPassword:               string;
  roles:                     string;
  onlineDescription:         string;
  onlineDescriptionImage:    string;
  onlineDescriptionTag:      string;
  dob:                       string;
  gender:                    number;
  followUpdateDate:          string;
  salesRepName:              string;
  statusname:                string;
  lasModifiedDate:           string;
  taxSales:                  number;
  priceColumn:               number;
  defaultPercentageDiscount: number;
  client_Type:               ClientType;
  age:                       number;
  loyaltyPointValue:         number;
}

export interface ClientType {
  id:                number;
  name:              string;
  pointValue:        string;
  dailyCredit:       number;
  limitGram:         number;
  limitSeeds:        number;
  limitPlants:       number;
  limitLiquid:       number;
  limitSolid:        number;
  limitConcentrate:  number;
  limitExtract:      number;
  limitConcentrates: number;
}


export interface PosOrderItem {
  id:                            number;
  productID:                     number;
  orderID:                       number;
  sku:                           string;
  productName:                   string;
  quantity:                      number;
  discount:                      number;
  unitPrice:                     number;
  wholeSale:                     number;
  modifierNote:                  string;
  unitType:                      number;
  tax1:                          number;
  serviceTypeID:                 number;
  employeeID:                    number;
  zrun:                          string;
  clientID:                      number;
  reportRunID:                   number;
  originalPrice:                 number;
  serverName:                    string;
  serviceType:                   string;
  tax2:                          number;
  tax3:                          number;
  wicebt:                        number;
  caseQTY:                       number;
  stdRetail:                     number;
  itemCashDiscount:              number;
  itemOrderCashDiscount:         number;
  itemOrderPercentageDiscount:   number;
  itemLoyaltyPointCount:         number;
  itemLoyaltyPointDiscount:      number;
  itemPercentageDiscountValue:   number;
  itemOrderPercentageDiscountID: number;
  itemOrderCashDiscountID:       number;
  itemCashDiscountID:            number;
  itemPercentageDiscountValueID: number;
  itemLoyaltyPointDiscountID:    number;
  unitName:                      string;
  prodModifierType:              number;
  printed:                       string;
  isWeightedItem:                number;
  quantityView:                  string;
  positiveNegative:              number;
  orderDate:                     string;
  completionDate:                string;
  voidReason:                    string;
  subTotal:                      number;
  total:                         number;
  taxTotal:                      number;
  itemType                    :  ItemType;
  promptGroupID               :  number;
  idRef                       :  number;
  posOrderMenuItem:              PosOrderMenuItem;
  serialCode:                    string;
  history                     :  boolean;
  inventoryCountUsage:           number;
}

export interface PosPayment {
  id:                  number;
  orderID:             number;
  paymentMethodID:     number;
  amountPaid:          number;
  amountReceived:      number;
  tipAmount:           number;
  zrun:                string;
  employeeID:          number;
  employeeName:        string;
  reportRunID:         number;
  clientName:          string;
  completionDate:      string;
  orderDate:           string;
  serviceTypeID:       number;
  serviceType:         string;
  registerTransaction: boolean;
  positiveNegative:    number;
  voidReason           : string;
  paymentMethod        : IPaymentMethod;
  history                     :  boolean;
}
////Payments - need to move to it's own file.

// Generated by https://quicktype.io



export interface PaymentMethod {
  id:              number;
  name:            string;
  isCreditCard:    boolean;
  companyCredit:   boolean;
  reverseCharge:   boolean;
  managerRequired: boolean;
  wic:             boolean;
  ebt:             boolean;
  tenderOrder:     number;
  exchangeRate:    number;
  isCash:          boolean;
  state:           boolean;
  enabledOnline:   boolean;
  preAuth:         boolean;
}

export interface PosPayment {
  id:                  number;
  orderID:             number;
  paymentMethodID:     number;
  amountPaid:          number;
  amountReceived:      number;
  tipAmount:           number;
  zrun:                string;
  employeeID:          number;
  employeeName:        string;
  reportRunID:         number;
  clientName:          string;
  completionDate:      string;
  orderDate:           string;
  serviceTypeID:       number;
  serviceType:         string;
  registerTransaction: boolean;
  positiveNegative:    number;
  voidReason:          string;
  paymentMethod:       PaymentMethod;
  history:             boolean;
}


export interface IPOSPaymentsOptimzed {
  results:      Result[];
  paging:       Paging;
  summary:      Summary;
  errorMessage: null;
}

export interface Paging {
  hasNextPage:      boolean;
  hasPreviousPage:  boolean;
  lastItemOnPage:   number;
  pageSize:         number;
  currentPage:      number;
  pageCount:        number;
  recordCount:      number;
  isLastPage:       boolean;
  isFirstPage:      boolean;
  totalRecordCount: number;
}

export interface Result {
  id:                  number;
  paymentMethodID:     number;
  amountPaid:          number;
  checkNumber:         number;
  saleType:            number;
  groupNumber:         number;
  approvalCode:        string;
  preAuth:             string;
  isBatched:           boolean;
  cardHolder:          null;
  userID:              null;
  amountReceived:      number;
  tipAmount:           number;
  clientID:            number;
  groupID:             null;
  groupDate:           null;
  orderDate:           string;
  serviceTypeID:       number;
  employeeID:          number;
  zrun:                string;
  completionDate:      string;
  reportRunID:         number;
  registerTransaction: boolean;
  positiveNegative:    number;
  serviceType:         ServiceType;
  employeeName:        string;
  cAddress:            string;
  cAddress2:           null;
  cCity:               string;
  cState:              string;
  cZip:                string;
  invoicedDate:        null;
  driverID:            null;
  accountNum:          string;
  clientName:          null | string;
  managerID:           number;
  batchDate:           null;
  discountGiven:       null;
  giftCardID:          number;
  gcBalance:           number;
  voidReason:          string;
  voidAmount:          number;
  orderID:             number;
  PaymentMethod:       IPaymentMethod;
}

export enum ServiceType {
  Retail = "Retail",
}

export interface Summary {
  amountPaid:       number;
  balanceRemaining: number;
  tipAmount:        number;
}

export interface IPaymentResponse {

  payment         : IPOSPayment
  paymentSuccess  : boolean;
  orderCompleted  : boolean;
  responseMessage : string;
  order           : IPOSOrder;

}

enum actions {
  void = 1,
  // priceAdjust = 2,
  note = 3
}


export interface PaymentWithAction {
  payment           : IPOSPayment;
  action            : actions;
  voidReasonID      : number;
  voidReason        : string;
  id                : number;
  paymentMethod     : IPaymentMethod;
  result            : boolean;
}

export interface IPaymentSearchModel {
  completionDate_From:         string;
  completionDate_To:           string;
  orderDate_From:              string;
  orderDate_To:                string;
  serviceTypes:                string[];
  serviceType:                 string;
  serviceTypeID:               number;
  closedOpenAllPayments:       number;
  preAuthorizedPayments:       boolean;
  employeeID:                  number;
  pageSize:                    number;
  pageNumber:                  number;
  pageCount:                   number;
  currentPage:                 number;
  lastPage:                    number;
  useNameInAllFieldsForSearch: boolean;
  voidedPayments:              number;
  preAuth:                     boolean;
  clientID:                    number;
  paymentMethodID              :number;
  orderID                      :number;
  id:                          number;
  isCash                       : boolean;
  isCreditCard                 : boolean;
  tipInput                     : boolean;
  zrun                         : number;
  reportRunID                  : number;
}

// Public Property Payment As t_Payments
// Public Property PaymentSuccess As Boolean
// Public Property OrderCompleted As Boolean
// Public Property ResponseMessage As String

export interface IPOSPayment {
  id:                  number;
  paymentMethodID:     number;
  amountPaid:          number;
  checkNumber:         number;
  saleType:            number;
  groupNumber:         number;
  approvalCode:        string;
  preAuth:             string;
  isBatched:           boolean;
  cardHolder:          string;
  getResult:           number;
  getRefNumber:        number;
  getTroutID:          number;
  userID:              string;
  cardNum:             string;
  refNumber:           string;
  ccNumber:            string;
  amountReceived:      number;
  tipAmount:           number;
  exp:                 string;
  clientID:            number;
  groupID:             number;
  groupDate:           string;
  orderDate:           string;
  serviceTypeID:       number;
  employeeID:          number;
  zrun:                string;
  completionDate:      string;
  reportRunID:         number;
  registerTransaction: boolean;
  positiveNegative:    number;
  serviceType:         string;
  employeeName:        string;
  cAddress:            string;
  cAddress2:           string;
  cCity:               string;
  cState:              string;
  cZip:                string;
  invoicedDate:        string;
  driverID:            number;
  vehicle:             string;
  origin:              string;
  destination:         string;
  accountNum:          string;
  clientName:          string;
  cvc:                 string;
  managerID:           number;
  batchDate:           string;
  discountGiven:       number;
  siteID:              number;
  giftCardID:          number;
  dlNumber:            string;
  processData:         string;
  gcBalance:           number;
  voidReason:          string;
  voidAmount:          number;
  applicationLabel:    string;
  aid:                 string;
  tvr:                 string;
  iad:                 string;
  tsi:                 string;
  arc:                 string;
  emvTime:             string;
  emvDate:             string;
  emvcvm:              string;
  entryMethod:         string;
  trancode:            string;
  textResponse:        string;
  captureStatus:       string;
  tranType:            string;
  beginDate:           string;
  endDate:             string;
  orderID:             number;
  history           :  boolean;
}

// Generated by https://quicktype.io

export interface IOrdersPaged {
  results:      IPOSOrder[];
  paging:       Paging;
  summary:      Summary;
  errorMessage: string;
  count:        number;
}

export interface Paging {
  hasNextPage:      boolean;
  hasPreviousPage:  boolean;
  lastItemOnPage:   number;
  pageSize:         number;
  currentPage:      number;
  pageCount:        number;
  recordCount:      number;
  isLastPage:       boolean;
  isFirstPage:      boolean;
  totalRecordCount: number;
}

export interface Summary {
  total:                number;
  taxTotal:             number;
  tax1:                 number;
  tax2:                 number;
  tax3:                 number;
  subTotal:             number;
  itemPercentDiscount:  number;
  itemCashDiscount:     number;
  orderCashDiscount:    number;
  orderPercentDiscount: number;
  itemQuantity:         number;
  concentrateCount:     number;
  extractCount:         number;
  liquidCount:          number;
  seedCount:            number;
  gramCount:            number;
  paymentsTotal:        number;
  balanceRemaining:     number;
  history:              boolean;
}
