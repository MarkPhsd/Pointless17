// Generated by https://quicktype.io

import { IMenuItem } from "./menu-products";

export interface IProductCategory {
  id:                     number;
  name:                   string;
  metaTags:               string;
  metaDescription:        string;
  onlineDescription:      string;
  onlineShortDescription: string;
  urlImageOther:          string;
  urlImageMain:           string;
  departmentID          : number;
  prodModifierType      : number;
  active: boolean;
  webEnabled:boolean;
  menuItem:               IMenuItem[];
}

// export interface MenuItem {
//   id:                       number;
//   prodModifierType:         number;
//   name:                     string;
//   displayName:              string;
//   caseQty:                  number;
//   caseWholeSale:            number;
//   retail:                   number;
//   caseRetail:               number;
//   casePrice1:               number;
//   casePrice2:               number;
//   casePrice3:               number;
//   price1:                   number;
//   price2:                   number;
//   price3:                   number;
//   msrp:                     number;
//   productCount:             number;
//   thc:                      string;
//   cbd:                      string;
//   gramCount:                number;
//   metaTags:                 string;
//   metaDescription:          string;
//   onlineDescription:        string;
//   onlineShortDescription:   string;
//   urlImageOther:            string;
//   urlImageMain:             string;
//   categoryID:               number;
//   subCategoryID:            number;
//   priceCategoryID:          number;
//   category:                 string;
//   subcategory:              string;
//   barcode:                  string;
//   sku:                      string;
//   brandID:                  number;
//   departmentID:             number;
//   department:               string;
//   unitTypeID:               number;
//   unitDescription:          string;
//   specialDescription:       string;
//   taxable:                  number;
//   order_BarTax:             string;
//   order_CRV:                string;
//   order_SeedCount:          string;
//   order_GramCount:          string;
//   order_LiquidCount:        string;
//   order_ConcentrateCount:   string;
//   order_Quantity:           string;
//   wholeSale:                number;
//   taxRate1ID:               number;
//   taxRate2ID:               number;
//   taxRate3ID:               number;
//   priceTierID:              number;
//   requiredGroupID:          number;
//   productSortOrder:         number;
//   kcode:                    string;
//   cannabisType:             string;
//   item_GramCountMulitplier: string;
//   order_TaxAmount1:         string;
//   order_TaxAmount2:         string;
//   order_TaxAmount3:         string;
//   order_EachCount:          string;
//   order_SolidCount:         string;
//   order_ExtractCount:       string;
//   priceCategories:          Price;
//   taxRate1:                 TaxRate;
//   taxRate2:                 TaxRate;
//   taxRates3:                TaxRate;
//   active: boolean;
//   webMode: boolean;
// }

export interface ProductPrice {
  id:               number;
  priceCategoryID:  number;
  retail:           number;
  wholeSale:        number;
  unitTypeID:       number;
  price1:           number;
  price2:           number;
  price3:           number;
  hideFromMenu:     number;
  useforInventory:  number;
  pizzaMultiplier:  number;
  unitPartRatio:    number;
  partMultiplyer:   number;
  doNotDelete:      number;
  pizzaSize:        number;
  priceType:        number;
  barcode:          string;
  itemQuantity:     number;
  productID:        number;
  tierPriceGroup:   number;
  price4:           number;
  price5:           number;
  price6:           number;
  price7:           number;
  price8:           number;
  price9:           number;
  price10:          number;
  timeBasedPrice:   number;
  uid:              string;
  weekDays:         string;
  endTime:          string;
  startTime:        string;
  webEnabled:       number;
  specialDatePrice: number;
  startDate:        string;
  endDate:          string;
  priceTiers:       Price;
  unitType:         UnitType;
}

export interface Price {
  id:               number;
  name:             string;
  uid:              string;
  productPrices?:   ProductPrice[];
  priceTierPrices?: PriceTierPrice[];
}

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

export interface PriceTierPrice {
  id:             number;
  productPriceID: number;
  quantityFrom:   string;
  quantityTo:     string;
  retail:         string;
  price1:         string;
  price2:         string;
  price3:         string;
  price4:         string;
  price5:         string;
  price6:         string;
  price7:         string;
  price8:         string;
  price9:         string;
  startTime:      string;
  endTime:        string;
  specialPrice:   string;
  weekDays:       string;
}

export interface TaxRate {
  id          : number;
  rate        : number;
  name        : string;
  taxColumn   : number;
}
