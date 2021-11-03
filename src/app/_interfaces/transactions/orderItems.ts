import { IMenuItem } from "../menu/menu-products";
import { IPOSOrder } from "./posorder";

export interface IProductPostOrderItem {
   menuItem:        IMenuItem;
   purchaseOrder:   IPOSOrder;
}

export interface ItemPricing {

  retail: number;
  unitName: string;
  unitID: number;
  dailySpecial: string;
  timeSpecial: string;

}

