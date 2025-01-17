// import { Route } from '@angular/router';
import { Observable, Subscription, of, switchMap, } from 'rxjs';
import {  Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild,EventEmitter,
         OnDestroy, TemplateRef, Renderer2,
         ViewChildren,
         QueryList,
         AfterViewInit,
         SimpleChanges,
         OnChanges,
         } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransactionUISettings, UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IServiceType, ISite, ServiceTypeFeatures } from 'src/app/_interfaces';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { AuthenticationService,  } from 'src/app/_services';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { RequestMessageMethodsService } from 'src/app/_services/system/request-message-methods.service';
import { IMenuButtonGroups, MBMenuButtonsService } from 'src/app/_services/system/mb-menu-buttons.service';
import { IonicModule, ItemReorderEventDetail } from '@ionic/angular';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { filter } from 'lodash';
import { PosOrderItemComponent } from '../../pos-order-item/pos-order-item.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { FunctionButtonsListComponent } from 'src/app/modules/admin/settings/function-groups/function-buttons-list/function-buttons-list.component';
import { MessageMenuSenderComponent } from 'src/app/modules/admin/message-editor-list/message-menu-sender/message-menu-sender.component';
import { OrderItemScannerComponent } from 'src/app/shared/widgets/search-list-selectors/order-item-scanner/order-item-scanner.component';

@Component({
  selector: 'pos-order-items',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    PosOrderItemComponent,FunctionButtonsListComponent,
    MessageMenuSenderComponent,IonicModule,
    OrderItemScannerComponent,
  ],
  templateUrl: './pos-order-items.component.html',
  styleUrls: ['./pos-order-items.component.scss'],
})
export class PosOrderItemsComponent implements OnInit, OnDestroy, AfterViewInit,OnChanges {
  serviceTypeOrder : string[]
  private _filteredItems: any[] | null = null;  // Store filtered result
  private _lastItems: any[] = [];               // Cache of last input items

  groupedItems: { [key: string]: PosOrderItem[] } = {};
  // currentItems: PosOrderItem[] = [];
  // @ViewChildren('reorderItem', { read: ElementRef })

  @ViewChildren('reorderGroup', { read: ElementRef }) reorderGroupList: QueryList<ElementRef>;

  items: QueryList<ElementRef>;

  toggleROrder: boolean;
  action$: Observable<any>;
  @ViewChild('posOrderItemsPrepView') posOrderItemsPrepView: TemplateRef<any>;
  @ViewChild('posOrderItemsView') posOrderItemsView: TemplateRef<any>;
  @ViewChild('phoneDeviceView') phoneDeviceView: TemplateRef<any>;

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @Input()  order          : IPOSOrder;
  @Input()  posOrderItems  : PosOrderItem[]
  @Input()  mainPanel      : boolean;
  @Output() outputRemoveItem  = new EventEmitter();
  @Input()  purchaseOrderEnabled: boolean;
  @Input()  disableActions = false;
  @Input()  printLocation  : number;
  @Input()  prepStatus     : boolean;
  @Input()  prepScreen     : boolean;
  @Input()  site:            ISite;
  @Input()  qrOrder        = false;
  @Input()  enableExitLabel : boolean;
  @Input()  userAuths       :   IUserAuth_Properties;
  @Input()  displayHistoryInfo: boolean;
  @Input()  enableItemReOrder  : boolean = false;
  @Input()  phoneDevice: boolean;
  @Input()  cardWidth: string;
  @Input()  isStaff: boolean;
  @Input()  chartWidth: string;
  @Input()  chartHeight: string;
  @Input()  heightCalcStyle  : string;
  @Input()  isUserStaff = false
  displayDevice: boolean;
  heightCacl = ''
  menuButtonList$ : Observable<IMenuButtonGroups>
  printAction$: Observable<any>;
  posDevice       :  ITerminalSettings;
  initStylesEnabled : boolean; // for initializing for griddisplay
  qrCodeStyle = ''
  mainStyle   =  ``
  @Input() deviceWidthPercentage = '100%'
  @Input() panelHeight = '100%';
  orderPrepStyle: string;
  _uiConfig      : Subscription;
  uiConfig       = {} as TransactionUISettings;
  @Input() orderItemsPanel: string;
  smallDevice    : boolean;
  animationState : string;
  _order         : Subscription;
  order$         : Observable<IPOSOrder>
  gridScroller   : '';

