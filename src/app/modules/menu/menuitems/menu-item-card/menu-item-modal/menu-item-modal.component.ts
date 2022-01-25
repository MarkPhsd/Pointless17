import { Component,  Inject,  Input,  OnInit, Optional,OnDestroy } from '@angular/core';
import { AWSBucketService, MenuService, OrdersService } from 'src/app/_services';
import { IMenuItem  }  from 'src/app/_interfaces/menu/menu-products';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Gallery, GalleryItem, ImageItem } from '@ngx-gallery/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IClientTable, IPOSOrder, IUserProfile } from 'src/app/_interfaces';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { Capacitor, Plugins } from '@capacitor/core';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-menu-item-modal',
  templateUrl: './menu-item-modal.component.html',
  styleUrls: ['./menu-item-modal.component.scss'],

})
export class MenuItemModalComponent implements OnInit, OnDestroy {

  @Input() fileName: string;
  get platForm() {  return Capacitor.getPlatform(); }
  get fQuantity() { return this.productForm.get("quantity") as FormControl;}
  get formProduct() { return this.productForm as FormGroup;}
  get f() { return this.productForm;}
  productForm:            FormGroup;
  quantity:               number;
  id:                     string;

  menuItem = {} as        IMenuItem;
  menuItem$:              Observable<IMenuItem>;
  brand$:                 Observable<IClientTable>;

  spinnerMode             = 'determinate';
  @Input() user:          IUserProfile;

  _order  :   Subscription;
  order   :  IPOSOrder;

  isApp: boolean;

  constructor(private menuService: MenuService,
        private router            : Router,
        public  route              : ActivatedRoute,
        private sanitizer         : DomSanitizer,
        private orderService      : OrdersService,
        private _snackBar         : MatSnackBar,
        private fb                : FormBuilder,
        public gallery            : Gallery,
        private siteService       : SitesService,
        private brandService      : ClientTableService,
        private orderMethodsService: OrderMethodsService,
        private dialogRef         : MatDialogRef<MenuItemModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
       )
  {

    if (data) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }

    this.getItem(this.id);

    if ( this.platForm  === "Electron"
         || this.platForm === "android"
         || this.platForm === "capacitor")
    { this.isApp = true }

  }

  childNotifier : Subject<boolean> = new Subject<boolean>();

  async ngOnInit() {

    this.quantity = 1
    this.productForm = this.fb.group({
      quantity: "1"
    });
    this.initSubscriptions();
  };

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._order.unsubscribe();
  }

  initSubscriptions() {
    try {
      console.log('initSubscriptions')
      this._order = this.orderService.currentOrder$.subscribe( data => {
        this.order = data
        console.log('initSubscriptions', this.order)
      })
    } catch (error) {
    }
  }

  async addItemToOrder() {
    if (this.order) {
      const site = this.siteService.getAssignedSite()
      const newItem = { orderID: this.order.id, quantity: 1, menuItem: this.menuItem }
      console.log('posOrderItemService addItemTo Order Menu Item Modal')
      await  this.orderMethodsService.addItemToOrder(this.order, this.menuItem, 1)
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  changeQuantity(quantity: number) {
    if (quantity == -1) {
      if (this.quantity == 1) {
        return
      }
    }
    this.quantity = this.quantity + quantity;
    this.productForm = this.fb.group({
      quantity: this.quantity
    });
  }

  getItem(id: any) {

    const site = this.siteService.getAssignedSite();

    this.menuItem$ = this.menuService.getMenuItemByID(site,id)

    let promise =  this.menuItem$.pipe().toPromise()

     promise.then(data =>
      {
        this.menuItem = data;

        this.brand$    =  this.brandService.getClient(site, data.brandID)


      },
      error => {
      }
    )
  };


  goBackToList() {
    try {
      this.router.navigate(["productlist"]);
    } catch (error) {
      console.log(error)
    }
  }

  exit() {
    this.dialogRef.close();
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
