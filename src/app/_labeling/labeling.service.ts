import { Injectable } from '@angular/core';
export interface IToolTips {
  id: number;
  name: string;
  value: string;
}
@Injectable({
  providedIn: 'root'
})
export class LabelingService {
 homePageToolTips = [
    {id:0,name:'storeNav', value:'This feature establishes a hierarchy.  Navigation moves from Department, to Category to Subcategory to Items '}
  ] as IToolTips[];

  productFieldTips  = [
    {id:0,name:'perUnitQuantity', value:'Setting this value will be the quantity removed from inventory. Default is 1.'},
    {id:1, name: 'sortValue', value: 'Sorting: Enter a negative value to show at the front.Larger values show up at the end.'},
    {id:2, name: 'materialIcon', value: 'Use material icons from fonts.google.com.'},
    {id:3, name: 'managerRequired', value: 'When this is enabled, the user must be a manager or admin or requires authorization in User types be enabled.'},
  ] as IToolTips[];

  contactInfo =  [
    {id:0,name:'scanning', value:' Enable to not save customer info on ID Scanning (driver license, id etc.).'},
  ]

  transactionInfo =  [
    {id:0,name:'scanning', value:'Grace value allows a budtender to weigh out more than the specified amount, like 3.56 grams, but charge exactly for 3.5 grams..'},
  ]

  constructor() { }
}
