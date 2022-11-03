import { Component,  Input,  OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import {  MenuService, OrdersService } from 'src/app/_services';
import { IMenuItem,   }  from 'src/app/_interfaces/menu/menu-products';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subject, Subscription } from 'rxjs';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location} from '@angular/common';
import { IClientTable, IPOSOrder, IUserProfile } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { AppInitService } from 'src/app/_services/system/app-init.service';
import { TvMenuPriceTierService, IFlowerMenu } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { PriceTierService } from 'src/app/_services/menu/price-tier.service';
import { switchMap } from 'rxjs/operators';
import { PriceTiers } from 'src/app/_interfaces/menu/price-categories';
import { NewItem } from 'src/app/_services/transactions/posorder-item-service.service';
import { AvalibleInventoryResults, IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';

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

    get fQuantity() { return this.productForm.get("quantity") as FormControl;}
    get formProduct() { return this.productForm as FormGroup;}
    get f() { return this.productForm;}
    productForm:            FormGroup;
    quantity:               number;
    id:                     string;

    menuItem:               IMenuItem;
    menuItem$:              Observable<IMenuItem>;
    brand$:                 Observable<IClientTable>;

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

    flowerMenu   : IFlowerMenu;
    priceTiers   : PriceTiers
    priceTiersShown: boolean;

    childNotifier : Subject<boolean> = new Subject<boolean>();

    constructor(
          private menuService       : MenuService,
          private router            : Router,
          public route              : ActivatedRoute,
          private sanitizer         : DomSanitizer,
          private orderService      : OrdersService,
          private _snackBar         : MatSnackBar,
          private fb                : FormBuilder,
          private siteService       : SitesService,
          private brandService      : ClientTableService,
          private location          : Location,
          private userAuthorization : UserAuthorizationService,
          private orderMethodsService : OrderMethodsService,
          private appInitService    : AppInitService,
          private priceTierService  : PriceTierService,
          private titleService     : Title,
          private tierPriceService  : TvMenuPriceTierService,
          private inventoryAssignmentService: InventoryAssignmentService,

         )
    {
      this.roles = localStorage.getItem(`roles`)
      this.isUserStaff = this.userAuthorization.isCurrentUserStaff()
      this.initMenuItemWindow();
    }

    initMenuItemWindow() {
      const site = this.siteService.getAssignedSite();

      console.log(this.id, this.menuItem)

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
      this.quantity = 1
      this.initProductForm();
      this.initSubscriptions();
    };


    initProductForm() {
      this.productForm = this.fb.group({
        quantity: ['1'],
        itemNote: ['']
      });
    }

    ngOnDestroy(): void {
      if (this._order) {  this._order.unsubscribe(); }
      this.menuService.updateCurrentMenuItem(null);
      this.inventoryAssignmentService.updateAvalibleInventoryResults(null)
      this.tierPriceService.updateTierFlowerMenu(null);
      this.tierPriceService.updateTier(null)
      this.priceTiers = null;
      this.flowerMenu = null //   : IFlowerMenu;
    }

    initSubscriptions() {
      try {
        this._order = this.orderService.currentOrder$.subscribe( data => {
          this.order = data
        })
      } catch (error) {
      }
    }

    async addItemToOrder() {
      // if (this.order) {
        this.orderMethodsService.addItemToOrder(this.order, this.menuItem, this.quantity)
      // }
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

      const quantity       = +newItem.quantity * newItem.weight;
      newItem.quantity     = this.getQuantity();

      const stockRequired = this.getIsStockRequired(menuItem);
      const stockAvalible = this.validateInventoryRequirement(menuItem,quantity);

      if (!stockRequired && menuItem.barcode) {
        const  site      = this.siteService.getAssignedSite();
        await  this.orderMethodsService.scanBarcodeAddItem(menuItem.barcode , quantity, null)
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

    changeQuantity(quantity) {
      if (quantity == -1) { if (this.quantity == 1) { return  } }
      this.quantity = this.quantity + quantity;
      this.productForm = this.fb.group({
        quantity: this.quantity
      });
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

    setMenuItem(menuItem: IMenuItem) {
      if (menuItem) {
        this.menuItem = menuItem;
        const site     = this.siteService.getAssignedSite();
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

    addItemByCode(item) {
      if (item) {
        this.orderMethodsService.scanBarcodeAddItem(item.sku, 1, {packaging: this.packaging, portionValue: this.portionValue} )
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
      // this.location.back();
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

