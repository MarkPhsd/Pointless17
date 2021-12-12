import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PriceMenuGroup, PriceMenuGroupItem } from 'src/app/_interfaces/menu/price-schedule';

@Injectable({
  providedIn: 'root'
})
export class PriceScheduleMenuMethodsService {
  ps_MenuGroups     = {} as PriceMenuGroup[];
  ps_MenuGroupItems = {} as PriceMenuGroupItem[];
  constructor(
    private _fb: FormBuilder
  ) { }

  getMenuGroupForm(inputForm) {
    inputForm = this._fb.group({
      id:   [],
      name: [],
      description: [],
      sort: [],
      image: [],
    })
  }

  getGroups() {
    let ps_MenuGroup = {} as PriceMenuGroup
    ps_MenuGroup.id = 1
    ps_MenuGroup.description  = "10:00 AM - 11:00 AM"
    ps_MenuGroup.name = "Breakfast"
    ps_MenuGroup.sort = 3
    this.ps_MenuGroups.push(ps_MenuGroup)
    ps_MenuGroup.id = 2
    ps_MenuGroup.description  = "1:00 pm - 3:00 PM"
    ps_MenuGroup.name = "Lunch"
    ps_MenuGroup.sort = 3
    this.ps_MenuGroups.push(ps_MenuGroup)
    ps_MenuGroup.id = 3
    ps_MenuGroup.description  = "6:00 pm - 8:00 PM"
    ps_MenuGroup.name = "Dinner"
    ps_MenuGroup.sort = 1
    this.ps_MenuGroups.push(ps_MenuGroup)
    return this.ps_MenuGroups
  }
  getItems() {
    this.ps_MenuGroupItems= {} as PriceMenuGroupItem[];
    let ps_MenuGroupItems = {} as PriceMenuGroupItem;
    ps_MenuGroupItems.id = 1
    ps_MenuGroupItems.ps_PriceScheduleID = 13
    this.ps_MenuGroupItems.push(ps_MenuGroupItems)
    ps_MenuGroupItems.id = 2
    ps_MenuGroupItems.ps_PriceScheduleID = 12
    this.ps_MenuGroupItems.push(ps_MenuGroupItems)
    ps_MenuGroupItems.id = 3
    ps_MenuGroupItems.ps_PriceScheduleID = 11
    this.ps_MenuGroupItems.push(ps_MenuGroupItems)
    ps_MenuGroupItems.id = 5
    ps_MenuGroupItems.ps_PriceScheduleID = 10
    this.ps_MenuGroupItems.push(ps_MenuGroupItems)
    ps_MenuGroupItems.id = 6
    ps_MenuGroupItems.ps_PriceScheduleID = 1
    this.ps_MenuGroupItems.push(ps_MenuGroupItems)
    return this.ps_MenuGroupItems
  }



}
