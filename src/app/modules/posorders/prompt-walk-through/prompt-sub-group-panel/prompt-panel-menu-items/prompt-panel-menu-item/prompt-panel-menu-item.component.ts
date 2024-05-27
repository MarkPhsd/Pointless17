import { Component, OnInit, Input, Output, EventEmitter, TemplateRef, ViewChild} from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { MenuItemsSelected, PromptSubGroups } from 'src/app/_interfaces/menu/prompt-groups';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPromptGroup, PromptMenuItem } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptWalkThroughService } from 'src/app/_services/menuPrompt/prompt-walk-through.service';
import { of, Subscription, switchMap } from 'rxjs';
import { AWSBucketService } from 'src/app/_services';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { OrdersService } from 'src/app/_services/transactions/orders.service';
import { MenuService } from 'src/app/_services/menu/menu.service';
import { Observable } from 'rxjs';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
interface itemOption {
  name: string;
  quantity: number;
}
@Component({
  selector: 'prompt-panel-menu-item',
  templateUrl: './prompt-panel-menu-item.component.html',
  styleUrls: ['./prompt-panel-menu-item.component.scss']
})

export class PromptPanelMenuItemComponent implements OnInit {
  @ViewChild('promptMenuItemView')     promptMenuItemView: TemplateRef<any>;
  menuItem                  : IMenuItem;
  @Input() phoneDevice: boolean;
  @Input() promptMenuItem   : PromptMenuItem;
  @Input() subGroupInfo     : PromptSubGroups;
  @Input() index            : number; //this is not the index of the menu item, but of it's parent.
  @Input() itemOption       = 1;
  @Output() outputNextStep = new EventEmitter();
  @Output() outputPrevStep = new EventEmitter();
  @Output() resetItemOption = new EventEmitter();
  bucketName       : string;
  imageURL         : string;
  chosenCount      : string;

  posDevice$             : Observable<ITerminalSettings>;
  posDevice              : ITerminalSettings;

  styleMatCard     : string
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
  isStaff= this.userAuthorizationService.isStaff;
  uiHomePage: UIHomePageSettings;
  androidApp  = this.platformService.androidApp;
  isApp = this.platformService.isApp();

  uiHomePage$ = this.uiSettingService.UIHomePageSettings.pipe(switchMap(data => {
    this.uiHomePage = data;
    return of(data)
  }));

  getposDeviceSettings() {
    this.posDevice = this.uiSettingService._posDevice.value
    if (!this.posDevice) {
      const device = localStorage.getItem('devicename')
      this.posDevice$ =  this.uiSettingService.getPOSDevice(device).pipe(
        switchMap(data => {
          this.uiSettingService.updatePOSDevice(data)
          this.posDevice = data;
          return of(data)
      }));
    }
  }