  bottomSheetOpen  : boolean ;
  _bottomSheetOpen : Subscription;
  _user: Subscription;
  wideBar          : boolean;
  posName          : string;
  chartCheck: boolean;
  nopadd      = `nopadd`
  conditionalIndex: number;
  _posDevice  : Subscription;
  currentRoute: string;
  androidApp = this.platformService.androidApp;
  _scrollStyle = this.platformService.scrollStyleWide;
  private styleTag: HTMLStyleElement;
  // private customStyleEl: HTMLStyleElement | null = null;
  @ViewChild('scrollDiv') scrollDiv: ElementRef;
  isToggleisDisabled: boolean;
  scanMode : number;
  isAdmin: boolean;

  serviceType  : IServiceType;
  serviceType$ : Observable<IServiceType>;
  sort$: Observable<string>;
  scrollStyle = this.platformService.scrollStyleWide;
  user$ = this.authService.user$.pipe(switchMap(data => {
    if (this.phoneDevice) {
      this._scrollStyle = 'scrollstyle_1'
      this.setScrollBarColor(data?.userPreferences?.headerColor)
    }
    this.setScrollBarColor(data?.userPreferences?.headerColor)
    return of(data)
  }))

  toggleSubscriber$ = this.orderMethodService.togglePOSItemSort$.subscribe(data => {

    // console.log('toggle', datacon)
    this.toggleReorder(data)

  })

  uiHomePage: UIHomePageSettings;

  get isNoPaymentPage() {
    if (this.currentRoute === 'pos-payment') {
      return false
    }
    return true
  }

  setScanMode(number) {
    this.scanMode = number
  }

  get currentItems() {
    if (this.scanMode == 1) {
      return this.posOrderItems.filter(data => {
        if (!data.prepByDate) {
          return data
        }
      })
    }

    if (this.scanMode == 2) {
      return this.posOrderItems.filter(data => {
        if (!data.deliveryByDate) {
          return data
        }
      })
    }
    return this.posOrderItems
  }

  routSubscriber() {

    this.currentRoute = this.router.url.split('?')[0].split('/').pop();
    this.router.events.subscribe(event => {
      if (event.constructor.name === "NavigationEnd") {
        this.currentRoute = this.router.url.split('?')[0].split('/').pop();
      }
    });
  }

  userSubscriber() {
    this._user = this.authService.user$.subscribe(data => {
      if (data?.roles == 'admin' || data?.roles == 'manager') {
        this.isAdmin = true
      }
      if (data?.roles == 'employee') {
        this.isStaff = true
      }
    })
  }

  handleReorder(event: any) {
    event.detail.complete();
    this.updateItemsList();
    return;
  }

  findItemByIndex(index: number): PosOrderItem | undefined {
    let cumulativeIndex = 0;

    for (const group in this.groupedItems) {
      const items = this.groupedItems[group];
      if (index < cumulativeIndex + items.length) {
        return items[index - cumulativeIndex];
      }
      cumulativeIndex += items.length;
    }
    return undefined;
  }

  getGroupNameByIndex(index: number): string | undefined {
    let cumulativeIndex = 0;
    for (const groupName in this.groupedItems) {
      const items = this.groupedItems[groupName];
      cumulativeIndex += items.length;

      if (index < cumulativeIndex) {
        return groupName;
      }
    }
    return undefined;
  }

