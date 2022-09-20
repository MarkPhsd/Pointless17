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
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { OrdersService } from 'src/app/_services/transactions/orders.service';
import { MenuService } from 'src/app/_services/menu/menu.service';

@Component({
  selector: 'prompt-panel-menu-item',
  templateUrl: './prompt-panel-menu-item.component.html',
  styleUrls: ['./prompt-panel-menu-item.component.scss']
})

export class PromptPanelMenuItemComponent implements OnInit {

  menuItem                  : IMenuItem;

  @Input() promptMenuItem   : PromptMenuItem;
  @Input() subGroupInfo     : PromptSubGroups;
  @Input() index            : number; //this is not the index of the menu item, but of it's parent.

  @Output() outputNextStep = new EventEmitter();
  @Output() outputPrevStep = new EventEmitter();

  bucketName       : string;
  imageURL         : string;
  chosenCount      : string;

  _promptGroup     : Subscription;
  promptGroup      : IPromptGroup

  orderPromptGroup : IPromptGroup;
  _orderPromptGroup: Subscription;

  order            : IPOSOrder;
  _order           : Subscription;

  posItem          : PosOrderItem;
  _posItem         : Subscription;

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
    try {
      this._orderPromptGroup = this.promptWalkService.orderPromptGroup$.subscribe( data => {
        this.orderPromptGroup = data;
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  constructor(
     private promptGroupService        : PromptGroupService,
     private orderService              : OrdersService,
     private promptWalkService        : PromptWalkThroughService,
     private posOrderItemService      : POSOrderItemServiceService,
     private siteService              : SitesService,
     private menuService              : MenuService,
     private awsBucket                : AWSBucketService,
     ) { }

  async ngOnInit() {
    this.intSubscriptions();
    this.bucketName =   await this.awsBucket.awsBucket();
    if (this.promptMenuItem.prompt_Products.name) {
      this.imageURL = this.getItemSrc(this.promptMenuItem.prompt_Products)
    }
  }

  getItemSrc(prompt_Products) {
    if (!prompt_Products || !prompt_Products.urlImageMain) {
      return this.awsBucket.getImageURLPath(this.bucketName, "placeholderproduct.jpg")
    } else {
      return this.awsBucket.getImageURLPath(this.bucketName, this.promptMenuItem.prompt_Products.urlImageMain)
    }
  }

  //promptMenuItem.prompt_Products.name
  getOrderPromptStatus(): IPromptGroup {
    return   this.promptWalkService.canItemBeAdded(
       this.menuItem, this.orderPromptGroup, this.index, this.subGroupInfo
    )
  }

  async removeItem() {
    let orderPromptGroup = this.getOrderPromptStatus();
    if (!orderPromptGroup) { return }
    const currentSubPrompt = orderPromptGroup.selected_PromptSubGroups[this.index]
    const item = await this.getMenuItemToApply();

    if (item) {
      currentSubPrompt.promptSubGroups.itemsSelected.push(item)
      orderPromptGroup.selected_PromptSubGroups[this.index] = currentSubPrompt
      //update subscription
      this.promptWalkService.updatePromptGroup(orderPromptGroup)
    }
  }

  async addItem() {

    this.orderPromptGroup = this.promptWalkService.initPromptWalkThrough(this.order, this.promptGroup)

    if (!this.orderPromptGroup) { this.orderPromptGroup = {} as IPromptGroup}
    //can item be added to this sub group.
    let orderPromptGroup = this.getOrderPromptStatus();
    console.log('orderPromptGroup is it initialized?', orderPromptGroup)

    if (!orderPromptGroup) { return }

    const currentSubPrompt = orderPromptGroup.selected_PromptSubGroups[this.index].promptSubGroups
    console.log('name', currentSubPrompt.name, currentSubPrompt)

    if (currentSubPrompt.quantityMet) {
      console.log('Quantity already met moving on ')
      this.nextStep()
      return
    }

    //then we can add the item including the reference of the item.
    const item = await this.getMenuItemToApply();
    console.log('item - adding item', item)

    if (item) {
      if (!currentSubPrompt.itemsSelected) { currentSubPrompt.itemsSelected = [] as MenuItemsSelected[]}
      currentSubPrompt.itemsSelected.push(item)
      orderPromptGroup.selected_PromptSubGroups[this.index].promptSubGroups.itemsSelected = currentSubPrompt.itemsSelected
      this.promptWalkService.updatePromptGroup(orderPromptGroup)
    }

    //do check again after item has been added.
    orderPromptGroup = this.getOrderPromptStatus();
    if (!orderPromptGroup) { return }
    if (currentSubPrompt.quantityMet) {
      this.nextStep()
      return
    }
  }

 async getMenuItemToApply(): Promise<MenuItemsSelected> {
    if (this.promptMenuItem) {
      const site = this.siteService.getAssignedSite();
      const menuItemsSelected    = {} as MenuItemsSelected
      const menuItem             =  await this.menuService.getMenuItemByID(site,this.promptMenuItem.menuItemID ).pipe().toPromise();
      menuItemsSelected.menuItem = menuItem;
      menuItemsSelected.price    = menuItem.retail;
      menuItemsSelected.quantity = 1
      return menuItemsSelected
    }
    return null
  }

  // menuItem         : IMenuItem;
  // unitTypeID       : number;
  // quantity         : number;
  // price            : number;
  // orderPromptGroup : IPromptGroup;
  //const statusFalseCount = items.filter(e => e.status === 'false').length;
  getCountOfCurrentItem(index: number, orderPromptGroup: IPromptGroup, item: PromptMenuItem) {
    const orderGroup   = this.orderPromptGroup
    const items = orderGroup.selected_PromptSubGroups[index].promptSubGroups.itemsSelected
    const count        = items.filter(e => e.menuItem.id === this.promptMenuItem.id).length;
    if (count != 0) {
      this.chosenCount = count.toString();
    }
  }

  nextStep() {
    console.log('next step')
    this.outputNextStep.emit('true')
  }

  prevStep() {
    console.log('prev step')
    this.outputPrevStep.emit('true')
  }
}
