import { Component,  Input,  OnInit } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ActivatedRoute, } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IProduct, ISetting } from 'src/app/_interfaces';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ElectronService } from 'ngx-electron';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { MenuService } from 'src/app/_services';
import { InventoryEditButtonService } from 'src/app/_services/inventory/inventory-edit-button.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-info-panel',
  templateUrl: './product-info-panel.component.html',
  styleUrls: ['./product-info-panel.component.scss'],
  // animations: [slideInOutAnimation]
})
export class ProductInfoPanelComponent implements OnInit {

  @Input() products            : IProduct[];
  @Input() id                  : number;
  @Input() product             : IProduct;

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

  constructor(
       public route              : ActivatedRoute,
       private menuService       : MenuService,
       private siteService       : SitesService,
       private fb                : UntypedFormBuilder,
       private electronService   : ElectronService,
       private renderingService  : RenderingService,
       private printingService   : PrintingService,
       private inventoryEditButon: InventoryEditButtonService,
       private productEditButton : ProductEditButtonService,
       private _snackBar         : MatSnackBar,
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
      this.menuService.putProduct(site, this.product.id, this.product).subscribe(data => {
        this.notifyEvent('Count updated, you may need to refresh your search to see updates.', 'Success')
      })
    }
  }

  getLastPrinterName(): string {
    return this.printingService.getLastLabelPrinter()
  }

  setLastPrinterName(name: string) {
    this.printingService.setLastLabelPrinterName(name)
  }

  ngOnInit() {
    this.toggleLabelEvents = "labels"

    const site = this.siteService.getAssignedSite();
    if (this.id) {
      this.menuService.getProduct(site, this.id).subscribe(data=>{
        this.product = data
      })
    }

    this.initForm()
    this.electronEnabled =  this.electronService.isElectronApp
    this.printerName = this.getLastPrinterName();
    this.labelID = this.printingService.getLastLabelUsed();
  }

  initForm() {
    if (this.product) {
      this.printForm = this.fb.group({
        printQuantity: [this.product.productCount]
      } )
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

  printLegal() {
  }

  printSerial() {
  }

  printSku() {
    // const item =  this.fakeDataService.getInventoryItemTestData();
    // const printString = this.renderingService.interpolateText(item, zplString )
    if (this.labelSetting && this.product) {
      const content = this.renderingService.interpolateText(this.product, this.labelSetting.text)
      //then get the quantity from this.printQuantity
      if(this.printQuantity == null) { this.printQuantity == 1}
      for (let i = 0; i < this.printQuantity; i++) {
         this.printingService.printLabelElectron(content, this.printerName)
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

  getPrinterName(name: string) {
    this.printerName = name
    this.setLastPrinterName(name)
  }

  getLabelSetting(labelSetting: ISetting)  {
    this.labelSetting = labelSetting;
    this.setLastlabelUsed(this.labelID)
  }

  setLastlabelUsed(id: number) {
    this.printingService.setLastLabelUsed(this.labelSetting.id)
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
    duration: 2000,
    verticalPosition: 'top'
    });
  }

}
