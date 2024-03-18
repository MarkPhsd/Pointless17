import { InventoryManifest } from "src/app/_services/inventory/manifest-inventory.service";
import { IPaymentMethod } from "src/app/_services/transactions/payment-methods.service";
import { IMenuItem, ItemType } from "../menu/menu-products";
import { PosOrderMenuItem } from "./posorderitems";
import { IServiceType }   from 'src/app/_interfaces';
import { IInventoryAssignment } from "src/app/_services/inventory/inventory-assignment.service";
import { TransactionUISettings } from "src/app/_services/system/settings/uisettings.service";
// Generated by https://quicktype.io
// Generated by https://quicktype.io

// export wicEBTList  id: number       = [{id: 0, name: 'NONE'},{id: 1, name: 'WIC'},{id: 2, name: 'EBT'},{id: 2, name: 'WIC and EBT'}]

export interface IReconcilePayload {
  categoryID: number;
  departmentID: number;
  itemTypeID: number;
  bayName: string;
  id: number;
}

export interface IPOSOrderSearchModel {
  summaryOnly: boolean;
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
  scheduleDate_To   :          string;
  scheduleDate_From :          string;
  prepStatus        :          number;
  printLocation     :          number;
  description: string;
  searchOrderHistory: boolean;
  onlineOrders: boolean;
  sortBy1: string;
  sortBy1Asc: string;
  sortBy2: string;
  sortBy2Asc: string;
  sortBy3: string;
  sortBy3Asc: string;

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
  taxColumn1Description : string;
  caxColumn2Description : string;
  taxColumn3Description : string;
  barTax:                number;
  crv:                   number;
  cost                 :  number;
  orderPercentDiscount:  number;
  orderCashDiscount:     number;
  itemCashDiscount:      number;
  itemPercentDiscount:   number;
  gramCount:             number;
  seedCount:             number;
  liquidCount:           number;
  concentrateCount:      number;
  extractCount:          number;
  combinedCategory      :number;
  solidCount            :number;
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
  balanceRemaining      : number;
  totalPayments         : number;
  voidReason            : string;
  resultMessage         : string;
  history               : boolean;
  orderID_Temp          : string;
  orderLocked:            string;
  wicTotal              : number;//    As Double
  ebtTotal              : number;// As Double
  stateTotal            : number;// As Double
  gratuity              : number;
  tableUUID             : string;
  floorPlanID           : number;
  tableName             : string;
  orderCode:             string;
  service               : IServiceType;
  creditFee_Total       : number;
  cashDiscountFee       : number;
  creditBalanceRemaining: number;
  priceColumn           : number;
  serviceArea           : string;
  defaultPercentageDiscount  : number;
  wholeSaleTraceCalcSum:number;
  wholeSaleCostTotal    : number;
  productOrderRef       : number;
  statusName            : string;
  cashDiscountNet 	: number | null;
  cashDiscountTax	  : number | null;
  cashDiscountGross : number | null;
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
  medLicenseNUmber: number;
  oomp: string;
  oompb: string;
  mramCountMonthly: number;
  medGramLimit: number;
  medConcentrateLimit: number;
  medPlantLimit: number;
  medFlowerLimit: number;
  combinedCategoryLimit: number;
  solidCountLimit: number;
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
  limitCombinedCategory:number;
  allowStaffUse    : boolean;
  authorizationGroupID:  number;
  jsonObject      : string;
}

export interface PosOrderItem {
  bayName                      : string;
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
  menuItem        :              IMenuItem;
  inventory                   :  IInventoryAssignment;
  serialCode:                    string;
  history                     :  boolean;
  inventoryCountUsage:           number;
  scheduleID:                    number;
  scheduleDiscount_GroupValue :  number;
  isSchedule_DiscountMember   :  number;
  isSchedule_DiscountedItem   :  number;
  discountScheduleID          :  number;
  packagingMaterial           :  string;
  portionValue                :  string;
  itemPrepped                 :  string;
  printLocation               :  number;
  splitGroupID                :  number;
  gratuity                    :  number;
  itemReturn                  :  number;
  inventoryAssignmentID       :  number;
  prodSecondLanguage          : string;
  productSortOrder            : number;
  priceTierID             : number;
  pizzaGroup              : number;
  pizzaMultiplier         : number;
  wholeSaleCost           : number;
  rewardGroupApplied: number;
  baseUnitTypeID: number;
  baseUnitType: string;
  unitMultiplier: number;
  traceProductCalc: number;
  traceProductCount: number;
  wholeSaleTraceCalc: number;
  categoryID: number;
  departmentID: number;
  itemTypeID: number;
  traceOrderDate: string;
  expectedInventoryCount: number;
  salesCount: number;
  currentProductCount: number;
  conditionalIndex: number;
  cashDiscountPrice: number | null;
  cashDiscountTotalPrice: number | null;
  cashDiscountGross: number | null;
}
//ItemPrepped,PrintLocation,Splitter as SplitGroupID,Gratuity,ProdSecondLanguage,productSortOrder,PizzaMultiplier, PizzaGroup, PriceTierID

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
  voidReason          : string;
  paymentMethod       : IPaymentMethod;
  history             : boolean;
  refNumber:          string;
  approvalCode:       string;
  acqRefData:         string;
  entryMethod:        string;
  addedPercentageFee : number;
  tranType            : string;
  resptat: string;
  account: string;
  retref: string;
  expiry: string;
  respproc: string;
  resptext: string;
  transactionIDRef: string;
  tranCode: string;
  cashDiscountAdjustment: number;
}

