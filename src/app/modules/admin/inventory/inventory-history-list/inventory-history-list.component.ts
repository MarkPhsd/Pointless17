import { Component,  EventEmitter,  Input,  OnDestroy,  OnInit, Optional, Output, } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { MoveInventoryLocationComponent } from '../move-inventory-location/move-inventory-location.component';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ISetting } from 'src/app/_interfaces';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
// import { ElectronService } from 'ngx-electron';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { MenuService } from 'src/app/_services';
import { InventoryEditButtonService } from 'src/app/_services/inventory/inventory-edit-button.service';
import { switchMap } from 'rxjs/operators';
import { ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
  selector: 'app-inventory-history-list',
  templateUrl: './inventory-history-list.component.html',
  styleUrls: ['./inventory-history-list.component.scss']
})
export class InventoryHistoryListComponent implements OnInit, OnDestroy {

  manifestList: IInventoryAssignment[];

  @Input() inventoryAssignments: IInventoryAssignment[];
  @Input() id                  : number;
  // @Input() inventoryAssignment : IInventoryAssignment;
  @Output() outputRefresh = new EventEmitter();
  toggleLabelEvents: string;

  inventoryAssignment: IInventoryAssignment;

  @Input() set setInventoryAssignment(inventoryAssignment: IInventoryAssignment) {
    this.inventoryAssignment = inventoryAssignment;
  }

  @Input() printerName         : string;

  labelSetting    : ISetting;
  printForm       : UntypedFormGroup;
  printQuantity   = 1;
  labelList$      : Observable<ISetting[]>;
  labelID         : number;

  printingEnabled  = false;
  electronEnabled  = false;
  lastLabelPrinter = ""
  electronPrinterList : any;

  _manifestList : Subscription;

  initSubscriptions() {
    this._manifestList = this.manifestService.inventoryItems$.subscribe(data => {
      this.manifestList = data;
    })
  }

  constructor(
      private manifestService   : ManifestInventoryService,
       public route              : ActivatedRoute,
       private dialog            : MatDialog,
       private inventoryAssignmentService: InventoryAssignmentService,
       private siteService       : SitesService,
       private settingService    : SettingsService,
       private fb                : UntypedFormBuilder,
       private platFormService   : PlatformService,
      //  private electronService   : ElectronService,
       private renderingService  : RenderingService,
       private printingService   : PrintingService,
       private menuService       : MenuService,
       private inventoryEditButon: InventoryEditButtonService,
       private productEditButton : ProductEditButtonService,
       private _snackBar         : MatSnackBar,
       )
  {
    this.listPrinters();
  }

  onToggleLabelEvents(option) {
    // { this.toggleLabelEvents  = 'labels'}
    // { this.toggleLabelEvents  = 'events'}
    this.toggleLabelEvents  = option;

  }

  listPrinters(): any {
    this.electronPrinterList = this.printingService.listPrinters();
  }

  getLastPrinterName(): string {
    return this.printingService.getLastLabelPrinter()
  }

  setLastPrinterName(name: string) {
    this.printingService.setLastLabelPrinterName(name)
  }

