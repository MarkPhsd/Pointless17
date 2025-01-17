// Generated by https://quicktype.io
import { IPagedList } from "src/app/_services/system/paging.service";

export interface IPriceCategoryPaged {
  results      : PriceCategories[]
  paging       : IPagedList
}

// export interface IPriceCategories {
//   id:            number;
//   name:          string;
//   uid:           string;
//   recMedOption:  number;
//   productPrices: ProductPrice[];
// }

export interface IPriceCategory2 {
  id:            number;
  name:          string;
  uid:           string;
  recMedOption:  number;
}

// export interface ProductPrice {
//   id:               number;
//   priceCategoryID:  number;
//   retail:           number;
//   wholeSale:        number;
//   unitTypeID:       number;
//   unitType:         string;
//   price1:           number;
//   price2:           number;
//   price3:           number;
//   price4:           number;
//   price5:           number;
//   price6:           number;
//   price7:           number;
//   price8:           number;
//   price9:           number;
//   price10:          number;
//   hideFromMenu:     number;
//   tierPriceGroup:   number;
//   useforInventory:  number;
//   pizzaMultiplier:  number;
//   unitPartRatio:    number;
//   partMultiplyer:   number;
//   doNotDelete:      number;
//   pizzaSize:        number;
//   priceType:        number;
//   barcode:          string;
//   itemQuantity:     number;
//   productID:        number;
//   timeBasedPrice:   number;
//   uid:              string;
//   weekDays:         string;
//   endTime:          string;
//   startTime:        string;
//   webEnabled:       number;
//   specialDatePrice: number;
//   startDate:        string;
//   endDate:          string;
//   priceTiers:       PriceTiers;
//   gramPrice:        number;
//   eightPrice:       number;
//   quarterPrice:     number;
//   halfOuncePrice:   number;
//   ouncePrice:       number;
// }



export interface PriceCategories {
  id:            number;
  name:          string;
  uid:           string;
  recMedOption:  number;
  productPrices: ProductPrice[];
}

export interface ProductPrice {
  id:               number;
  priceCategoryID:  number;
  retail:           number;
  wholeSale:        number;
  unitTypeID:       number;
  unitType:         UnitType;
  price1:           number;
  price2:           number;
  price3:           number;
  price4:           number;
  price5:           number;
  price6:           number;
  price7:           number;
  price8:           number;
  price9:           number;
  price10:          number;
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
  timeBasedPrice:   number;
  uid:              string;
  weekDays:         string;
  endTime:          string;
  startTime:        string;
  webEnabled:       number;
  specialDatePrice: number;
  startDate:        string;
  endDate:          string;
  priceTiers:       PriceTiers;
  gramPrice       : number;
  halfPrice       : number;
  quarterPrice    : number;
  ouncePrice      : number;
  eightPrice      : number;
}

export interface IPriceTierPaged {

  results      : PriceTiers[]
  paging       : IPagedList
}

export interface PriceTiers {
  id:              number;
  name:            string;
  uid:             string;
  webEnabled:      number;
  priceTierPrices: PriceTierPrice[];
}

export interface PriceTierPrice {
  id:             number;
  productPriceID: number; //pricetier
  quantityFrom:   any;
  quantityTo:     any;
  retail:         any;
  price1:         any;
  price2:         any;
  price3:         any;
  price4:         any;
  price5:         any;
  price6:         any;
  price7:         any;
  price8:         any;
  price9:         any;
  startTime:      string;
  endTime:        string;
  specialPrice:   any;
  weekDays:       string;
  flatQuantity:   any;
  priceName:      string;
  rateOrPrice:    boolean;
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
  limitMulitplier:  number;
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

export interface IUnitTypePaged {

  results      : UnitType[]
  paging       : IPagedList

}

 export interface ProductPrice2 {
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
  gramPrice       : number;
  halfPrice       : number;
  quarterPrice    : number;
  ouncePrice      : number;
  eightPrice      : number;
}

export interface ProductPrice {
  id:               number;
  priceCategoryID:  number;
  retail:           number;
  wholeSale:        number;
  unitTypeID:       number;
  unitType:         UnitType;
  price1:           number;
  price2:           number;
  price3:           number;
  price4:           number;
  price5:           number;
  price6:           number;
  price7:           number;
  price8:           number;
  price9:           number;
  price10:          number;
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
  timeBasedPrice:   number;
  uid:              string;
  weekDays:         string;
  endTime:          string;
  startTime:        string;
  webEnabled:       number;
  specialDatePrice: number;
  startDate:        string;
  endDate:          string;
  priceTiers:       PriceTiers;
  gramPrice       : number;
  halfPrice       : number;
  quarterPrice    : number;
  ouncePrice      : number;
  eightPrice      : number;
}
