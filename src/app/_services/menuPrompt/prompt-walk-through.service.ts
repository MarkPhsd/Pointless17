import { Injectable } from '@angular/core';
import { FlexOrderDirective } from '@angular/flex-layout';
import { BehaviorSubject } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IPromptGroup, PromptSubGroups } from 'src/app/_interfaces/menu/prompt-groups';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { OrdersService } from '..';
import { POSOrderItemServiceService } from '../transactions/posorder-item-service.service';
import { PromptGroupService } from './prompt-group.service';
import { PromptSubGroupsService } from './prompt-sub-groups.service';

// export interface OrderPromptGroup {
// 	orderID      : number;
// 	promptGroupID: number;
//   orderItem    : IPOSOrderItem;
//   mainMenuItem : IMenuItem;
// 	prompts	     : OrderPromptSubGroups[];
// }

// export interface OrderPromptSubGroups {
// 	 promptSubGroupID : number;
// 	 items  		      : IMenuItem[];
// 	 minQuantity      : number;
// 	 maxQuantity      : number;
// 	 itemsSelected    : MenuItemsSelected[];
// 	 quantityMet      : boolean;
// }

// export interface MenuItemsSelected {
// 	 menuItem         : IMenuItem;
// 	 unitTypeID       : number;
// 	 quantity         : number;
// 	 price            : number;
// 	 orderPromptGroup : OrderPromptGroup[];s
// }

@Injectable({
  providedIn: 'root'
})
export class PromptWalkThroughService {

  private _orderPromptGroup    = new BehaviorSubject<IPromptGroup>(null);
  public orderPromptGroup$     = this._orderPromptGroup.asObservable();

  private _promptTotal         = new BehaviorSubject<number>(null);
  public  promptTotal$         = this._promptTotal.asObservable();


  private _accordionStep         = new BehaviorSubject<number>(null);
  public  accordionStep$         = this._accordionStep.asObservable();

  updatePromptGroup(orderPromptGroup:  IPromptGroup) {
     this._orderPromptGroup.next(orderPromptGroup);
     if (!orderPromptGroup) {
      this._promptTotal.next(0)
     } else {
      const total =  this.getPromptTotal(orderPromptGroup)
      this._promptTotal.next(total)
    }
  }

  updateAccordionStep(number) {
    this._accordionStep.next(number)
  }

  constructor(private orderService         : OrdersService,
              private OrderItemService     : POSOrderItemServiceService,
              private promptSubService     : PromptGroupService,
              private promptSubGroupService: PromptSubGroupsService
              ) {
                this._accordionStep.next(0)
              }

  canItemBeAdded(item: IMenuItem, orderPromptGroup: IPromptGroup,
                 index: number, subGroupInfo : PromptSubGroups): IPromptGroup {

    let prompt = orderPromptGroup.selected_PromptSubGroups[index].promptSubGroups

    //&& subGroupInfo && prompt.promptSubGroupID == subGroupInfo.id
    if (prompt) {
      prompt.quantityMet = false;

      // currentOrderPrompt.
      if ( prompt.itemsSelected && prompt.itemsSelected.length >= prompt.maxQuantity) {
        if ( prompt.maxQuantity != 0 ) {
          prompt.quantityMet = true
        }
      }

      if ( prompt.itemsSelected &&
           prompt.itemsSelected.length != 0 &&
           prompt.minQuantity != 0 &&
           prompt.minQuantity >= prompt.itemsSelected.length ) {
        if ( prompt.maxQuantity != 0 ) {
          prompt.quantityMet = true
        } else {

        }
      }

      if (!orderPromptGroup.currentAccordionStep) {
        orderPromptGroup.currentAccordionStep = 0;
      }

      if (prompt.quantityMet) {
        // console.log('orderPromptGroup.currentAccordionStep', orderPromptGroup.currentAccordionStep)
        orderPromptGroup.currentAccordionStep ++;
        // console.log('orderPromptGroup.currentAccordionStep ++;', orderPromptGroup.currentAccordionStep)
      }


      orderPromptGroup.selected_PromptSubGroups[index].promptSubGroups = prompt;
      // console.log('item can be added?', prompt.quantityMet ,  prompt)

    }

    console.log('updating prompt group')

    this.updatePromptGroup(orderPromptGroup);
    return orderPromptGroup;

  }

  ///this process initalizes the object  orderPromptGroup {
  ///then subscribes to it. so that it can be used
  initPromptWalkThrough(order: IPOSOrder, promptGroup: IPromptGroup): IPromptGroup {
    let orderPromptGroup =  promptGroup
    orderPromptGroup.orderID = order.id
    return orderPromptGroup
  }

  getPromptTotal(prompt: IPromptGroup): number {

    let total = 0 ;

    if (prompt) {

      if (prompt.selected_PromptSubGroups) {
        prompt.selected_PromptSubGroups.forEach(data => {
          // console.log('getPromptTotal', data)
          if (data.promptSubGroups && data.promptSubGroups.itemsSelected) {
            data.promptSubGroups.itemsSelected.forEach( items => {
              total = items.price + total
            })
          }
        })
      }
    }
    // console.log('getPromptTotal items',total)
    return total;

  }

}

// promptSubGroupID : number;
// items  		      : IMenuItem[];
// minQuantity      : number;
// maxQuantity      : number;
// itemsSelected    : MenuItemsSelected[];
// quantityMet      : boolean;


// export interface SelectedPromptSubGroup {
//   promptGroupsID:    number;
//   promptSubGroupsID: number;
//   id:                number;
//   sortOrder:         number;
//   promptSubGroups:   PromptSubGroups;
// }

// export interface PromptSubGroups {
//   id:              number;
//   name:            string;
//   minQuantity:     number;
//   maxQuantity:     number;
//   moveOnQuantity:  number;
//   created:         string;
//   lastEdited:      string;
//   instructions:    string;
//   image:           string;
//   promptMenuItems: PromptMenuItem[];
// }
