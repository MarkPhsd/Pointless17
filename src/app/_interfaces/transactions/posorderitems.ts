// Generated by https://quicktype.io

import { TEXT_DECORATION_LINE } from "html2canvas/dist/types/css/property-descriptors/text-decoration-line";
import { IInventoryAssignment } from "src/app/_services/inventory/inventory-assignment.service";
import { TaxRate } from "..";
import { IPurchaseOrderItem } from "../raw/purchaseorderitems";
import { IPOSOrder } from "./posorder";

export interface IPOSOrderItem {
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
  serviceTypeID:                 number;
  employeeID:                    number;
  zrun:                          string;
  clientID:                      number;
  reportRunID:                   number;
  originalPrice:                 number;
  serverName:                    string;
  serviceType:                   string;
  tax1:                          number;
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
  subTotal:                      number;
  total:                         number;
  taxTotal:                      number;
  idRef   :                      number;
  promptGroupID :                number;
  posOrderMenuItem:              PosOrderMenuItem;
}

export interface PosOrderMenuItem {
  id:                       number;
  prodModifierType:         number;
  name:                     string;
  displayName:              string;
  caseQty:                  number;
  wholeSale:                number;
  caseWholeSale:            number;
  retail:                   number;
  caseRetail:               number;
  casePrice1:               number;
  casePrice2:               number;
  casePrice3:               number;
  priceB:                   number;
  priceA:                   number;
  priceC:                   number;
  msrp:                     number;
  productCount:             number;
  thc:                      string;
  cbd:                      string;
  gramCount:                number;
  metaTags:                 string;
  metaDescription:          string;
  onlineDescription:        string;
  gender:                   number;
  requiresSerial:           number;
  wicEBT:                   number;
  wickEligible:             number;
  giftCardType:             number;
  alcoholItem:              number;
  weightedItem:             number;
  onlineShortDescription:   string;
  urlImageOther:            string;
  urlImageMain:             string;
  categoryID:               number;
  subCategoryID:            number;
  priceCategoryID:          number;
  category:                 string;
  subcategory:              string;
  barcode:                  string;
  sku:                      string;
  brandID:                  number;
  departmentID:             number;
  department:               string;
  unitTypeID:               number;
  unitDescription:          string;
  specialDescription:       string;
  taxable:                  number;
  taxRate1ID:               number;
  taxRate2ID:               number;
  taxRate3ID:               number;
  item_GramCountMulitplier: string;
  order_TaxAmount1:         string;
  order_TaxAmount2:         string;
  order_TaxAmount3:         string;
  order_BarTax:             string;
  order_CRV:                string;
  order_ExtractCount:       string;
  order_EachCount:          string;
  order_SeedCount:          string;
  order_SolidCount:         string;
  order_GramCount:          string;
  order_LiquidCount:        string;
  order_ConcentrateCount:   string;
  order_Quantity:           string;
  priceTierID:              number;
  requiredGroupID:          number;
  productSortOrder:         number;
  kcode:                    string;
  cannabisType:             string;
  ratingAverage:            number;
  ratingCount:              number;
  taxRate1:                 TaxRate;
  taxRate2:                 TaxRate;
  taxRate3:                 TaxRate;
  promptGroupID           : number;
}

