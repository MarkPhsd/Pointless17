// Generated by https://quicktype.io

import { IPrinterLocation } from "src/app/_services/menu/printer-locations.service";
import { IClientTable } from "../raw/clients";
import { PriceCategories, ProductPrice } from "./price-categories";
import { IItemBasic } from "src/app/_services";

// Generated by https://quicktype.io

export interface IMenuItem {
  sort: number;
  id:                       number;
  prodModifierType:         number;
  name:                     string;
  displayName:              string;
  caseQty:                  number;
  caseWholeSale:            number;
  retail:                   number;
  caseRetail:               number;
  casePrice1:               number;
  casePrice2:               number;
  casePrice3:               number;
  price1:                   number;
  price2:                   number;
  price3:                   number;
  msrp:                     number;
  productCount:             number;
  gramCount:                number;
  metaTags:                 string;
  metaDescription:          string;
  onlineDescription:        string;
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
  order_BarTax:             string;
  order_CRV:                string;
  order_SeedCount:          string;
  order_GramCount:          string;
  order_LiquidCount:        string;
  order_ConcentrateCount:   string;
  order_Quantity:           string;
  wholesale:                number;
  taxRate1ID:               number;
  taxRate2ID:               number;
  taxRate3ID:               number;
  priceTierID:              number;
  requiredGroupID:          number;
  productSortOrder:         number;
  kcode:                    string;
  cannabisType:             string;
  item_GramCountMulitplier: string;
  order_TaxAmount1:         string;
  order_TaxAmount2:         string;
  order_TaxAmount3:         string;
  order_EachCount:          string;
  order_SolidCount:         string;
  order_ExtractCount:       string;
  gender:                   number;
  requiresSerial:           number;
  wicEBT:                   number;
  wickEligible:             number;
  giftCardType:             number;
  alcoholItem:              number;
  weightedItem:             number;
  ratingAverage:            number;
  ratingCount:              number;
  thc:                      string;
  thc2:                     number;
  thca:                     number;
  thca2:                    number;
  cbd:                      string;
  cbd2:                     number;
  cbn:                      number;
  cbn2:                     number;
  cbda:                     string;
  cbda2:                    number;
  species:                  string;
  productCategoryType:      string;
  quantityType:             string;
  defaultLabTestingState:   string;
  approvalStatus:           string;
  approvalStatusDateTime:   string;
  icon                    : string;
  strainID:                 boolean;
  strainName:               boolean;
  isUsed:                   boolean;
  promptGroupID           : number;
  abv                     : string;
  active:                   boolean;
  webEnabled              : boolean;
  thcContent              : number;
  glutenFree              : boolean;
  itemType:                 ItemType;
  productPrice:             ProductPrice;
  priceCategories:          PriceCategories;
  slug: string;
  prodSecondLanguage: string;
  dateMade                : string;
  testDate                : string;
  labID          : number;
  producerID     : number;
  producer       : IClientTable;
  lab            : IClientTable;
  json           : string;
  pB_MainID      : number;
  menuButtonJSON : menuButtonJSON;
  baseUnitType   : string;
  baseUniTypeID  : number;
  bayName: string;
  baySection: string;
  thumbNail: string;
  pieceWeight: number;
}

export interface menuButtonJSON {
  backColor: string;
  buttonColor: string;
  managerProtected: boolean;
  tareValue: number;
  pieceWeight: number;
  unitTypeSelections: string;
  limitMultiplier: number;
  requiresIDCheck: boolean;
}

//also in itemtype service - should consolidate
export interface ItemType {
  id:                   number;
  name:                 string;
  taxable:              number;
  type:                 string;
  weightedItem:         boolean;
  expirationRequired:   boolean;
  labelRequired:        boolean;
  ageRequirement:       number;
  sortOrder:            number;
  enabled:              boolean;
  useType:              string;
  icon:                 string;
  imageName:            string;
  useGroupID:           number;
  prepTicketID        : number;
  labelTypeID         : number;
  printerName:          string;
  printLocationID :     number;
  itemType_Categories:  ItemTypeCategory[];
  useGroups           : UseGroups;
  printerLocation     : IPrinterLocation;
  requiresSerial      : boolean;
  packageType         : string;
  requireInStock      : boolean;
  metrcCategoryID :    number;
  preptTicketID       : number;
  packagingMaterial   : string;
  portionValue        : string;
  instructions        : string;
  enableCustomNote   : boolean;
  wicebt             : number;
  requireWholeNumber : boolean;
  pricePrompt        : boolean;

  autoAddJSONProductList: string;
  unitName:             string;
  disablePriceCategory  :  boolean;
  disableSimplePrice    : boolean;
  promptQuantity: false,
  useDefaultPriceInApp: boolean;
  description: string;
  webStoreSimpleView: boolean; //to stop complext deli pricing view.
  itemRowColor?: string;
  sidePrepList?: number;
  json?: string;
  
}

export interface ItemTypeCategory {
  id:         number;
  itemTypeID: number;
  categoryID: number;
  itemCounts: ItemCounts;
}

export interface ItemCounts {
  id:        number;
  name:      string;
  itemCount: number;
}

export interface UseGroups {
  id:            number;
  name:          string;
  useGroupTaxes: UseGroupTax[];
}

export interface UseGroupTax {
  id:    number;
  taxID: number;
  UseGroupID: number;
  taxes: Taxes;
}

export interface Taxes {
  id:    number;
  value: number;
  name:  string;
  taxColumn: number;
}



// export interface PriceTiers {
//   id:              number;
//   name:            string;
//   uid:             string;
//   webEnabled:      number;
//   priceTierPrices: PriceTierPrice[];
// }

// export interface PriceTierPrice {
//   id:             number;
//   productPriceID: number; //pricetier
//   quantityFrom:   number;
//   quantityTo:     number;
//   retail:         number;
//   price1:         number;
//   price2:         number;
//   price3:         number;
//   price4:         number;
//   price5:         number;
//   price6:         number;
//   price7:         number;
//   price8:         number;
//   price9:         number;
//   startTime:      string;
//   endTime:        string;
//   specialPrice:   number;
//   weekDays:       string;
//   flatQuantity:   number;
//   priceName:      string;
//   rateOrPrice:    boolean;
// }

export interface UnitType {
  id:               number;
  name:             string;
  unitNote:         string;
  unitCategory:     string;
  unitMultipliedTo: number;
  unitMultiplyer:   number;
  mainUnit:         number;
  isMainUnit:       boolean;
  itemMultiplier:   number;
  doNotDelete:      number;
  abbreviation:     string;
  plural:           string;
  milileters:       number;
  fluidOunces:      number;
  massOunces:       number;
  grams:            number;
  unitID:           number;
  uid:              string;
}


export interface Review {
  id:           number;
  reviewDate:   string;
  clientID:     number;
  productID:    number;
  sku:          string;
  reviewNotes:  string;
  ratingValue:  number;
  activeReview: number;
  poDetailID:   number;
  reviewReponse: string;
  images:       string;
  orderID:      string;
}