  ngOnInit() {
    this.initSubscriptions();
    this.toggleLabelEvents = "labels"

    const site = this.siteService.getAssignedSite();
    if (this.id) {
      this.inventoryAssignmentService.getInventoryAssignment(site, this.id).subscribe(data=>{
        this.inventoryAssignment = data
      })
    }

    this.initForm()
    this.electronEnabled =  this.platFormService.isAppElectron
    this.printerName = this.getLastPrinterName();
    this.labelID = this.printingService.getLastLabelUsed();
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._manifestList) { this._manifestList.unsubscribe()}

  }
  initForm() {
    if (this.inventoryAssignment) {
      this.printForm = this.fb.group({
        printQuantity: [this.inventoryAssignment.packageQuantity]
      } )
    }

  }

  editWebProduct() {
   // get the tid if there is one
   if (this.id) {
      const id = this.id
      if (this.inventoryAssignment) {
        const productID = this.inventoryAssignment.productID
        if (id) {
          this.openProductDialog(productID)
        }
      }
    }
  }

  async editProduct() {
       // get the id if there is one
    const site = this.siteService.getAssignedSite();
    if (this.id) {
      const id = this.id
      if (this.inventoryAssignment.id == id) {
        const productID = this.inventoryAssignment.productID
        this.openProductEditor(productID)
      } else {
        this.inventoryAssignmentService.getInventoryAssignment(site, id).pipe(
          switchMap(data => {
              return this.menuService.getMenuItemByID(site, data.productID)
          })).subscribe( item => {
            if (item) {
              this.productEditButton.openProductEditor(item.id, item.prodModifierType)
            }
          }
        )
      }
    }
  }

  openProductEditor(productID: number) {
    const site = this.siteService.getAssignedSite();
    const menuItem$ =  this.menuService.getMenuItemByID(site, productID)
    menuItem$.subscribe(item => {
      if (item) {
        this.productEditButton.openProductEditor(productID, item.prodModifierType)
      }
    })
  }


  changeLocation() {
   // get the id if there is one
   if (this.id) {
      const id = this.id
      if (this.inventoryAssignment) {
        if (id) {
          this.openMoveInventoryDialog(id)
        }
      }
    }
  }

  printLegal() {
    this._snackBar.open('Feature not implemented', 'Alert')
  }

  printSerial() {
    this._snackBar.open('Feature not implemented', 'Alert')
  }

   printSku() {
    // const item =  this.fakeDataService.getInventoryItemTestData();
    // const printString = this.renderingService.interpolateText(item, zplString )
    if (this.labelSetting && this.inventoryAssignment) {
      const content = this.renderingService.interpolateText(this.inventoryAssignment, this.labelSetting.text)
      //then get the quantity from this.printQuantity
      if(this.printQuantity == null) { this.printQuantity == 1}

      // await this.printingService.printLabelElectron(content, this.printerName)

      // // await  this.printingService.printTestLabelElectron(content, this.printerName)

      for (let i = 0; i < this.printQuantity; i++) {
        this.printingService.printLabelElectron(content, this.printerName)
      }
    }

  }

  adjustmentNote(){
    // get the id if there is one
    if (this.id) {
      const id = this.id
      if (this.inventoryAssignment) {
        if (id) {
          const dialogRef =  this.openNoteDialog(id)
          dialogRef.afterClosed().subscribe(result => {
            this.outputRefresh.emit('true')
            if (result && result != 'false') {
              this.id = 0;
              this.inventoryAssignment = null;
            }
          })
        }
      }
    }
  }

  openNoteDialog(id: any) {
    return this.inventoryEditButon.openNoteDialog(id)
  }

  editInventoryItem() {
    if (this.inventoryAssignment) {
      this.openInventoryDialog(this.inventoryAssignment.id)
    }
  }

  openMoveInventoryDialog(id: any) {
    const dialogRef = this.dialog.open(MoveInventoryLocationComponent,
      { width:      '400px',
        minWidth:   '400px',
        height:     '650px',
        minHeight:  '650px',
        data : {id: id}
      },
    )

    dialogRef.afterClosed().subscribe(result => {
      this.outputRefresh.emit('true')
      if (result && result != 'false') {
        this.id = 0;
        this.inventoryAssignment = null;
      }
    });

  }

  ///move to inventoryAssignemtnService
  openInventoryDialog(id: number) {
    // const dialogRef = this.dialog.open(NewInventoryItemComponent,
    //   { width:        '900px',
    //     minWidth:     '900px',
    //     height:       '90vh',
    //     minHeight:    '900px',
    //     data : {id: id}
    //   },
    // )
    const dialogRef =  this.inventoryAssignmentService.openInventoryItem(id)
    if (dialogRef) {
      dialogRef.afterClosed().subscribe(result => {
        this.outputRefresh.emit('true')
        if (result && result != 'false') {
          this.id = 0;
          this.inventoryAssignment = null;
        }
      });
    }
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


}
