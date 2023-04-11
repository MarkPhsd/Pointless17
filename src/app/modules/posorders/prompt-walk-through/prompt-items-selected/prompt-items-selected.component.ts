import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IPromptSubResults, MenuSubPromptSearchModel, PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import {  PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { MenuItemsSelected, PromptSubGroups, SelectedPromptSubGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPromptGroup, PromptMenuItem } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptWalkThroughService } from 'src/app/_services/menuPrompt/prompt-walk-through.service';
import { Subscription } from 'rxjs';
import { AWSBucketService } from 'src/app/_services';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { OrdersService } from 'src/app/_services/transactions/orders.service';
import { MenuService } from 'src/app/_services/menu/menu.service';

@Component({
  selector: 'prompt-items-selected',
  templateUrl: './prompt-items-selected.component.html',
  styleUrls: ['./prompt-items-selected.component.scss']
})
export class PromptItemsSelectedComponent implements OnInit {

  bucketName: string;

  _promptGroup     : Subscription;
  promptGroup      : IPromptGroup

  orderPromptGroup : IPromptGroup;
  _orderPromptGroup: Subscription;

  order            : IPOSOrder;
  _order           : Subscription;

  posItem          : PosOrderItem;
  _posItem         : Subscription;

  imageURL : string;

  total             : any;
  _total            : Subscription

  intSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe(data => {
      this.order = data;
    })

    this._posItem = this.posOrderItemService.posOrderItem$.subscribe(data => {
      this.posItem = data;
    })

    this._promptGroup = this.promptGroupService.promptGroup$.subscribe(data => {
      this.promptGroup = data;
    })
    //this should be initialized from selecting an item earlier.
    //the order and the prompt will be assigned.
    //the main item should also be included .
    //we might in the future want to use a multiplier. based on size selection
    this._orderPromptGroup = this.promptWalkService.orderPromptGroup$.subscribe( data => {
      this.orderPromptGroup = data;
    })

    this._total = this.promptWalkService.promptTotal$.subscribe( data => {

      if (this.promptGroup && this.promptGroup.posOrderItem) {
        const item = this.promptGroup.posOrderItem;
        this.total = item.unitPrice + data
        return
      }

      this.total = data;
    })
  }

  constructor(
     private promptGroupService        : PromptGroupService,
     private orderService              : OrdersService,
     private promptWalkService        : PromptWalkThroughService,
     private posOrderItemService      : POSOrderItemService,
     private siteService              : SitesService,
     private menuService              : MenuService,
     private awsBucket                : AWSBucketService,
     ) { }

  async ngOnInit() {
    this.intSubscriptions();
    this.bucketName =   await this.awsBucket.awsBucket();
  }

  getItemSrc(item:IMenuItem) {
    return this.awsBucket.getImageURLFromNameArray(this.bucketName, item.urlImageMain)
  }

  remove(itemIndex: number, index: number) {

    const group = this.orderPromptGroup

    if (group  && group.selected_PromptSubGroups && group.selected_PromptSubGroups[index]) {
      const selected = group.selected_PromptSubGroups[index]
      if (selected &&  selected.promptSubGroups && selected.promptSubGroups.itemsSelected) {
        this.orderPromptGroup.selected_PromptSubGroups[index].promptSubGroups.itemsSelected.splice(itemIndex, 1)
        this.orderPromptGroup.selected_PromptSubGroups[index].promptSubGroups.quantityMet = false;
        this.promptWalkService.updatePromptGroup(this.orderPromptGroup);
      }
    }

  }
  applyNo(itemIndex: number, index: number) {
    const group = this.orderPromptGroup
    if (group  && group.selected_PromptSubGroups && group.selected_PromptSubGroups[index]) {
      const selected = group.selected_PromptSubGroups[index]
      if (selected &&  selected.promptSubGroups && selected.promptSubGroups.itemsSelected) {
        let item =  this.orderPromptGroup.selected_PromptSubGroups[index].promptSubGroups.itemsSelected[itemIndex];
        item.menuItem.name = `No ${item.menuItem.name}`
        item.price = 0;
        item.menuItem.retail = 0;
        this.orderPromptGroup.selected_PromptSubGroups[index].promptSubGroups.itemsSelected[itemIndex] = item
        this.promptWalkService.updatePromptGroup(this.orderPromptGroup);
      }
    }
  }

}