  logGroupedItems() {
    const itemsList: PosOrderItem[] = [];

    let i = 1; // Product sort order counter
    let  productSortOrder =1
    // Loop through the grouped items and log them
    Object.entries(this.groupedItems).forEach(([groupName, items]) => {
      items.forEach(item => {
        // console.log(`Group: ${groupName}, Product: ${item.productName}, ID: ${item.id}`);
        let posItem = {} as PosOrderItem
        posItem.id = item.id
        posItem.productName = item.productName
        posItem.groupName = groupName,
        productSortOrder = i++,

        itemsList.push(posItem);
      });
    });
    const site = this.siteService.getAssignedSite();
    this.sort$ = this.posOrderItemService.setSortedItems(site, itemsList);
  }


  updateItemsList() {
    const reorderGroupElementRef = this.reorderGroupList.first;
    if (!reorderGroupElementRef) {
      console.error('reorderGroupElementRef is undefined');
      return;
    }
    const reorderGroupElement = reorderGroupElementRef.nativeElement as HTMLElement;

    // Proceed with your traversal and updating logic
    this.traverseReorderGroup(reorderGroupElement);
  }

  traverseReorderGroup(reorderGroupElement: HTMLElement) {
    const itemsArray: PosOrderItem[] = [];
    let sortOrder = 1;
    let currentGroupName = '';

    const childNodes = Array.from(reorderGroupElement.children);

    childNodes.forEach((node: HTMLElement) => {
      if (node.tagName === 'ION-ITEM-DIVIDER') {
        // This is a group header
        currentGroupName = node.innerText.trim();
        // console.log(`Current Group: ${currentGroupName}`);
      } else if (node.tagName === 'ION-ITEM') {
        const itemId = node.getAttribute('data-id');
        const posItem = this.findItemById(itemId);
        if (posItem) {
          posItem.groupName = currentGroupName;
          posItem.productSortOrder = sortOrder++;
          itemsArray.push(posItem);
          // console.log(`Item ID: ${itemId}, New Group: ${currentGroupName}`);
        }
      }
    });

    // console.log('Updated Items:', itemsArray);
    this.saveUpdatedItems(itemsArray);
  }


  findItemById(id: string): PosOrderItem | undefined {
    return this.currentItems.find(item => item.id.toString() === id);
  }

  saveUpdatedItems(items: PosOrderItem[]) {
    const site = this.siteService.getAssignedSite();
    this.sort$ = this.posOrderItemService.setSortedItems(site, items);
  }

  getAllServiceTypes(): string[] {
    if (this.groupedItems) {
      if (this.serviceTypeOrder) {
        const dynamicTypes = Object.keys(this.groupedItems).filter(
          type => !this.serviceTypeOrder.includes(type)
        );
        if (this.serviceTypeOrder) {
          return [...this.serviceTypeOrder, ...dynamicTypes];
        }
      }
    }
    return []
  }


  toggleReorder(option) {
    this.initializeGroups()
    this.isToggleisDisabled = option// !this.isToggleisDisabled;
  }

  get posItemsView() {
    if (this.prepScreen) {
      return this.posOrderItemsPrepView
    }

    if (this.phoneDevice) {
      return this.phoneDeviceView
    }

    if (this.qrOrder) {
      return this.posOrderItemsView
    }

    return this.posOrderItemsView
  }

