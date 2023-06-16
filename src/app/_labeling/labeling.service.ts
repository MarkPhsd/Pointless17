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

  constructor() { }
}
