import { Component, Inject, OnInit } from '@angular/core';
import { FbItemTypeService } from 'src/app/_form-builder/fb-item-type.service';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MatSnackBar} from '@angular/material/snack-bar';
import { IProduct } from 'src/app/_interfaces/raw/products';
import { Observable,  } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ISetting, TaxRate } from 'src/app/_interfaces';
import { TaxesService } from 'src/app/_services/menu/taxes.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { IPrinterLocation, PrinterLocationsService } from 'src/app/_services/menu/printer-locations.service';

@Component({
  selector: 'app-item-type-editor',
  templateUrl: './item-type-editor.component.html',
  styleUrls: ['./item-type-editor.component.scss']
})
export class ItemTypeEditorComponent   {

  taxesSetting      = [{id: 0, name: 'Never'},{id: 1, name: 'Taxable'},{id: 2, name: 'According To Transaction'}]
  something         : any;
  itemTypes         = [] as IItemType[];
  itemType          : IItemType;
  id                : any;
  selected          : any;
  inputForm         : FormGroup;
  itemType$         : Observable<IItemType>;
  selectedItemsCount: number;

  labelTypes        : ISetting[];
  receiptList$      : Observable<ISetting[]>;
  labelList$        : Observable<ISetting[]>;
  prepReceiptList$  : Observable<ISetting[]>;
  printerLocations$ : Observable<IPrinterLocation[]>;
  prepTicketID    : number;
  labelTypeID     : number;
  printerName     : string;
  printLocationID : number;
	// this.receiptList$     =  this.settingService.getReceipts(site);
  //   this.labelList$       =  this.settingService.getLabels(site);
  //   this.prepReceiptList$ =  this.settingService.getPrepReceipts(site);
  constructor(
      private fb: FormBuilder,
      private fbItemTypeService: FbItemTypeService,
      private itemTypeService: ItemTypeService,
      public route: ActivatedRoute,
      private _snackBar: MatSnackBar,
      private settingService: SettingsService,
      private siteService: SitesService,
      private printerLocationsService: PrinterLocationsService,
      private dialogRef: MatDialogRef<ItemTypeEditorComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      @Inject(MAT_DIALOG_DATA) public selectedItems: number,
      )
  {

    const form =  this.initFormFields()
    const site = this.siteService.getAssignedSite();
    this.receiptList$      =  this.settingService.getReceipts(site);
    this.printerLocations$ =  this.printerLocationsService.getLocations();

    if (data) {
      this.id = data.id
      if (!this.id) {
        return
        console.log('no data')
      }
      if (this.id) {
        this.initializeForm(this.id, form)
      }
      return
    }

     if (selectedItems) {
      const _selectedItems: number[]  = Object.values(selectedItems)

      const numbersList: number[]  = Object.values(_selectedItems[0])
      this.selectedItemsCount = _selectedItems.length;

      numbersList.forEach(data=> {
        let item = {} as IItemType;
        item.id = data
        this.itemTypes.push(item)
      })
    }
  }

  async initializeForm(id: any, form: FormGroup)  {
    if (form && id) {
      const site = this.siteService.getAssignedSite();
      this.itemType$ = this.itemTypeService.getItemType(site, id)
      this.itemType = await this.itemType$.pipe().toPromise();
      if (this.itemType) {
        this.inputForm.patchValue(this.itemType)
        this.labelTypeID = this.itemType.labelTypeID
        this.printerName = this.itemType.printerName
        this.prepTicketID = this.itemType.prepTicketID
        this.printLocationID = this.itemType.printLocationID
      }
    }
  };

  initFormFields(): FormGroup {
    this.inputForm  = this.fbItemTypeService.initForm(this.inputForm);
    return this.inputForm;
  }

  save(){
    this.update();
  }

  async update(): Promise<boolean> {
    let result: boolean;

    return new Promise(resolve => {
      if (this.inputForm.valid) {
        this.setNonFormValues()

        const site = this.siteService.getAssignedSite()
        try {
            if (this.itemTypes) {
              this.itemTypes.forEach( item => {
                const id = item.id;
                item = this.inputForm.value;
                item.id = id;
                item.labelTypeID = this.labelTypeID;
                console.log(this.labelTypeID )
                return  this.updateItem(site, item)
              })
              this.onCancel()
            }
            if (this.itemType) {
              return  this.updateItem(site, this.itemType)
            }
            this.onCancel()
          } catch (error) {
            console.log(error)
          }
        }
      }
    )
  };

  async updateItem(site, item: IItemType) {
    try {
      const id = item.id;
      item = this.inputForm.value;
      item.id = id;
      item.labelTypeID = this.labelTypeID;
      item.printerName = this.printerName;
      item.prepTicketID =this.prepTicketID;
      if (this.itemType) {  item.imageName = this.itemType.imageName  }
      const product$ = this.itemTypeService.putItemTypeNoChildren(site, item)

      product$.subscribe(
         data => {
            this._snackBar.open(`Update item`, "Succcess", { duration: 2000} )
            return true
         },
         error => {
            this._snackBar.open(`Update item ${error}`, "Failure", { duration: 2000} )
            return false
          }
        )
    } catch (error) {
      console.log(error)
    }
  }

  async updateExit() {
    const result = await this.update()
    if (result) {
      this.onCancel();
    }
  }

  setPrepTicketID(event) {
    this.itemType.prepTicketID = parseInt(event)
    console.log('event', event)
  }

  setLocationID(event) {
    this.printLocationID  = parseInt(event)
    console.log('event', event)
  }

  setLabelID(event) {
    // this.itemType.labelTypeID;
    this.itemType.labelTypeID = parseInt(event);
    this.labelTypeID = event
    console.log('event', event)
  }

  setNonFormValues() {
    if (this.itemType && this.inputForm) {

    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  deleteItem() {
    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }
    const item = this.inputForm.value;
    const id   = item.id;
    const site = this.siteService.getAssignedSite();
    const item$ = this.itemTypeService.delete(site, id)

    item$.subscribe(data => {
      this.notifyEvent('Item deleted.', 'Success');
      this.onCancel();
    })

    //do confirm of delete some how.
    //then
  }

  copyItem() {
    //do confirm of delete some how.
    //then
  }

   //image data
  received_URLImage(event) {
    let data = event
    if (!this.itemType ) { return }
    this.itemType.imageName = data
  };

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
