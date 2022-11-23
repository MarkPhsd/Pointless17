import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IPromptSubResults, MenuSubPromptSearchModel, PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import {  PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { MenuItemsSelected, PromptSubGroups, SelectedPromptSubGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPromptGroup, PromptMenuItem } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptWalkThroughService } from 'src/app/_services/menuPrompt/prompt-walk-through.service';
import { of, Subscription, switchMap } from 'rxjs';
import { AWSBucketService } from 'src/app/_services';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { OrdersService } from 'src/app/_services/transactions/orders.service';
import { MenuService } from 'src/app/_services/menu/menu.service';
import { Observable } from 'rxjs';

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

  bucket$ : Observable<any>;
  menuItem$: Observable<MenuItemsSelected>;
  newItem$ : Observable<MenuItemsSelected>;
  removeItem$: Observable<MenuItemsSelected>;

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

   ngOnInit() {
    this.intSubscriptions();
    this.bucket$ = this.awsBucket.getAWSBucketObservable().pipe(
      switchMap(data => {
        this.bucketName =  data.preassignedURL;
        if (this.promptMenuItem.prompt_Products.name) {
          this.imageURL = this.getItemSrc(this.promptMenuItem.prompt_Products)
          return of(data)
        }
      })
    )
  }

  getItemSrc(prompt_Products) {
    if (!prompt_Products || !prompt_Products.urlImageMain) {
      return this.awsBucket.getImageURLPath(this.bucketName, "placeholderproduct.jpg")
    }
    return this.awsBucket.getImageURLPath(this.bucketName, this.promptMenuItem.prompt_Products.urlImageMain)
  }

  //promptMenuItem.prompt_Products.name
  validateAddingItem(): IPromptGroup {
    return   this.promptWalkService.canItemBeAdded( this.orderPromptGroup, this.index, this.subGroupInfo)
  }

  removeItem() {
    let orderPromptGroup = this.validateAddingItem();
    if (!orderPromptGroup) { return }
    const currentSubPrompt = orderPromptGroup.selected_PromptSubGroups[this.index]
    this.removeItem$ =  this.getMenuItemToApply().pipe(switchMap(
      data => {
        if (data) {
          currentSubPrompt.promptSubGroups.itemsSelected.push(data)
          orderPromptGroup.selected_PromptSubGroups[this.index] = currentSubPrompt
          this.promptWalkService.updatePromptGroup(orderPromptGroup)
        }
        return of(data)
      }
    ))
  }

  addItem() {

    // if (!this.menuItem) {
    //   this.orderService.notificationEvent('No menu item.', 'Info')
    //   return;
    // }

    this.orderPromptGroup = this.promptWalkService.initPromptWalkThrough(this.order, this.promptGroup)

    // console.log('orderPromptGroup', this.orderPromptGroup);
    //can item be added to this sub group.
    if (!this.orderPromptGroup) { this.orderPromptGroup = {} as IPromptGroup}

    let orderPromptGroup = this.validateAddingItem();
    // console.log('init group', orderPromptGroup);

    if (!orderPromptGroup) {
      this.orderService.notificationEvent('No prompt group assigned..', 'Info')
      return
    }

    console.log('item', orderPromptGroup.selected_PromptSubGroups[this.index].promptSubGroups)
    const currentSubPrompt = orderPromptGroup.selected_PromptSubGroups[this.index].promptSubGroups

    if (currentSubPrompt.quantityMet) {
      this.orderService.notificationEvent('Quantity already met moving on.', 'Info')
      // console.log('Quantity already met moving on ')
      this.nextStep()
      return
    }

    // then we can add the item including the reference of the item.
    // const item = await this.getMenuItemToApply();
    this.newItem$ = this.getMenuItemToApply().pipe(
      switchMap(data => {
        if (data) {
          if (!currentSubPrompt.itemsSelected) {
            currentSubPrompt.itemsSelected = [] as MenuItemsSelected[]
          }
          currentSubPrompt.itemsSelected.push(data)
          orderPromptGroup.selected_PromptSubGroups[this.index].promptSubGroups.itemsSelected = currentSubPrompt.itemsSelected;
          this.promptWalkService.updatePromptGroup(orderPromptGroup)
        }
        //do check again after item has been added.
        orderPromptGroup = this.validateAddingItem();
        if (!orderPromptGroup) { return }
        if (currentSubPrompt.quantityMet) {
          // console.log('add new item, quantity met')
          this.nextStep()
        }
        return of(data)
      })
    )
  }



  getMenuItemToApply(): Observable<MenuItemsSelected> {

    if (this.promptMenuItem) {
        const site = this.siteService.getAssignedSite();
        const menuItemsSelected    = {} as MenuItemsSelected
        return this.menuService.getMenuItemByID(site, this.promptMenuItem.menuItemID ).pipe(switchMap(data => {
          menuItemsSelected.menuItem = data;
          menuItemsSelected.price    = data.retail;
          menuItemsSelected.quantity = 1
          this.menuItem = data;
          return of(menuItemsSelected);
        })
      )
    }
    return of(null);
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
    // console.log('next step')
    // this.outputNextStep.emit('true')
    this.promptWalkService.nextStep()
  }

  prevStep() {
    // console.log('prev step')
    // this.outputPrevStep.emit('true')
    this.promptWalkService.previousStep()
  }
}
