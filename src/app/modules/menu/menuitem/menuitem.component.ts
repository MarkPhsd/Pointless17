import { Component,  Input,  OnInit, OnDestroy} from '@angular/core';
import { AWSBucketService, MenuService, OrdersService, UserService } from 'src/app/_services';
import { IMenuItem  }  from 'src/app/_interfaces/menu/menu-products';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
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

// https://www.npmjs.com/package/ngx-gallery

// Possible additional info options
// https://levelup.gitconnected.com/help-popup-with-angular-material-cdk-overlay-babc2ab127a

@Component({
  selector: 'app-menuitem',
  templateUrl: './menuitem.component.html',
  styleUrls: ['./menuitem.component.scss'],
})
export class MenuitemComponent implements OnInit,OnDestroy {

    @Input() fileName: string;

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

    spinnerMode             = 'determinate';
    @Input() user:          IUserProfile;

    constructor(private menuService: MenuService,
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
          private titleService      : Title,
         )
    {
      this.roles = localStorage.getItem(`roles`)
      this.isUserStaff = this.userAuthorization.isCurrentUserStaff()

      this.id = this.route.snapshot.paramMap.get('id');
      this.getItem(this.id);
    }

    childNotifier : Subject<boolean> = new Subject<boolean>();

    async ngOnInit() {
      this.quantity = 1
      this.initProductForm();
      this.initSubscriptions();
    };

    initProductForm() {
      this.productForm = this.fb.group({
        quantity: ['1'],
      });
    }

    ngOnDestroy(): void {
      this._order.unsubscribe();
    }

    initSubscriptions() {
      try {
        console.log('initSubscriptions')
        this._order = this.orderService.currentOrder$.subscribe( data => {
          this.order = data
        })
      } catch (error) {
      }
    }

    async addItemToOrder() {
      if (this.order) {
        console.log('posOrderItemService addItemToOrder line 103')
        this.orderMethodsService.addItemToOrder(this.order, this.menuItem, this.quantity)
      }
    }

    onCancel() {
      // this.dialogRef.close();
    }

    changeQuantity(quantity) {
      console.log('quantity', quantity)
      if (quantity == -1) { if (this.quantity == 1) { return  } }
      this.quantity = this.quantity + quantity;
      this.productForm = this.fb.group({
        quantity: this.quantity
      });
    }

    getItem(id: any) {
      const site     = this.siteService.getAssignedSite();
      const menuItem$ = this.menuService.getMenuProduct(site,id)
      menuItem$.subscribe(data => {
          this.menuItem = data;
          this.titleService.setTitle(`${this.menuItem.name} by ${this.appInitService.company}`)
          this.brand$ = this.brandService.getClient(site, data.brandID)
          this.packagingMaterial = this.menuService.getPackagingMaterialArray(data)
        }
      )
    };

    addItemByCode(item) {
      if (item) {
        console.log('sku', item.sku)
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
      this.location.back();
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