  initSubscriptions() {
    try {
      this._posDevice = this.uiSettingsService.posDevice$.subscribe(data => {
        this.posDevice = data;
      })
    } catch (error) {

    }

    try {
      this._bottomSheetOpen = this.orderMethodService.bottomSheetOpen$.subscribe(data => {
        if (data) { this.bottomSheetOpen = data }
      })
    } catch (error) {
    }

    if (this.disableActions) {
      this.mainPanel  = true
      this.qrOrder = false
      this.phoneDevice = false
      if (!this.initStylesEnabled) {
        this.initStyles()
        this.initStylesEnabled = true
      }

      if (!this.displayHistoryInfo) {
        this._order = this.orderMethodService.currentOrder$.subscribe( order => {
          this.order = order
          if (this.order?.serviceType != order?.serviceType) {
            this.setServiceTypeGroups()
          }

          if (this.order && this.order.posOrderItems)  {
            this.posOrderItems = this.order.posOrderItems
            this.sortPOSItems(this.currentItems);
          }
        })
      }

    }

    try {
      if (!this.prepScreen && !this.displayHistoryInfo) {
        if (!this.disableActions) {
          this._order = this.orderMethodService.currentOrder$.subscribe( order => {
            this.order = order
            if (!this.serviceType &&  this.order) {
              this.getServiceType()
            }
            if (this.order && this.order.posOrderItems)  {
              this.posOrderItems = this.order.posOrderItems
              this.sortPOSItems(this.currentItems);
            }
          })
        }
      }
    } catch (error) {
    }

    setTimeout(() => {
      this.scrollToBottom();
    }, 200);

  }

  setServiceTypeGroups() {
    if (!this.order) {return [] }
    if (!this.order.service) {return [] }

    // const site = this.siteService.getAssignedSite()
    // this.serviceType$ = this.seviceTypeService.getTypeCached(site, this.order.serviceTypeID).pipe(switchMap(data => {
      const serviceType = this.order.service;
      // console.log('service', serviceType.json)
      if (!serviceType.json) { return [] }
      const props = JSON.parse(serviceType.json) as ServiceTypeFeatures;

      // console.log('props', props, props.metaTags)
      if (!props) {  return []}

      if (!props.metaTags) {  return []}

      this.serviceTypeOrder = this.siteService.convertToArray(props.metaTags);
      // return of(data)
    // }))
  }

  getServiceType() {
    const site = this.siteService.getAssignedSite()
    if (!this.order) {return}
    this.serviceType = this.order.service;
    this.setServiceTypeGroups()
  }

  sendOrder() {
    if (this.remotePrint('printPrep', this.posDevice?.exitOrderOnFire)) {
      return
    }
  }

  setScrollBarColor(color: string, width?:number) {
    if (!width) { width = 25}
    if (!color) {    color = '#6475ac' }
    const css = this.authService.getAppToolBarStyle(color, 25)
    this.styleTag = this.renderer.createElement('style');
    this.styleTag.type = 'text/css';
    this.styleTag.textContent = css;
    this.renderer.appendChild(document.head, this.styleTag);
  }

  sortPOSItems(orderItems: PosOrderItem[]) {
    this.posOrderItems = this.sortItems(orderItems)
    setTimeout(() => {
      this.scrollToBottom();
    }, 200);
  }

  sortItems(items: PosOrderItem[]) {
    let  serviceTypeOrder = this.serviceTypeOrder;

    this.conditionalIndex = 1;
    if (!this.conditionalIndex) { this.conditionalIndex = 1; }

    if (!serviceTypeOrder) { serviceTypeOrder = []}

      // Helper function to get the order index for a service type
      const getServiceTypeOrder = (serviceType: string): number => {
        const index = serviceTypeOrder.indexOf(serviceType);
        return index === -1 ? -Infinity : index; // -Infinity for unknown types to place them at the top
      };


    // Sort based on serviceType and productSortOrder, while retaining original groupings by id and idRef
    items.sort((a, b) => {
      // Ensure items stay grouped together

      if (!this.isToggleisDisabled) {
        return a.productSortOrder - b.productSortOrder;
      }

      if (a.id === a.idRef && b.id === b.idRef) {
        const serviceOrderA = getServiceTypeOrder(a.serviceType);
        const serviceOrderB = getServiceTypeOrder(b.serviceType);

        // Sort by serviceType using predefined order
        if (serviceOrderA !== serviceOrderB) {
          return serviceOrderA - serviceOrderB;
        }

        // If serviceType is the same, sort by productSortOrder
        return a.productSortOrder - b.productSortOrder;
      }


      // If not in the same group, maintain original group order
      return 0;
    });

    // console.log('items', items)

    // Apply original grouping logic and assign conditionalIndex
    items.forEach((item, index) => {
      if (item.id === item.idRef) {
        item.conditionalIndex = this.conditionalIndex++;
      } else {
        item.conditionalIndex = null;
      }
    });

    return items;
  }
  get itemCount(): number {
    // Check if the items have changed to avoid re-filtering
    if (this.currentItems !== this._lastItems) {
      this._filteredItems = this.currentItems.filter(item => item.idRef === item.id);
      this._lastItems = this.currentItems;
    }
    return this._filteredItems?.length || 0;
  }

