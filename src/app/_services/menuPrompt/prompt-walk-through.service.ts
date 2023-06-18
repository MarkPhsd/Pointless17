import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { IPromptGroup, PromptSubGroups } from 'src/app/_interfaces/menu/prompt-groups';
import { OrdersService } from '..';
import { POSOrderItemService } from '../transactions/posorder-item-service.service';
import { PromptGroupService } from './prompt-group.service';
import { PromptSubGroupsService } from './prompt-sub-groups.service';

@Injectable({
  providedIn: 'root'
})
export class PromptWalkThroughService {

  private _savePromptSelection       = new BehaviorSubject<boolean>(null);
  public  savePromptSelection$        = this._savePromptSelection.asObservable();

  private _orderPromptGroup    = new BehaviorSubject<IPromptGroup>(null);
  public orderPromptGroup$     = this._orderPromptGroup.asObservable();

  private _promptTotal         = new BehaviorSubject<number>(null);
  public  promptTotal$         = this._promptTotal.asObservable();

  private _accordionStep         = new BehaviorSubject<number>(null);
  public  accordionStep$         = this._accordionStep.asObservable();
  accordionStep : number;

  updateSavePromptSelection(result: boolean) {
    this._savePromptSelection.next(result)
  }

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
    // console.log('updateAccordionStep')
    this.accordionStep = number;
    this._accordionStep.next(number)
  }

  nextStep() {
    // console.log('nextStep')
    if (!this.accordionStep) { this.accordionStep }
    this.accordionStep ++;
    this._accordionStep.next(this.accordionStep)
  }

  previousStep() {
    // console.log('previousStep')
    if (!this.accordionStep) { this.accordionStep = 0 }
    this.accordionStep --;
    this._accordionStep.next(this.accordionStep)
  }

  constructor(private orderService         : OrdersService,
              private OrderItemService     : POSOrderItemService,
              private promptSubService     : PromptGroupService,
              private promptSubGroupService: PromptSubGroupsService
              ) {
    this._accordionStep.next(0)
  }

  //!!!!
  //validates all items and counts in the selections.
  validateSelections(orderPromptGroup: IPromptGroup): string[] {
    return []
  }

  canItemBeAdded(orderPromptGroup: IPromptGroup,
                 index: number,
                 subGroupInfo : PromptSubGroups): IPromptGroup {

    if (!orderPromptGroup) { return null }

    let prompt = orderPromptGroup.selected_PromptSubGroups[index].promptSubGroups

    // console.log('orderPromptGroup', orderPromptGroup)
    // console.log('subGroupInfo', index, subGroupInfo)
    // console.log('prompt', prompt)
    //&& subGroupInfo && prompt.promptSubGroupID == subGroupInfo.id
    if (prompt) {
      prompt.quantityMet = false;

      if (!prompt?.itemsSelected) {
        return orderPromptGroup;
      }

      prompt = this.setQuantityCheck(prompt)

      const itemsCount = +prompt?.itemsSelected?.length;

      if (prompt.moveOnQuantity == itemsCount || prompt.maxQuantityMet ) {
        orderPromptGroup.currentAccordionStep ++;
        this._accordionStep.next(orderPromptGroup.currentAccordionStep);
      }

      orderPromptGroup.selected_PromptSubGroups[index].promptSubGroups = prompt;

    }

    this.updatePromptGroup(orderPromptGroup);
    return orderPromptGroup;
  }

  setQuantityCheck(prompt: PromptSubGroups) {

    if ( prompt.itemsSelected &&
          prompt.itemsSelected.length >= prompt.maxQuantity) {

      if ( prompt.maxQuantity != 0 ) {
        prompt.maxQuantityMet = true;
        prompt.quantityMet = true
        return prompt;
      }

    }

    prompt.maxQuantityMet = false;
    if ( prompt.itemsSelected &&
          prompt.itemsSelected.length != 0 &&
          prompt.minQuantity != 0 &&
          prompt.minQuantity >= prompt.itemsSelected.length ) {

      if ( prompt.minQuantity != 0 ) {
        prompt.quantityMet = true
        return prompt;
      }

    }

    if ( prompt.itemsSelected &&
          prompt.itemsSelected.length != 0 &&
          prompt.moveOnQuantity != 0 &&
          prompt.moveOnQuantity >= prompt.itemsSelected.length ) {

      if ( prompt.moveOnQuantity != 0 ) {
        // console.log('move on quantity reached.')
        prompt.quantityMet = true
        return prompt;
      }

    }

    return prompt;

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
          if (data.promptSubGroups && data.promptSubGroups.itemsSelected) {
            data.promptSubGroups.itemsSelected.forEach( items => {
              total = ( (items.price *100 * items.quantity)/100) + total
            })
          }
        })
      }
    }

    return total;
  }

}