////Payments - need to move to it's own file.
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
  preAuth     :    boolean;
  instructions:    string;
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
  paymentMethod:       IPaymentMethod;
  history:             boolean;
  cashDiscountAdjustment: number;
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
  priceAdjust = 2,
  note = 3
}

export interface OperationWithAction {
  order: IPOSOrder;
  payment           : IPOSPayment;
  action            : actions;
  voidReasonID      : number;
  voidReason        : string;
  id                : number;
  paymentMethod     : IPaymentMethod;
  manifest          : InventoryManifest;
  result            : boolean;
  purchaseOrderPayment: IPOSPayment;
  resultMessage     : string;
  uiSetting         : TransactionUISettings
  voidAmount:       number;
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
  sortBy1: string;
  sortBy1Asc: string;
  sortBy2: string;
  sortBy2Asc: string;
  sortBy3: string;
  sortBy3Asc: string;

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
  transactionData     : string;
  history           :  boolean;
  transactionIDRef : string;
  commcard: string;
  resptext: string;
  cvvresp: string;
  respcode: string;
  batchid: string;
  avsresp: string;
  entrymode: string;
  respproc: string;
  bintype: string;
  expiry: string;
  retref: string;
  respstat: string;
  account: string;
  addedPercentageFee : number;
  acqRefData: string;
  paymentMethod: IPaymentMethod;
  transactionIDref: string;
  recordNo: string;
  surchargeAmount :number;
  cashDiscountAdjustment: number;
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
  surchargeAmount      :number;
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

export interface OrderToFrom {
  id: number;
  orderTime?: string | null;
  orderDate?: string | null;
  shipTime?: string | null;
  shipDate?: string | null;
  completionDate?: string | null;
  completionTime?: string | null;
  scheduleDate?: string | null;
  scheduleTime?: string | null;
  scheduleTo?: string | null;
  shippedDate?: string | null;
  alarmDate?: string | null;
  eTA?: string | null;
  arrivalDate?: string | null;
  timeIn?: string | null;
  shipOutOrderDate?: string | null;
  employeeID?: number | null;
  shift?: number | null;
  clientID?: number | null;
  serviceTypeID?: number | null;
  deliveryEmployee?: number | null;
  operationsEmployee?: number | null;
  purchaseOrderNumber?: string;
  supplierID?: number | null;
  productOrderMemo?: string;
  fieldRepMemo?: string;
  compName?: string;
  shippingNumber?: string;
  tableNumber?: number | null;
  activePO?: boolean | null;
  tableNumberStore?: number | null;
  zrun?: string;
  taxInfo?: number | null;
  voidComp?: number | null;
  serviceArea?: string;
  registerName?: string;
  discountType?: number | null;
  discountAmount?: number | null;
  discountCash?: number | null;
  discountName?: number | null;
  orderPrepared?: number | null; // Short in VB.NET is mapped to number in TypeScript
  quote?: string;
  seatCount?: number | null;
  shipName?: string;
  shipAddress?: string;
  shipAddress2?: string;
  shipCity?: string;
  shipState?: string;
  shipPostalCode?: string;
  shipSuite?: string;
  employeeDisc?: number | null;
  shipPostal?: string;
  serviceAreaID?: number | null;
  reportRunID?: number | null;
  shipZip?: string;
  voidReason?: string;
  displayTotal?: number | null;
  registerTransaction?: boolean | null;
  serviceType?: string;
  positiveNegative?: number | null;
  serverName?: string;
  destAddress?: string;
  destAddress2?: string;
  destCity?: string;
  destZip?: string;
  destState?: string;
  mileage?: number | null;
  driveTime?: number | null;
  sortOrder?: number | null;
  orderPhone?: string;
  vehicle?: string;
  driverID?: number | null;
  productOrderRef?: number | null;
  siteID?: number | null;
  statusName?: string;
  eventSubject?: string;
  taxTotal?: number | null;
  gSTTaxTotal?: number | null;
  managerID?: number | null;
  costTotal?: number | null;
  termsDueDate?: string | null;
  resolutionDescription?: string;
  shipVia?: number | null;
  location?: string;
  cRVTotal?: number | null;
  taxTotal2?: number | null;
  taxTotal3?: number | null;
  qBImport?: number | null; // Byte in VB.NET is mapped to number in TypeScript
  checkinRepID?: number | null;
  checkInRepName?: string;
  onlineOrderID?: number | null;
  routeDetailID?: number | null;
  routeID?: number | null;
  orderLocked?: string;
  beginDate: Date;
  endDate: Date;
  orderPercentDiscountID?: number | null;
  gratuity?: number | null;
  specialFee?: number | null;
  gratuityID?: number | null;
  tableUUID?: string;
  floorPlanID?: number | null;
  tableName?: string;
  orderCode?: string;
  addedPercentageFee?: number | null;
  priceColumn?: number | null;
  defaultPercentageDiscount?: number | null;
  cashDiscountPercent?: number | null;
  cashDiscountValue?: number | null;
  items?: any[];
  payments?: any[];
}
