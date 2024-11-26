import { Component,  Inject,  Input,  OnInit, Optional,OnDestroy } from '@angular/core';
import { AWSBucketService, MenuService, OrdersService } from 'src/app/_services';
import { IMenuItem  }  from 'src/app/_interfaces/menu/menu-products';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IClientTable, IPOSOrder, IUserProfile } from 'src/app/_interfaces';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { Capacitor,  } from '@capacitor/core';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MenuitemComponent } from '../../../menuitem/menuitem.component';

@Component({
  selector: 'app-menu-item-modal',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    MenuitemComponent,
  SharedPipesModule],
  templateUrl: './menu-item-modal.component.html',
  styleUrls: ['./menu-item-modal.component.scss'],

})
export class MenuItemModalComponent implements OnInit, OnDestroy {

  @Input() fileName: string;
  get platForm() {  return Capacitor.getPlatform(); }
  get fQuantity() { return this.productForm.get("quantity") as UntypedFormControl;}
  get formProduct() { return this.productForm as UntypedFormGroup;}
  get f() { return this.productForm;}
  productForm:            UntypedFormGroup;
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

  childNotifier : Subject<boolean> = new Subject<boolean>();

  constructor(private menuService: MenuService,
        private router            : Router,
        public  route              : ActivatedRoute,
        private sanitizer         : DomSanitizer,
        private orderService      : OrdersService,
        private _snackBar         : MatSnackBar,
        private fb                : UntypedFormBuilder,
        private siteService       : SitesService,
        private brandService      : ClientTableService,
        private platFormService   : PlatformService,
        private orderMethodsService: OrderMethodsService,
        private dialogRef         : MatDialogRef<MenuItemModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
       )
  {

    this.isApp =  this.platFormService.isApp();

    if (data && data.id) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }

    this.getItem(this.id);
  }

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
    if (this._order) {this._order.unsubscribe()};
  }

  initSubscriptions() {
    try {
      this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
        this.order = data
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

    if (!this.id) {
      this.menuItem$ =  this.menuService.currentMeuItem$.pipe(
        switchMap( data => {
          console.log('menu item current', data)
          if (data) {
              this.menuItem = data;
              // if (data.brandID) {
              //   this.brand$    =  this.brandService.getClient(site, data.brandID)
              // }
              return of(data)
            }
          }
        )
      )
      return
    }

    if (!id || id == 0) {     return ; }

    const item$ = this.menuService.getMenuItemByID(site, id)
    this.menuItem$ = item$.pipe(
      switchMap(data => {
        if (data) {
          this.menuItem = data;
          this.menuService.updateCurrentMenuItem(data)
          if (data.brandID) {
            this.brand$    =  this.brandService.getClient(site, data.brandID)
          }
          return of(data)
        }
      }))
  };

  goBackToList() {
    try {
      this.router.navigate(["productlist"]);
    } catch (error) {
      console.log(error)
    }
  }

  exit(event) {
    console.log('even happened', event)
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