  // Group items by serviceType and exclude items where idRef != id
  getGroupedItems() {
    const filteredItems = this.currentItems.filter(item => item.id === item.idRef);

    const grouped = filteredItems.reduce((acc, item) => {
      if (!acc[item.serviceType]) {
        acc[item.serviceType] = [];
      }
      acc[item.serviceType].push(item);
      return acc;
    }, {} as { [key: string]: PosOrderItem[] });

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }


  ngOnDestroy(): void {
      if (this._bottomSheetOpen) { this._bottomSheetOpen.unsubscribe()}
      if (this._order) { this._order.unsubscribe()}
      if (this._uiConfig) { this._uiConfig.unsubscribe()}
      this.serviceType = null;
  }

  constructor(  public platformService: PlatformService,
                public  el:            ElementRef,
                public  route:         ActivatedRoute,
                private siteService:  SitesService,
                private uiSettingsService: UISettingsService,
                private orderMethodService: OrderMethodsService,
                private uiSettingService   : UISettingsService,
                private settingService: SettingsService,
                private authService : AuthenticationService,
                private renderer: Renderer2,
                private paymentService: POSPaymentService,
                private navigationService : NavigationService,
                private _bottomSheetService  : MatBottomSheet,
                private messagingService: RequestMessageMethodsService,
                private mbMenuGroupService: MBMenuButtonsService,
                private posOrderItemService: POSOrderItemService,
                private seviceTypeService: ServiceTypeService,
                private router: Router
              )
  {
    this.orderItemsPanel = 'item-list';
    this.isStaff = this.authService.isStaff;

    this.heightCacl ='height:calc(75vh - 300px);padding-bottom:2px;overflow-y:auto;overflow-x:hidden;';

    if (this.heightCalcStyle === 'none') {
      this.heightCacl = '' // this.heightCalcStyle
    }

    if (window.innerWidth < 599) {   this.phoneDevice = true  }
    if (this.checkIfMenuBoardExists()) {
      this.displayDevice = true
      this.nopadd = 'nopadd-display'
    }

    if (this.order) {
      this.setServiceTypeGroups()
    }

    // if (this.pax)
  }


  ngAfterViewInit() {
    // Subscribe to changes in the QueryList
    this.reorderGroupList.changes.subscribe(() => {
      // Handle any updates if necessary
    });
  }



  checkIfMenuBoardExists(): boolean {
    const url = this.router.url;
    return url.includes('menu-board');
  }

  dismiss() {
    this._bottomSheetService.dismiss();
  }

