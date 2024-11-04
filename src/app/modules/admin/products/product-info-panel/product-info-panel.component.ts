import { Component,  Input,  OnChanges,  OnInit } from '@angular/core';
import { Observable, debounceTime, of, switchMap } from 'rxjs';
import { ActivatedRoute, } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IProduct, ISetting, ISite } from 'src/app/_interfaces';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
// import { ElectronService } from 'ngx-electron';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { MenuService } from 'src/app/_services';
import { InventoryEditButtonService } from 'src/app/_services/inventory/inventory-edit-button.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';

@Component({
  selector: 'app-product-info-panel',
  templateUrl: './product-info-panel.component.html',
  styleUrls: ['./product-info-panel.component.scss'],
  // animations: [slideInOutAnimation]
})
export class ProductInfoPanelComponent implements OnInit, OnChanges {

  @Input() products            : IProduct[];
  @Input() id                  : number;
  @Input() product             : IProduct;
  thumbnail: string;
  urlImageMain: string;
  @Input() set setProduct(product: IProduct) { this.product = product;  }
  @Input() printerName         : string;

  toggleLabelEvents: string;
  labelSetting    : ISetting;
  printForm       : UntypedFormGroup;
  printQuantity   = 1;
  labelList$      : Observable<ISetting[]>;
  labelID         : number;

  printingEnabled  = false;
  electronEnabled  = false;
  lastLabelPrinter = ""

  productForm: FormGroup;

  action$: Observable<any>;
  itemType$ : Observable<IItemType>;
  iItemType: IItemType;

  constructor(
       public route              : ActivatedRoute,
       private menuService       : MenuService,
       private siteService       : SitesService,
       private fb                : UntypedFormBuilder,
      //  private electronService   : ElectronService,
       private renderingService  : RenderingService,
       private printingService   : PrintingService,
       private inventoryEditButon: InventoryEditButtonService,
       private productEditButton : ProductEditButtonService,
       private _snackBar         : MatSnackBar,
       public fbProductsService: FbProductsService,
       private itemTypeService: ItemTypeService,
       )
  {
    // this.toggleLabelEvents = false;
  }

  onToggleLabelEvents(option) {
    // { this.toggleLabelEvents  = 'labels'}
    // { this.toggleLabelEvents  = 'events'}
    this.toggleLabelEvents  = option;
    // return
  }

  setProductCount(number) {
    if (this.product) {
      const site = this.siteService.getAssignedSite();
      this.product.productCount = number;
      this.action$ = this._saveProduct(site).pipe(
        switchMap(data => {
           this.notifyEvent('Count updated, you may need to refresh your search to see updates.', 'Success');
          return of(data)
      }));
    }
  }

  ngOnChanges() {
    this.iItemType = null
    this.initForm()
    if (this.product) {
      this.thumbnail = this.product.thumbnail
      this.urlImageMain = this.product.urlImageMain;
      const site = this.siteService.getAssignedSite()
      this.itemType$ = this.itemTypeService.getItemType(site, this.product.prodModifierType).pipe(switchMap(data => {
        this.iItemType = data;
        return of(data)
      }))
    }
  }

  setThumbNail(event) {
    this.thumbnail = event;
    this.product.thumbnail = event;
    this.productForm.patchValue({thumbnail: event})
  }

  seturlImageMain(event) {
    this.urlImageMain = event;
    this.product.urlImageMain = event;
    this.productForm.patchValue({urlImageMain: event})
  }

  _saveProduct(site: ISite) {
    return this.menuService.putProduct(site, this.product.id, this.productForm.value)
  }

  saveProduct() {
    const site = this.siteService.getAssignedSite();
    this.action$ = this._saveProduct(site).pipe(
      switchMap(data => {
         this.notifyEvent('Updated.', 'Success');
        return of(data)
    }));
  }

  initFormFields() {
    this.productForm  = this.fbProductsService.initForm(this.productForm)
  }



  ngOnInit() {
    this.toggleLabelEvents = "info"

    const site = this.siteService.getAssignedSite();
    if (this.id) {
      this.menuService.getProduct(site, this.id).subscribe(data=>{
        this.product = data
      })
    }


  }

  initForm() {
    this.thumbnail = null;
    if (this.product) {
      this.thumbnail = this.product.thumbnail;
      this.initFormFields();
      if (this.productForm && this.product) {
        this.productForm.patchValue(this.product)
      }

      this.productForm.valueChanges
          .pipe(debounceTime(500)) // Adjust the debounce time as needed (in milliseconds)
          .subscribe(data => {
            this.saveProduct();
      });


    }
  }

  editWebProduct() {
   // get the id if there is one
   if (this.id) {
      const id = this.id
      if (this.product) {
        const productID = this.product.id
        if (id) {
          this.openProductDialog(productID)
        }
      }
    }
  }

  async editProduct() {
    if (this.id) {
      const id = this.id
      if (this.product) {
        const productID = this.product.id
        const site = this.siteService.getAssignedSite();
        const menuItem$ =  this.menuService.getMenuItemByID(site, productID)
        menuItem$.subscribe(data => {
          if (id) {
            this.productEditButton.openProductEditor(productID, data.prodModifierType)
          }
        })
      }
    }
  }


  adjustmentNote(){
    // get the id if there is one
    if (this.id) {
      const id = this.id
      if (this.product) {
        if (id) {
          this.openNoteDialog(id)
        }
      }
    }
  }

  openNoteDialog(id: any) {
    this.inventoryEditButon.openNoteDialog(id)
  }

  openProductDialog(id: any) {
    if (id) {
      const result =  this.inventoryEditButon.openProductDialog(id)
    }
  }

  // getPrinterName(name: string) {
  //   this.printerName = name
  //   this.setLastPrinterName(name)
  // }

  // getLabelSetting(labelSetting: ISetting)  {
  //   this.labelSetting = labelSetting;
  //   this.setLastlabelUsed(this.labelID)
  // }

  // setLastlabelUsed(id: number) {
  //   this.printingService.setLastLabelUsed(this.labelSetting.id)
  // }

  // getLastPrinterName(): string {
  //   return this.printingService.getLastLabelPrinter()
  // }

  // setLastPrinterName(name: string) {
  //   this.printingService.setLastLabelPrinterName(name)
  // }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
    duration: 2000,
    verticalPosition: 'top'
    });
  }

}
