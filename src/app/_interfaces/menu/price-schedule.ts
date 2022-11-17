import { Type } from "@angular/core";
import { IPagedList } from "src/app/_services/system/paging.service";
import { IMenuItem } from "./menu-products";

export interface PSMenuGroupPaged {
  results     : PriceMenuGroup[];
  paging      : IPagedList;
  errorMessage: string;
  message     : string;
}

export interface PSSearchModel {
  id:                 number;
  name:               string;
  pageNumber:         number;
  pageSize:           number;
}

export interface PriceAdjustScheduleTypes {
  id         : number;
  name       : string;
  icon       : string;// Generated by https://quicktype.io
  value      : number;
  description: string;
 }

 export interface PS_SearchResultsPaged {
  results   : IPriceSearchModel[];
  paging    : IPagedList
}

export interface PriceMenuGroup {
  id                 : number;
  name               : string;
  sort               : number;
  image              : string;
  description        : string;
  priceMenuGroupItem : PriceMenuGroupItem[];
}

export interface PriceMenuGroupItem {
  id                 : number;
  ps_MenuGroupID     : number;
  ps_PriceScheduleID : number;
  sort               : number;
  priceSchedules:    IPriceSchedule[];
}

export interface IPriceSearchModel {
  id:                 number;
  allEligible:        boolean;
  allOrderTypes:      boolean;
  allWeekdaysDays:    boolean;
  timeFrameAlways:    boolean;
  allDates:           boolean;
  active:             boolean;
  description      :  string;
  image            :  string;
  name:               string;
  created:            string;
  lastEdited:         string;
  type:               string;
  value:              number;
  pageNumber:         number;
  pageSize:           number;
  currentPage       : number;
}


export interface IDisplayMenu {
  id : number;
  name: string;
  title: string;
  subTitle: string;
  description: string;
  footer: string;
  backcolor: string;
  backcolorOpacity: string;
  menuSections: any;
  template: string;
  css: string;
  logo: string;
  backgroundImage: string;
  interactive: boolean;
  enabled: boolean;
}

export interface IDisplayMenuSearchModel {
  name:                         string;
  pageSize:                     number;
  pageNumber:                   number;
  pageCount:                    number;
  currentPage:                  number;
  lastPage:                     number;
  recordCount:                  number;
}

export interface IDisplayMenuSearchResults{
 results: IDisplayMenu[]
 paging:  IPagedList;
 message: string;
 errorMessage: string;
}

export interface IPriceSchedule {
  id:                 number;
  allEligible:        boolean;
  allOrderTypes:      boolean;
  allWeekdaysDays:    boolean;
  timeFrameAlways:    boolean;
  allDates:           boolean;
  active:             boolean;
  image           :   string;
  description     :   string;
  name:               string;
  created:            string;
  lastEdited:         string;
  type:               string;
  value:              number;
  jsonObject        : string;
  dateFrames:         DateFrame[];
  weekDays:           WeekDay[];
  clientTypes:        ClientType[];
  orderTypes:         OrderType[];
  timeFrames:         TimeFrame[];
  requiredCategories: DiscountInfo[];
  brandDiscounts:     DiscountInfo[];
  categoryDiscounts:  DiscountInfo[];
  itemDiscounts:      DiscountInfo[];
  itemTypeDiscounts:  DiscountInfo[];
  requiredBrands:     DiscountInfo[];
  requiredItemTypes:  DiscountInfo[];
  requiredItems:      DiscountInfo[];

  showMetaTags: boolean;
  showCBD: boolean;
  showTCH: boolean;
  showProof: boolean;
  showABV: boolean;
  showGlueten: boolean;
  showImage: boolean;
  showDescription: boolean;
  showInfo: boolean;

  title: string;
  subTitle: string;
  showAddress: string;

}

export interface DiscountInfo {
  id:       number;
  value:    number;
  quantity: number;
  itemID:   number;
  andOr:    string;
  name:     string;
  allItems: boolean;
  typeID?:  number;
  privateScheduleID: number;
  sort:     number;
  menuItem: IMenuItem;
}

export enum AndOr {
  SampleString4 = "And",
  SampleString5 = "Or",
}

export interface ClientType {
  id:              number;
  priceScheduleID: number;
  clientTypeID:    number;
  name:            string;
  privateScheduleID: number;
}

export interface DateFrame {
  id:              number;
  priceScheduleID: number;
  startDate:       string;
  endDate:         string;
  privateScheduleID: number;
}

export interface OrderType {
  id:              number;
  priceScheduleID: number;
  orderTypeID:     number;
  name:            string;
  privateScheduleID: number;
}

export interface TimeFrame {
  id:              number;
  priceScheduleID: number;
  startTime:       string;
  endTime:         string;
  privateScheduleID: number;
}

export interface WeekDay {
  id:              number;
  priceScheduleID: number;
  name:            string;
  privateScheduleID: number;
}


export interface ItemType {
  id:             number;
  name:           string
}

// Generated by https://quicktype.io

// export interface IPriceSchedule {
//   id:                 number;
//   allEligible:        boolean;
//   allOrderTypes:      boolean;
//   allWeekdaysDays:    boolean;
//   timeFrameAlways:    boolean;
//   allDates:           boolean;
//   active:             boolean;
//   name:               string;
//   created:            string;
//   lastEdited:         string;
//   type:               string;
//   value:              number;
//   dateFrames:         DateFrame[];
//   weekDays:           WeekDay[];
//   clientTypes:        ClientType[];
//   orderTypes:         OrderType[];
//   timeFrames:         TimeFrame[];
//   requiredCategories: DiscountInfo[];
//   brandDiscounts:     DiscountInfo[];
//   categoryDiscounts:  DiscountInfo[];
//   itemDiscounts:      DiscountInfo[];
//   itemTypeDiscounts:  DiscountInfo[];
//   requiredBrands:     DiscountInfo[];
//   requiredItemTypes:  DiscountInfo[];
//   requiredItems:      DiscountInfo[];
// }

// export interface DiscountInfo {
//   id:       number;
//   value:    number;
//   quantity: number;
//   itemID:   number;
//   andOr:    string;
//   name:     string;
//   allItems: boolean;
// }

// export interface ClientType {
//   id:              number;
//   priceScheduleID: number;
//   clientTypeID:    number;
// }

// export interface DateFrame {
//   id:              number;
//   priceScheduleID: number;
//   startDate:       string;
//   endDate:         string;
// }

// export interface OrderType {
//   id:              number;
//   priceScheduleID: number;
//   orderTypeID:     number;
// }

// export interface TimeFrame {
//   id:              number;
//   priceScheduleID: number;
//   startTime:       string;
//   endTime:         string;
// }

// export interface WeekDay {
//   id:              number;
//   priceScheduleID: number;
//   name:            string;
// }