  dismissItemsView(event) {
    this.dismiss();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentItems && this.isToggleisDisabled && this.serviceTypeOrder) {
      this.initializeGroups();
    }
  }

  ngOnInit() {

    this.routSubscriber();

    let uiHomePage = this.uiSettingService.homePageSetting;
    this.wideBar   = true;

    if (!uiHomePage) {
      this.settingService.getUIHomePageSettings().subscribe(data => {
        uiHomePage = data;
        this.uiHomePage = data
      })
    }

    if (uiHomePage) {  this.wideBar = uiHomePage.wideOrderBar  }

    this._uiConfig = this.uiSettingsService.transactionUISettings$.subscribe(data => {
      this.uiConfig = data;
      if (data) {
        const site = this.siteService.getAssignedSite()
        if (data.multiButtonPrepHeader) {
          this.menuButtonList$ = this.mbMenuGroupService.getGroupByID(site,data.multiButtonPrepHeader)
        }
      }
      if (!data) {   this.getTransactionUI()   }
      return of(data)
    })

    this.initSubscriptions();
    this.initStyles();

  }

  itemFilter(item: PosOrderItem): boolean {
    if (item.idRef !== null && item.id !== item.idRef) {
      // Exclude items where idRef is not null and id is not equal to idRef
      return false;
    }
    return true;
  }

  initializeGroups() {
    if (!this.currentItems) return;
    // Filter items based on your filtering criteria
    const filteredItems = this.currentItems.filter(item => this.itemFilter(item));
    // console.log('posOrderItems', this.posOrderItems)
    // console.log(this.currentItems, filteredItems)
    // Collect all unique group names from the items
    const groupNames = Array.from(new Set(filteredItems.map(item => item.groupName || 'Ungrouped')));

    // Initialize the `groupedItems` based on the collected group names
    this.groupedItems = groupNames.reduce((acc, groupName) => {
      acc[groupName] = [];
      return acc;
    }, {} as { [key: string]: PosOrderItem[] });

    // Group items by `groupName`
    filteredItems.forEach(item => {
      const groupName = item.groupName || 'Ungrouped';
      item.groupName = groupName; // Ensure item has the correct groupName
      this.groupedItems[groupName].push(item);
    });

    // Sort items within each group based on `productSortOrder`
    Object.values(this.groupedItems).forEach(items => {
      items.sort((a, b) => a.productSortOrder - b.productSortOrder);
    });

    // console.log('Initialized Groups:', this.groupedItems);
  }


  // initializeGroups() {
  //   // Ensure `serviceTypeOrder` is correctly initialized as an array
  //   const groupNames = Array.isArray(this.serviceTypeOrder) ? this.serviceTypeOrder : [];

  //   // Initialize the `groupedItems` based on `groupNames`
  //   this.groupedItems = groupNames.reduce((acc, type) => {
  //     acc[type] = [];
  //     return acc;
  //   }, {} as { [key: string]: PosOrderItem[] });

  //   if (!this.currentItems) return;

  //   // Filter items based on your filtering criteria
  //   const filteredItems = this.currentItems.filter(item => this.itemFilter(item));

  //   // Group items by `groupName`
  //   filteredItems.forEach(item => {
  //     const groupName = item.groupName || 'Ungrouped';
  //     item.groupName = groupName; // Ensure item has the correct groupName

  //     if (!this.groupedItems[groupName]) {
  //       this.groupedItems[groupName] = [];
  //     }

  //     this.groupedItems[groupName].push(item);
  //   });

  //   // Sort items within each group based on `productSortOrder`
  //   Object.values(this.groupedItems).forEach(items => {
  //     items.sort((a, b) => a.productSortOrder - b.productSortOrder);
  //   });

  //   console.log('Initialized Groups:', this.groupedItems);
  // }

  initStyles() {
    if (this.prepScreen)  {  this.orderItemsPanel = 'item-list-prep';  }
    if (!this.prepScreen) {  this.orderItemsPanel = 'item-list';  }

    if (this.prepScreen) {
      this.deviceWidthPercentage = '265px'
      this.panelHeight = ''
      this.orderPrepStyle = ''
      return;
    }

    this.qrCodeStyle = ''
    this.deviceWidthPercentage = '100%'

    if (!this.mainPanel) {
      this.deviceWidthPercentage = '345px'
    }

    if (!this.mainPanel && !this.qrOrder) {
      this.mainStyle = `main-panel ${this.orderItemsPanel}`
      return;
    }

    if (this.platformService.androidApp) {
      this.panelHeight = ''
      this.heightCacl = 'padding-bottom:2px;overflow-y:auto;overflow-x:hidden;' // this.heightCalcStyle
      return;
    }

    if (this.qrOrder) {
      this.panelHeight = 'calc(100vh - 550px)'
      this.qrCodeStyle = 'qr-style'
      this.mainStyle = `${this.qrCodeStyle} orderItemsPanel`
      return;
    }

    if (this.mainPanel) {
      this.mainStyle = `main-panel orderItemsPanel`
      this.panelHeight = 'calc(100vh - 100px)'
      if (window.innerWidth < 768) {
        this.panelHeight = 'calc(100vh - 200px)'
      }
    }

    if (this.phoneDevice) {
      this.mainStyle = `phone-panel ${this.orderItemsPanel}`
      this.panelHeight = ''
    }

    if (this.platformService.androidApp || this.phoneDevice) {
      this.panelHeight = ''
      this.heightCacl = 'padding-bottom:2px;overflow-y:auto;overflow-x:hidden;' // this.heightCalcStyle
    }

  }

  getTransactionUI() {
    this.uiSettingsService.getSetting('UITransactionSetting').subscribe(data => {
      if (data) {
        const config = JSON.parse(data.text)
        this.uiSettingService.updateUISubscription(config)
      }
    })
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {

    this.smallDevice = false

    if (this.prepScreen) { return }
    this.orderItemsPanel = 'item-list';

    if (window.innerWidth < 768) {
      this.smallDevice = true
    }

    if (window.innerWidth < 500) {
      this.deviceWidthPercentage = '95%'
    }

    // this.getItemHeight()
    //the heights of this panel are what control
    //the inside scroll section.
    //changing this to a dynamic ng-style will allow controlling
    //the absolute relative value of the height, ensuring the proper scroll height.
    if (!this.mainPanel) {
      this.orderItemsPanel = 'item-list-side-panel'
    }

    if (this.mainPanel) {
      this.gridScroller = ''
    }
  }

  removeItemFromList(payload: any) {
    // console.log('remove item from list', payload)
    if (this.order.completionDate && (this.userAuths && this.userAuths.disableVoidClosedItem)) {
      this.siteService.notify('Item can not be voided or refunded. You must void the order from Adjustment in Cart View', 'close', 10000, 'red')
      return
    }
    const index = payload.index;
    const orderItem = payload.item
    this.orderMethodService.removeItemFromList(index, orderItem)
  }

  setAsPrepped(index) {
    if (this.disableActions) {return}
    const item =  this.order.posOrderItems[index]
    if (!item)  { return }
    this.orderMethodService.changePrepStatus(index, item)
  }

  swipeAction(i) {
    if (this.prepScreen) {
      this.setAsPrepped(i)
      return
    }
    this.swipeItemFromList(i)
  }

  swipeItemFromList(index) {
    if (this.disableActions) {return}
    const item =  this.order.posOrderItems[index]
    if (!item)  { return }
    this.action$ = this.orderMethodService.removeItemFromListOBS(index, item);
  }

  startAnimation(state) {
    if (!this.animationState) {
      this.animationState = state
    }
  }

  logItem(item) {
    // console.log(item)
  }

  resetAnimationState() {
    this.animationState = '';
  }

  notifyEvent(message: string, action: string) {
    this.siteService.notify(message, action, 3000)
  }

  getItemHeight() {

    if (this.chartHeight || this.chartCheck) {
      // console.log('chartHeight', this.chartHeight)
      this.chartCheck = true
      if (!this.chartHeight) {
        this.myScrollContainer.nativeElement.style.height  = `${this.chartHeight}`;
      }
      return
    }

    if (window.innerWidth < 599) {   this.phoneDevice = true  }

    if (!this.myScrollContainer) {
      return
    }

    if (this.displayDevice) {
      this.myScrollContainer.nativeElement.style.height  = '';
      return
    }

    if (this.platformService.androidApp) {
      this.myScrollContainer.nativeElement.style.height  = '100%';
      return;
    }

    if (this.heightCalcStyle === 'none') {
      this.myScrollContainer.nativeElement.style.height = '100%'
      return
    }

    if (this.phoneDevice) {
      this.myScrollContainer.nativeElement.style.height = '100%'
      return;
    }
    if (this.smallDevice) {
      this.myScrollContainer.nativeElement.style.height = '100%'
      return
    }

    // console.log('get item height', this.phoneDevice)
    const divTop = this.myScrollContainer.nativeElement.getBoundingClientRect().top;
    const viewportBottom = window.innerHeight;
    const remainingHeight = viewportBottom - divTop;


    if (!this.disableActions) {
      this.myScrollContainer.nativeElement.style.height  = `${remainingHeight-10}px`;
    }
    if (this.disableActions) {
      this.myScrollContainer.nativeElement.style.height  = `${remainingHeight - 50}px`;
    }

  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.myScrollContainer) {
          this.myScrollContainer.nativeElement.scrollTop =
            this.myScrollContainer.nativeElement.scrollHeight;
        }
        this.getItemHeight()
      } catch(err) {
        console.log(err)
      }
    }, 300);
  }

  viewPayment() {
    this.navigationService.makePaymentFromSidePanel(false, this.phoneDevice, this.isStaff, this.order);
    this.dismiss();
  }

  viewCart() {
    this.orderMethodService.toggleOpenOrderBarSub(+this.order.id);
    this.dismiss();
  }

  printOrder() {
    this.remotePrint('printReceipt', false)
  }

  remotePrint(message:string, exitOnSend: boolean) {
    const order = this.order;
    let pass = false
    if (message == 'printReceipt') {
      pass = true
    }
    if (this.posDevice) {
      if (message === 'printPrep') {
        if (this.posDevice?.remotePrepPrint) {
          pass = true
        }
      }
      if (message === 'rePrintPrep') {
        if (this.posDevice?.remotePrepPrint) {
          pass = true
        }
      }
      if (this.posDevice?.remotePrint || pass) {
        const serverName = this.uiConfig.printServerDevice;
        let remotePrint = {message: message, deviceName: this.posDevice.deviceName,
                           printServer: serverName,id: order.id,history: order.history} as any;
        const site = this.siteService.getAssignedSite()
        this.printAction$ =  this.paymentService.remotePrintMessage(site, remotePrint).pipe(switchMap(data => {

          if (data) {
            this.siteService.notify('Print job sent', 'Close', 3000, 'green')
          } else {
            this.siteService.notify('Print Job not sent', 'Close', 3000, 'green')
          }

          if (this.posDevice?.exitOrderOnFire) {
            //then exit the order.
            this.clearOrder()
          }
          return of(data)
        }))
        return true;
      }
    }

    return false
  }

  reSendOrder() {
    if (this.remotePrint('rePrintPrep', this.posDevice?.exitOrderOnFire)) {
      return
    }
  }

  completePrepTypeNotifier(){
    if (this.scanMode == 1 || this.scanMode==2) {
      const order = this.order
      if (order) {

        let message = ''
        if (this.scanMode == 1) {
          message = 'Prep work on order completed.'
        }
        if (this.scanMode == 2) {
          message = 'Driver has confirmed order for delivery.'
        }

        if (!message) { return }


        const item$ =  this.uiSettingService.homePageSetting$.pipe(switchMap(data => {
          const email  = data?.salesReportsEmail ?? data?.administratorEmail
          return   this.messagingService.prepCompleted(order,  message, email )
        })).pipe(switchMap(data => {
          this.siteService.notify("Request Sent", 'close', 2000, 'green')
          return of(data)
        }))

        this.action$ = item$
      }
    }
  }

  trackByFN(_, {id, unitName, unitPrice, quantity,
        modifierNote, serialCode, printed,
        serviceType, taxTotal , wicebt}: IPOSOrderItem): number {
    return id;
  }

  clearOrder() {
    this.orderMethodService.clearOrder()
  }

}


