import { Component,  Input,  OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import { AWSBucketService, MenuService,  } from 'src/app/_services';
import { IMenuItem,   }  from 'src/app/_interfaces/menu/menu-products';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subject, Subscription, of } from 'rxjs';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { IClientTable, IPOSOrder, ISite, IUserProfile, ProductPrice } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { AppInitService } from 'src/app/_services/system/app-init.service';
import { TvMenuPriceTierService, IFlowerMenu } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { PriceTierService } from 'src/app/_services/menu/price-tier.service';
import { switchMap } from 'rxjs/operators';
import { PriceTiers } from 'src/app/_interfaces/menu/price-categories';
import { NewItem, POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { AvalibleInventoryResults, IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { MatricesService } from 'src/app/_services/menu/matrices.service';

// https://www.npmjs.com/package/ngx-gallery
// Possible additional info options
// https://levelup.gitconnected.com/help-popup-with-angular-material-cdk-overlay-babc2ab127a

@Component({
  selector: 'app-menuitem',
  templateUrl: './menuitem.component.html',
  styleUrls: ['./menuitem.component.scss'],
})
export class MenuitemComponent implements OnInit, OnDestroy {

    @Input() fileName: string;
    @Output() outputExitForm = new EventEmitter<any>();
    recentAssociations$ : Observable<IMenuItem[]>;
    associations$ : Observable<IMenuItem[]>;

    get fQuantity() { return this.productForm.get("quantity") as UntypedFormControl;}
    get formProduct() { return this.productForm as UntypedFormGroup;}
    get f() { return this.productForm;}
    productForm:            UntypedFormGroup;
    quantity:               number;
    id:                     string;
    action$  : Observable<any>;
    addItem$ : Observable<any>;

    metaTagSearch$   : Observable<any>;
    menuItem :         IMenuItem;
    menuItem$:         Observable<IMenuItem>;
    brand$:            Observable<IClientTable>;

    _order           :   Subscription;
    order            :   IPOSOrder;

    isUserStaff      : boolean;
    roles            : string;
    packagingMaterial: string[];

    packaging        : string;
    portionValue     = ''
    itemNote         : string;

    spinnerMode             = 'determinate';
    @Input() user:          IUserProfile;
    @Input() showCloseButton  : boolean;

    flowerMenu     : IFlowerMenu;
    priceTiers     : PriceTiers
    priceTiersShown:  boolean;
    productPrice    : ProductPrice;
    bucketName      : string;

    childNotifier   : Subject<boolean> = new Subject<boolean>();

    uiHomePage: UIHomePageSettings
    _uiHomePage: Subscription;

    _posDevice: Subscription;
    posDevice: ITerminalSettings
    awsBucketURL
    imageList

    get menuPricesEnabled() {
      const menuItem = this.menuItem;
      if (menuItem?.priceCategories && menuItem?.priceCategories?.productPrices && menuItem?.priceCategories?.productPrices.length>0) {
        return true;
      }
    }

    constructor(
          private uISettingsService : UISettingsService,
          private menuService       : MenuService,
          private router            : Router,
          public route              : ActivatedRoute,
          private sanitizer         : DomSanitizer,
          private _snackBar         : MatSnackBar,
          private fb                : UntypedFormBuilder,
          private siteService       : SitesService,
          private brandService      : ClientTableService,
          private userAuthorization : UserAuthorizationService,
          private orderMethodsService : OrderMethodsService,
          private appInitService    : AppInitService,
          private priceTierService  : PriceTierService,
          private titleService      : Title,
          public  fbProductsService : FbProductsService,
          private tierPriceService  : TvMenuPriceTierService,
          private posOrderItemService: POSOrderItemService,
          private inventoryAssignmentService: InventoryAssignmentService,
          private awsBucket         : AWSBucketService,
          private matricesService   : MatricesService,

         )
    {
      this.roles = localStorage.getItem(`roles`)
      this.isUserStaff = this.userAuthorization.isCurrentUserStaff()
      this.initMenuItemWindow();
      this.subscribeUIHomePage();
    }

    subscribeUIHomePage() {
      try {
        this._uiHomePage = this.uISettingsService.homePageSetting$.subscribe(data => {
          if (data) {
            this.uiHomePage = data;
          }
        })
      } catch (error) {

      }

      try {
        this._posDevice = this.uISettingsService.posDevice$.subscribe(data => {
          this.posDevice = data;
        })
      } catch (error) {

      }
    }

    initMenuItemWindow() {
      const site = this.siteService.getAssignedSite();
      this.tierPriceService.tierFlowerMenu$.pipe(
        switchMap( data => {
          if (data) {
            this.flowerMenu = data;
            return  this.priceTierService.getPriceTier(site,  data.priceTierID)
          }
          return EMPTY
          }
        )).subscribe(data => {
          if (data) {
            console.log('assigned Tier Flower Menu')
            this.priceTiers = data;
            this.priceTiersShown = true
          }
      })

      this.menuService.currentMeuItem$.subscribe( data=> {
        if (data) {
          this.menuItem = data;
          this.setMenuItem(data)
          return
        }
        this.getItem(this.id);
      })

      if ( this.route.snapshot.paramMap.get('id') ) {
        this.id = this.route.snapshot.paramMap.get('id');
        this.getItem(this.id);
      }

    }

    //   this.tvMenuPriceTierService.updateTierFlowerMenu(flower)
    // updateTier(tier: ITVMenuPriceTiers){
    //   this._tier.next(tier)
    // }

    // updateTierFlowerMenu(tier: IFlowerMenu){
    //   this._tierFlowerMenu.next(tier)
    // }

    async ngOnInit() {
      this.awsBucketURL = await this.awsBucket.awsBucketURL();
      this.quantity = 1
      this.initProductForm();
      this.initSubscriptions();
      this.bucketName =   await this.awsBucket.awsBucket();
    };

    initProductForm() {
      this.productForm = this.fb.group({
        quantity: ['1'],
        itemNote: ['']
      });
    }

    ngOnDestroy(): void {
      if (this._order) {  this._order.unsubscribe(); }
      if (this._uiHomePage) { this._uiHomePage.unsubscribe()}
      this.menuService.updateCurrentMenuItem(null);
      this.inventoryAssignmentService.updateAvalibleInventoryResults(null)
      this.tierPriceService.updateTierFlowerMenu(null);
      this.tierPriceService.updateTier(null)
      this.priceTiers = null;
      this.flowerMenu = null //   : IFlowerMenu;
      this.productPrice = null;
    }

    initSubscriptions() {
      try {
        this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
          this.order = data
        })
      } catch (error) {
      }
    }

    getNotes() {
      let notes = ''
      if (this.productForm) {
        notes = this.productForm.controls['itemNote'].value;
      }

      if (this.portionValue) {
        notes = `${notes} ${this.portionValue}`
      }
      return notes
    }

    addItemWithPrice(event) {
      if (event) {
        this.productPrice = event;
        this.addItemToOrder()
      }
    }

    setItemPrice(event) {
      if (event) {
        this.productPrice = event;
      }
    }

    addItemToOrder() {
      let quantity = this.productForm.controls['quantity'].value
      if (!quantity) {  quantity = 1  }
      const site = this.siteService.getAssignedSite()

      this.addItem$ = this.orderMethodsService.addItemToOrderObs(this.order, this.menuItem,
                                                                  quantity, 0, null,  this.productPrice).pipe(switchMap(data => {
        const notes = this.getNotes();
        if (!data) {
          this.siteService.notify(`Error ${data.message}`,'close', 60000, 'red' )
          return of(null)
        }

        const item = { id: +data.posItem.id, modifierNote: notes};
        if (notes && notes != '' ) {
          const items =  data.order.posOrderItems
          if (items.length > 0) {
            data.order.posOrderItems[items.length-1].modifierNote = notes
            this.orderMethodsService.updateOrder(data.order)
          }
          return this.posOrderItemService.setModifierNote(site, item)
        }
        return of(data)
        }
      )).pipe(switchMap(data => {
        return of(data)
      }))
    }

    getQuantity() {
      if (this.quantity == 0 || !this.quantity) { this.quantity = 1}
      return this.quantity
    }

    validateUser() {
      return this.userAuthorization.validateUser();
    }

    async addItemWithTierPrice(event) {

      let newItem = event as NewItem;
      const valid = this.validateUser();
      if (!valid) { return }

      if (!event) {
        this.notifyEvent('No item found.', 'Error')
        return
      }

      if (!newItem) { return }

      const menuItem = this.menuItem;

      const quantity       = +newItem.quantity * +newItem.weight;
      this.quantity        = quantity;
      const lastQuantity = quantity;
      newItem.quantity     = this.getQuantity();

      console.log('quantity', lastQuantity, newItem.quantity)

      const stockRequired = this.getIsStockRequired(menuItem);
      const stockAvalible = this.validateInventoryRequirement(menuItem,quantity);

      if (!stockRequired && menuItem.barcode) {
        const  site      = this.siteService.getAssignedSite();
        console.log(' newItem.quantity',  newItem.quantity)
        await  this.orderMethodsService.scanBarcodeAddItem(menuItem.barcode ,  newItem.quantity, null)
        return
      }

      if (this.inventoryAssignmentService && this.inventoryAssignmentService.avalibleInventoryResults) {
        const data = this.inventoryAssignmentService.avalibleInventoryResults;
        if (data) {
          if (data.results && data.results.length>0) {
            const inventory = this.getAvalibleInventory(data, quantity)
            if (inventory && inventory.packageCountRemaining >0 ) {
              newItem.barcode  = inventory.sku;
              newItem          = this.setItemValuesFromInput(newItem)
              const  site      = this.siteService.getAssignedSite();
              const addResult =  this.orderMethodsService.scanBarcodeAddItem(newItem.barcode , quantity, null)
              return
            }
          }
        }
      }

      this.notifyEvent('Inventory not avalible. Please try a different quantity', 'Failed')
    }

    setItemValuesFromInput(newItem: NewItem) : NewItem {
      newItem.itemNote = this.itemNote;
      return newItem
    }

    getIsStockRequired(menuItem : IMenuItem) {
      if (menuItem && menuItem.itemType && menuItem.itemType.requireInStock) {
       return true
      }
      return false
    }

    validateInventoryRequirement(menuItem: IMenuItem, quantity: number) {

      let stockRequired = this.getIsStockRequired(menuItem);
      if ( this.inventoryAssignmentService && this.inventoryAssignmentService.avalibleInventoryResults) {
        const data = this.inventoryAssignmentService.avalibleInventoryResults;
        if (!data && stockRequired) {
          this.notifyEvent('Inventory not avalible. Please try a different quantity', 'Failed')
          return false
        }

        if (data) {
          const inventory = this.getAvalibleInventory(data, quantity)
          if (!inventory || (inventory.packageCountRemaining == 0 || inventory.packageCountRemaining < 0) ) {
            this.notifyEvent('Inventory not avalible. Please try a different quantity', 'Failed')
          }
          return true
        }
      }
      return false
    }

    getAvalibleInventory(inv: AvalibleInventoryResults, quantityRequested: number) : IInventoryAssignment {
      let inventory = {} as IInventoryAssignment;
      if (inv && inv.results){
        console.log(inv.results)
        inv.results.forEach( data => {
          if (data) {
            if (data.packageCountRemaining > quantityRequested) {
              inventory = data;
              return
            }
          }
        })
      }
      return inventory;
    }

    onCancel() {
      // this.dialogRef.close();
    }

    changeQuantity(event) {

      this.quantity = event // this.quantity + event;
      return;
      this.quantity = this.quantity + event;
      if (this.quantity < 0) { this.quantity = 1}
      this.productForm = this.fb.group({
        quantity: this.quantity
      });
      this.quantity = this.productForm.controls['quantity'].value;
    }

    getItem(id: any) {
      const site     = this.siteService.getAssignedSite();
      if (id && (id != null && id != undefined)) {
        const menuItem$ = this.menuService.getMenuProduct(site, id)
        menuItem$.subscribe(data => {
            if (data) {
              this.setMenuItem(data)
            }
          }
        )
      }
    };

    refreshRecentAssociations(site: ISite) {
      if (this.menuItem) {
        this.recentAssociations$ = this.menuService.recentAssociationsWithProduct(site, this.menuItem.id, 230)
    }
    }

    metaTagRefresh(event) {

      let items = []
      if (event && event.length>0) {
        event.forEach(data => {   items.push(data.name)  })
        const site = this.siteService.getAssignedSite()
        this.metaTagSearch$ = this.menuService.metaTagSearch(site, items).pipe(switchMap(data => {
          return of(data)
        }))
      } else {
        this.metaTagSearch$  = null;
      }

    }

    refreshAssociations(site: ISite) {
      if (this.menuItem) {
        this.associations$ = this.matricesService.listAssociations(site, this.menuItem.id)
      }
    }

    setMenuItem(menuItem: IMenuItem) {
      if (menuItem) {
        this.menuItem = menuItem;
        const site     = this.siteService.getAssignedSite();
        this.imageList = this.awsBucket.convertToArrayWithUrl(menuItem.urlImageMain, this.awsBucketURL);

        this.refreshRecentAssociations(site);
        this.refreshAssociations(site);

        this.titleService.setTitle(`${this.menuItem.name} by ${this.appInitService.company}`)
        if (menuItem.brandID) {
          this.brand$ = this.brandService.getClient(site, menuItem.brandID)
        }
        this.packagingMaterial = this.menuService.getPackagingMaterialArray(menuItem)

        if (menuItem.priceCategories &&  menuItem.priceCategories.productPrices && menuItem.priceCategories.productPrices.length>0 ) {
          const tier = menuItem.priceCategories.productPrices[0].priceTiers;
          this.priceTiers = tier
        }
      }
    }

    async addItemByCode(item) {
      if (item) {
       await   this.orderMethodsService.scanBarcodeAddItem(item.sku, 1, {packaging: this.packaging, portionValue: this.portionValue} )
      }
    }

    addItemByCodeOBS(item) {
      if (item) {
        this.action$ = this.orderMethodsService.scanBarcodeAddItemObservable(item.barcode, item.quantity,
              {packaging: this.packaging, portionValue: this.portionValue}, this.orderMethodsService.assignPOSItems )
      }
    }

    goBackToList() {
      try {
        this.router.navigate(["productlist"]);
      } catch (error) {
        console.log(error)
      }
    }

    exit() {
      console.log("clicked exit")
      this.outputExitForm.emit(true)
    }

    sanitize(html) {
      return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    notifyEvent(message: string, action: string) {
      this._snackBar.open(message, action, {
        duration: 2000,
        verticalPosition: 'top'
      });
    }

  }

