import { Injectable } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { ProducteditComponent} from 'src/app/modules/admin/products/productedit/productedit.component';
import { MatDialog } from '@angular/material/dialog';
import { MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { StrainProductEditComponent } from 'src/app/modules/admin/products/productedit/strain-product-edit/strain-product-edit.component';
import { EditSelectedItemsComponent } from 'src/app/modules/admin/products/productedit/edit-selected-items/edit-selected-items.component';
import { AddItemByTypeComponent } from 'src/app/modules/admin/products/productedit/add-item-by-type/add-item-by-type.component';
import { IPriceCategories, PriceTiers, UnitType } from 'src/app/_interfaces/menu/price-categories';
import { PriceCategoriesEditComponent } from 'src/app/modules/admin/products/pricing/price-categories-edit/price-categories-edit.component';
import { UnitTypeEditComponent } from 'src/app/modules/admin/products/unit-type-list/unit-type-edit/unit-type-edit.component';
import { IPOSOrder, IPOSPayment, PosOrderItem } from 'src/app/_interfaces';
import { ClientTypeEditComponent } from 'src/app/modules/admin/clients/client-types/client-type-edit/client-type-edit.component';
import { ServiceTypeEditComponent } from 'src/app/modules/admin/transactions/serviceTypes/service-type-edit/service-type-edit.component';
import { AdjustItemComponent } from 'src/app/modules/posorders/adjust/adjust-item/adjust-item.component';
import { ItemWithAction } from '../transactions/posorder-item-service.service';
import { MenuPriceSelectionComponent } from 'src/app/modules/menu/menu-price-selection/menu-price-selection.component';
import { IProduct } from 'src/app/_interfaces/raw/products';
import { ItemType } from 'src/app/_interfaces/menu/price-schedule';
import { PaymentMethodEditComponent } from 'src/app/modules/admin/transactions/paymentMethods/payment-method-edit/payment-method-edit.component';
import { IPaymentMethod, PaymentMethodsService } from '../transactions/payment-methods.service';
import { ChangeDueComponent } from 'src/app/modules/posorders/components/balance-due/balance-due.component';
import { AdjustPaymentComponent } from 'src/app/modules/posorders/adjust/adjust-payment/adjust-payment.component';
import { PaymentWithAction } from '../transactions/pospayment.service';
import { PromptGroupEditComponent } from 'src/app/modules/admin/menuPrompt/prompt-groups/prompt-group-edit/prompt-group-edit.component';
import { PromptSubGroupEditComponent } from 'src/app/modules/admin/menuPrompt/prompt-sub-groups/prompt-sub-group-edit/prompt-sub-group-edit.component';
import { PriceTierEditComponent } from 'src/app/modules/admin/products/price-tiers/price-tier-edit/price-tier-edit.component';
import { PSMenuGroupEditComponent } from 'src/app/modules/admin/products/price-schedule-menu-groups/psmenu-group-edit/psmenu-group-edit.component';

export interface IBalanceDuePayload {
  order: IPOSOrder;
  paymentMethod: IPaymentMethod;
  payment: IPOSPayment;
}


@Injectable({
  providedIn: 'root'
})
export class ProductEditButtonService {


  constructor
            (private dialog             : MatDialog,
            private siteService         : SitesService,
            private menuService         : MenuService,
            private paymentMethodService:PaymentMethodsService,
            private itemTypeService     : ItemTypeService,
            ) { }

  // ngOnInit(): void {
  //   console.log('')
  // }

  addItem(productTypeID: number) {
    if (productTypeID) {
      this.openProductEditor(0, productTypeID)
    }
  }

  editTypes(selectedItems: any[]) {

    let dialogRef: any;
    const site = this.siteService.getAssignedSite();

    dialogRef = this.dialog.open(EditSelectedItemsComponent,
      { width:        '500px',
        minWidth:     '500px',
        height:       '550px',
        minHeight:    '550px',
        data   : selectedItems
      },
    )

  }

  openNewItemSelector() {
    let dialogRef: any;
    const site = this.siteService.getAssignedSite();

    dialogRef = this.dialog.open(AddItemByTypeComponent,
      { width:        '825px',
        minWidth:     '400px',
        height:       '625px',
        minHeight:    '625px',
      },
    )
  }


  openPSMenuGroupEditor(id: any) {
    let dialogRef: any;

    dialogRef = this.dialog.open(PSMenuGroupEditComponent,
      { width    : '500px',
        minWidth : '500px',
        height   : '65vh',
        minHeight: '650px',
        data     : id
      },
    )
  }


  async openProductDialog(id: any) {

    let product = {} as IProduct;
    const site = this.siteService.getAssignedSite();
    product = await this.menuService.getProduct(site, id).pipe().toPromise();

    if (product) {
      if (!product.prodModifierType) {
        product.prodModifierType = 1
        await this.menuService.putProduct(site, product.id, product).pipe().toPromise()
      }
    } else {
      product.id = 0
      product.prodModifierType = 1
    }

    this.openProductEditor(product.id,  product.prodModifierType)
  }

  openPromptEditor(id: any) {
    let dialogRef: any;

    dialogRef = this.dialog.open(PromptGroupEditComponent,
      { width:        '500px',
        minWidth:     '500px',
        height:       '65vh',
        minHeight:    '650px',
        data : id
      },
    )
  }


  openPromptSubEditor(id: any) {
    let dialogRef: any;

    dialogRef = this.dialog.open(PromptSubGroupEditComponent,
      { width:        '50vh',
        minWidth:     '500px',
        height:       '65vh',
        minHeight:    '650px',
        data : id
      },
    )
  }

  openPriceEditor(data: IPriceCategories) {
    let dialogRef: any;
    dialogRef = this.dialog.open(PriceCategoriesEditComponent,
      { width:        '75vw',
        minWidth:     '800px',
        height:       '85vh',
        minHeight:    '600px',
        data : data
      },
    )
  }

  openPriceTierEditor(data: PriceTiers) {
    let dialogRef: any;
    dialogRef = this.dialog.open(PriceTierEditComponent,
      { width:        '75vw',
        minWidth:     '800px',
        height:       '85vh',
        minHeight:    '600px',
        data : data
      },
    )
  }

  openUnitTypeEditor(data: UnitType) {
    let dialogRef: any;
    dialogRef = this.dialog.open(UnitTypeEditComponent,
      { width:        '50vw',
        minWidth:     '500px',
        height:       '420px',
        minHeight:    '420px',
        data : data
      },
    )

  }

  async openProductEditor(id: number,
                          productTypeID: number,
                         ) {

    // if ( !id ) { return }
    let  product = {} as IProduct

    let  itemType = {} as IItemType
    const site = this.siteService.getAssignedSite();

    if ( id ) {
      product = await this.menuService.getProduct(site, id ).pipe().toPromise();
      itemType = await this.itemTypeService.getItemType(site, product.prodModifierType).pipe().toPromise();
      if (!itemType)  { itemType = {} as IItemType}
      if (productTypeID == undefined) { itemType.id = 0 }
      console.log('regular person')
      this.openProductEditWindow(product, itemType);
      return
    }

    if (productTypeID != 0) {
       itemType = await this.itemTypeService.getItemType(site, productTypeID).pipe().toPromise();
    }

    if (!itemType) { itemType = {} as IItemType}
    if (!product)  {
      product    = {} as IProduct
      product.id = 0
    }

    if (productTypeID == undefined) { itemType.id = 0 }

    this.openProductEditWindow(product, itemType);

  }

  openChangeDueDialog(payment, paymentMethod, order: IPOSOrder) {

    const payload = {} as IBalanceDuePayload;
    payload.payment = payment
    payload.paymentMethod = paymentMethod
    payload.order = order

    let dialogRef: any;
    dialogRef = this.dialog.open(ChangeDueComponent,
      { width:        '95%',
        minWidth:     '375px',
        height:       '85%',
        minHeight:    '650px',
        data : payload
      },
    )

  }

  openProductEditWindow(product: IProduct, itemType: ItemType) {

    console.log('product ' ,product)
    console.log('itemType ' ,itemType)

    const data = { product, itemType}
    let dialogRef: any;

    switch ( itemType.id ) {

      case 1 :
      case 2 :
      case 3 :
      case 4 :
      case 5 :
      case 6 :
      case 7 :
      case 8 :
      case 9 :
      case 10 :
      case 11 :
      case 12 :
      case 13 :
      case 14 :
      case 15 :
      case 16 :
      case 17:
      case 18 :
      case 19 :
      case 20 :
      case 21 :
      case 22 :
      case 23 :
      case 24 :
      case 25 :
      case 26 :
      case 27:
      case 28 :
      case 29 :
      case 30 :
      case 31 :
      case 32 :
      case 33 :
      case 34 :
      case 35 :
      case 36 :
      case 37:
      case 38 :
      case 39 :
      case 40 :
      case 41 :
      case 42 :
      case 43 :
      case 44 :
      case 45 :
      case 46 :
      case 47:
      case 48 :
      case 49 :
      case 50 :
      case 51 :
      case 52 :
      case 53 :
      case 54 :
      case 55 :
      case 56 :
      case 57 :
      case 58 :
      case 59 :
        dialogRef = this.dialog.open(StrainProductEditComponent,
          { width:        '80vw',
            height:       '650px',
            minHeight:    '745px',
            data : data
          },
        )
        break;
      default:
        {
          dialogRef = this.dialog.open(ProducteditComponent,
            { width:        '80vw',
              minWidth:     '900px',
              maxWidth:     '900px',
              height:       '745px',
              minHeight:    '745px',
              data : data
            },
          )
          break;
          return
        }


    }

  }

  openClientTypeEditor(id: number) {
    let dialogRef: any;
    dialogRef = this.dialog.open(ClientTypeEditComponent,
      { width:        '60vw',
        minWidth:     '800px',
        height:       '60vh',
        minHeight:    '600px',
        data : id
      },
    )
  }

  openServiceTypeEditor(id: number) {
    let dialogRef: any;
    dialogRef = this.dialog.open(ServiceTypeEditComponent,
      { width:        '60vw',
        minWidth:     '800px',
        height:       '60vh',
        minHeight:    '600px',
        data : id
      },
    )
  }

  openPaymentMethodEditor(id: number) {
    let dialogRef: any;
    dialogRef = this.dialog.open(PaymentMethodEditComponent,
      { width:        '60vw',
        minWidth:     '800px',
        height:       '60vh',
        minHeight:    '600px',
        data : id
      },
    )
  }


  openVoidItemDialog(posOrderItem: PosOrderItem ) {
    let dialogRef: any;
    // const site = this.siteService.getAssignedSite();
    // this.menuService.getProduct(site, id).subscribe( data=> {
    //   const productTypeID = data.prodModifierType
    //   this.openProductEditor(id, productTypeID)
      if (posOrderItem) {

        let itemWithAction      = {}  as ItemWithAction;
        itemWithAction.action   = 1;
        itemWithAction.posItem  = posOrderItem;
        itemWithAction.id       = posOrderItem.id
        const id = posOrderItem.id;
        dialogRef = this.dialog.open(AdjustItemComponent,
          { width:        '450px',
            minWidth:     '450px',
            height:       '600px',
            minHeight:    '600px',
            data : itemWithAction
        })
      }

  }

  openVoidPaymentDialog(payment: IPOSPayment ) {
    let dialogRef: any;
    // const site = this.siteService.getAssignedSite();
    // this.menuService.getProduct(site, id).subscribe( data=> {
    //   const productTypeID = data.prodModifierType
    //   this.openProductEditor(id, productTypeID)
      const site = this.siteService.getAssignedSite();

      if (payment) {

        let action      = {}  as PaymentWithAction;
        action.action   = 1;
        action.payment  = payment;
        action.id       = payment.id

        let method = {} as IPaymentMethod
        const method$ = this.paymentMethodService.getCacheMethod(site,payment.paymentMethodID);

        method$.subscribe(data => {
          action.paymentMethod = data;
          dialogRef = this.dialog.open(AdjustPaymentComponent,
            { width:        '450px',
              minWidth:     '450px',
              height:       '400px',
              minHeight:    '400px',
              data : action
          })
        })

      }

  }


  openMenuPricesSelection(menuItem: IMenuItem ) {
    let dialogRef: any;
    // const site = this.siteService.getAssignedSite();
    // this.menuService.getProduct(site, id).subscribe( data=> {
    //   const productTypeID = data.prodModifierType
    //   this.openProductEditor(id, productTypeID)
      if (menuItem) {
        dialogRef = this.dialog.open(MenuPriceSelectionComponent,
          { width:          '60vw',
            minWidth:       '800px',
            height:         '60vh',
            minHeight:      '600px',
            data : menuItem
        })
      }

  }
}

