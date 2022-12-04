import { IPrinterLocation } from "src/app/_services/menu/printer-locations.service";
import { IPOSOrder } from "./posorder";


export interface IPrintOrders { 
  location  : IPrinterLocation;
  order     : IPOSOrder 
}