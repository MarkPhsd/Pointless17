import { Component,  Inject,  Input,  OnInit, Optional, } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { InventoryAdjustmentNoteComponent } from 'src/app/shared/widgets/adjustment-notes/adjustment-note/adjustment-note.component';
import { MoveInventoryLocationComponent } from '../move-inventory-location/move-inventory-location.component';
import { ProducteditComponent } from '../../products/productedit/productedit.component';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ISetting } from 'src/app/_interfaces';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ElectronService } from 'ngx-electron';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { MenuService } from 'src/app/_services';
import { InventoryEditButtonService } from 'src/app/_services/inventory/inventory-edit-button.service';

@Component({
  selector: 'app-inventory-history-list',
  templateUrl: './inventory-history-list.component.html',
  styleUrls: ['./inventory-history-list.component.scss']
})
export class InventoryHistoryListComponent implements OnInit {

  @Input() inventoryAssignments: IInventoryAssignment[];
  @Input() id                  : number;
  // @Input() inventoryAssignment : IInventoryAssignment;

  toggleLabelEvents: string;

  inventoryAssignment: IInventoryAssignment;

  @Input() set setInventoryAssignment(inventoryAssignment: IInventoryAssignment) {
    this.inventoryAssignment = inventoryAssignment;
  }

  @Input() printerName         : string;

  labelSetting    : ISetting;
  printForm       : FormGroup;
  printQuantity   : number;
  labelList$      : Observable<ISetting[]>;
  labelID         : number;

  printingEnabled = false;
  electronEnabled = false;
  lastLabelPrinter = ""

  constructor(
       public route              : ActivatedRoute,
       private dialog            : MatDialog,
       private inventoryAssignmentService: InventoryAssignmentService,
       private siteService       : SitesService,
       private settingService    : SettingsService,
       private fb                : FormBuilder,
       private electronService   : ElectronService,
       private renderingService  : RenderingService,
       private printingService   : PrintingService,
       private menuService       : MenuService,
       private inventoryEditButon: InventoryEditButtonService,
       private productEditButton : ProductEditButtonService,

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
      this.inventoryAssignmentService.getInventoryAssignment(site, this.id).subscribe(data=>{
        this.inventoryAssignment = data
      })
    }

    this.initForm()
    this.electronEnabled =  this.electronService.isElectronApp
    this.printerName = this.getLastPrinterName();
    this.labelID = this.printingService.getLastLabelUsed();
  }

  initForm() {

    if (this.inventoryAssignment) {
      this.printForm = this.fb.group({
        printQuantity: [this.inventoryAssignment.packageQuantity]
      } )
    }

  }

  editWebProduct() {
   // get the id if there is one
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

    if (this.id) {
      const id = this.id
      if (this.inventoryAssignment) {
        const productID = this.inventoryAssignment.productID
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

  }

  printSerial() {

  }

  printSku() {

    // const item =  this.fakeDataService.getInventoryItemTestData();
    // const printString = this.renderingService.interpolateText(item, zplString )
    if (this.labelSetting && this.inventoryAssignment) {
      const content = this.renderingService.interpolateText(this.inventoryAssignment, this.labelSetting.text)

      //then get the quantity from this.printQuantity
      if(this.printQuantity == null) { this.printQuantity == 1}
      for (let i = 0; i < this.printQuantity; i++) {
        this.printingService.printTestLabelElectron(content, this.printerName)
      }
    }

  }

  adjustmentNote(){
    // get the id if there is one
    if (this.id) {
      const id = this.id
      if (this.inventoryAssignment) {
        if (id) {
          this.openNoteDialog(id)
        }
      }
    }
  }

  openNoteDialog(id: any) {
    this.inventoryEditButon.openNoteDialog(id)
  }

  editInventoryItem() {
    if (this.inventoryAssignment) {
      this.inventoryEditButon.openInventoryDialog(this.inventoryAssignment)
    }
  }

  openMoveInventoryDialog(id: any) {
    if (this.inventoryAssignment) {
      this.inventoryEditButon.openMoveInventoryDialog(this.inventoryAssignment.id)
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