  intSubscriptions() {

    this.getposDeviceSettings();

    this._order = this.orderMethodsService.currentOrder$.subscribe(data => {
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

  get matCardSytleValue() {
    if (this.phoneDevice ) {
      return 'height:125px;'
    }
    return ''
  }

  constructor(
     private promptGroupService        : PromptGroupService,
     private orderService              : OrdersService,
     public orderMethodsService       : OrderMethodsService,
     private promptWalkService        : PromptWalkThroughService,
     private posOrderItemService      : POSOrderItemService,
     private siteService              : SitesService,
     private menuService              : MenuService,
     private awsBucket                : AWSBucketService,
     private platformService          : PlatformService,
     private userAuthorizationService: UserAuthorizationService,
     private uiSettingService: UISettingsService,
     ) { }

   ngOnInit() {
    this.intSubscriptions();
    this.bucket$ = this.awsBucket.getAWSBucketObservable().pipe(
      switchMap(data => {
        this.bucketName =  data.preassignedURL;
        if (this.promptMenuItem.prompt_Products?.name) {
          this.imageURL = this.getItemSrc(this.promptMenuItem?.prompt_Products)
          return of(data)
        }
        return of('')
      })
    )
    this.styleMatCard = this.matCardSytleValue
  }

  get promptItemView() {
    if (this.promptMenuItem &&
        this.promptMenuItem.prompt_Products &&
        this.promptMenuItem.prompt_Products.name &&
        this.promptMenuItem.prompt_Products.name != '') {
      return this.promptMenuItemView;
    }
    return null;
  }

  getItemSrc(prompt_Products) {
    if (!prompt_Products || !prompt_Products?.urlImageMain) {
      return this.awsBucket.getImageURLPath(this.bucketName, "placeholderproduct.png")
    }
    return this.awsBucket.getImageURLPath(this.bucketName, this.promptMenuItem.prompt_Products?.urlImageMain)
  }

  //promptMenuItem.prompt_Products.name
  validateAddingItem(): IPromptGroup {
    return this.promptWalkService.canItemBeAdded( this.orderPromptGroup, this.index, this.subGroupInfo)
  }

  removeItem() {
    //!!!
    //should not call validate Adding Item to remove an item.
    let orderPromptGroup = this.validateAddingItem();
    if (!orderPromptGroup) { return }

    const currentSubPrompt = orderPromptGroup.selected_PromptSubGroups[this.index]

    this.removeItem$ =  this.getMenuItemToRemove().pipe(switchMap(
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

  addItem(event) {
    this.newItem$ = this.addItemSub()
  }

  addItemSub(): Observable<MenuItemsSelected> {

    if (!this.index) {
      // this.siteService.notify('No index is assigned', 'Close', 3000, 'yellow')
    }

    const mainItem = this.posItem.unitType

    const quantityItem = this.getQuantity()

    this.orderPromptGroup = this.promptWalkService.initPromptWalkThrough(this.order, this.promptGroup)
    if (!this.orderPromptGroup) { this.orderPromptGroup = {} as IPromptGroup}

    let orderPromptGroup = this.validateAddingItem();

    if (!orderPromptGroup) {
      this.siteService.notify('No prompt group assigned.', 'Close', 3000, 'yellow')
      return of(null)
    }

    const currentSubPrompt = orderPromptGroup.selected_PromptSubGroups[this.index].promptSubGroups
    if (!currentSubPrompt) {
      // this.siteService.notify('Select page to chose items from.', 'Close', 3000, 'yellow')
      return of(null)
    }

    //currentSubPrompt.quantityMet ||
    const itemsSelected =  orderPromptGroup.selected_PromptSubGroups[this.index].promptSubGroups.itemsSelected
    if ((itemsSelected && itemsSelected.length >= currentSubPrompt.maxQuantity)) {
      const lastIndex = orderPromptGroup.selected_PromptSubGroups[this.index].promptSubGroups.itemsSelected.length
      orderPromptGroup.selected_PromptSubGroups[this.index].promptSubGroups.itemsSelected.pop()
    }

    this.resetItemOption.emit('')
    return this.getApplyNewItem(quantityItem.quantity, quantityItem.name, currentSubPrompt, orderPromptGroup)
  }

  getApplyNewItem(value: number, prefix: string, currentSubPrompt: PromptSubGroups, orderPromptGroup: IPromptGroup): Observable<MenuItemsSelected> {

    return this.getMenuItemToApply(currentSubPrompt).pipe(
      switchMap(item => {
        if (item) {

          if (!currentSubPrompt.itemsSelected) {
            currentSubPrompt.itemsSelected = [] as MenuItemsSelected[]
          }

          if (!prefix) { prefix = ''};
          item.quantity = value;
          if (value) {
            item.menuItem.order_Quantity = value.toString();
          }

          if (prefix.toLowerCase() === 'no') {
            item.price = 0;
            item.quantity = value;
            item.menuItem.retail = 0;
          }

          if (currentSubPrompt.freePage) {
            item.price = 0
            item.quantity = value;
            item.menuItem.retail = 0;
            item.unitTypeID = 0;
          }

          if (item.menuItem && item.menuItem.name) {
            item.menuItem.name = `${prefix} ${item.menuItem.name}`.trim()
          } else {
            // console.log('no menu item name');
          }

          currentSubPrompt.itemsSelected.push(item);
          orderPromptGroup.selected_PromptSubGroups[this.index].promptSubGroups.itemsSelected = currentSubPrompt.itemsSelected;

          this.promptWalkService.validateQuantityMet(this.index,
                                                      orderPromptGroup)

          this.promptWalkService.updatePromptGroup(orderPromptGroup);
        }

        //do check again after item has been added.
        orderPromptGroup = this.validateAddingItem();

        if (!orderPromptGroup) { return };

        if (this.phoneDevice && !this.platformService.isApp) {
          this.siteService.notify(item?.menuItem?.name + ' added. See below.', '', 1000, 'green')
        }

        const moveOnQuantity = currentSubPrompt.moveOnQuantity;
        const quantityMet  = currentSubPrompt.quantityMet;
        // console.log('moveOnQuantity', moveOnQuantity)
        // console.log('quantity met', quantityMet)
        // console.log('move on met',  moveOnQuantity == currentSubPrompt.itemsSelected.length)
        if (quantityMet && moveOnQuantity == currentSubPrompt.itemsSelected.length) {
          this.nextStep()
          const lastGroupIndex = orderPromptGroup.selected_PromptSubGroups.length;
          const lastGroup =  orderPromptGroup.selected_PromptSubGroups[lastGroupIndex -1];
          if (lastGroup) {
            if (currentSubPrompt.id == lastGroup?.promptSubGroupsID) {
              if (this.platformService.isApp()){
                this.promptWalkService.updateSavePromptSelection(true)
              }
            }
          }
        }
        return of(item)
      })
    )
  }

  getQuantity() {
    let quantity = 1;
    let item = {} as itemOption;
    if (this.itemOption == 1) {
      item.name = '';
      item.quantity = 1;
    }

    if (this.itemOption == 2) {
      item.name = 'Lft 1/2';
      item.quantity = .5;
    }

    if (this.itemOption == 3) {
      item.name = 'Rt 1/2';
      item.quantity = .5;
    }

    if (this.itemOption == 4) {
      item.name = 'No';
      item.quantity = 0;
    }

    return item;
  }

  applyItem(value) {
  }

  getMenuItemToApply(currentSubPrompt:PromptSubGroups): Observable<MenuItemsSelected> {
    if (this.promptMenuItem) {

        let multiplier = this.posItem.pizzaMultiplier
        if (currentSubPrompt.freePage) {
          multiplier = 0;
        }

        const site = this.siteService.getAssignedSite();
        const menuItemsSelected    = {} as MenuItemsSelected
        return this.menuService.getMenuItemByIDLinked( site, this.promptMenuItem.menuItemID, multiplier ).pipe(switchMap(data => {
          this.menuItem = data;
          menuItemsSelected.menuItem = data;
          menuItemsSelected.price    = data.retail;
          menuItemsSelected.quantity = 1

          if (!currentSubPrompt.freePage) {
            this.menuItem = this.getPrice(this.menuItem);
          }

          if (currentSubPrompt.freePage) {
            this.menuItem.productPrice = null;
            this.menuItem.retail = 0;
            this.menuItem.priceCategories = null;
            menuItemsSelected.price = 0
            menuItemsSelected.quantity = 1;
            menuItemsSelected.menuItem.retail = 0;
            menuItemsSelected.unitTypeID = 0;
          }

          this.menuItem = data;

          return of(menuItemsSelected);
        })
      )
    };
    return of(null);
  }

  getMenuItemToRemove(): Observable<MenuItemsSelected> {
    if (this.promptMenuItem) {
        const site = this.siteService.getAssignedSite();
        const menuItemsSelected    = {} as MenuItemsSelected
        return this.menuService.getMenuItemByIDLinked( site, this.promptMenuItem.menuItemID, 0 ).pipe(switchMap(data => {
          menuItemsSelected.menuItem = data;
          menuItemsSelected.price    = data.retail;
          menuItemsSelected.quantity = 1
          this.menuItem = data;
          this.menuItem = this.getPrice(this.menuItem);
          return of(menuItemsSelected);
        })
      )
    };
    return of(null);
  }

  // priceModifierOptions = [
  //   {id: 1, name: 'product'},
  //   {id: 2, name: 'default modifier'},
  //   {id: 3, name: 'modifier'},
  //   {id: 4, name: 'weighed'},
  // ]

  getPrice(menuItem: IMenuItem) {
    return this.menuService.getModiferPrices(menuItem)
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
    const result = this.promptWalkService.validateQuantityMet(this.promptWalkService.accordionStep, this.orderPromptGroup)
    if (!result || !result.quantityMet) {
      this.siteService.notify(`You must select at least ${result.quantityRequired} from this group`, 'Close', 2000, 'yellow')
      return
    }
    this.promptWalkService.nextStep()
  }

  prevStep() {
    // console.log('prev step')
    // this.outputPrevStep.emit('true')
    this.promptWalkService.previousStep()
  }
}
