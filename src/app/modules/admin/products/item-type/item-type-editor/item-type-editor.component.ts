import { Component, Inject, } from '@angular/core';
import { FbItemTypeService } from 'src/app/_form-builder/fb-item-type.service';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { FormBuilder, FormGroup,} from '@angular/forms';
import { ActivatedRoute,  } from '@angular/router';
import { MatSnackBar} from '@angular/material/snack-bar';
import { Observable,  } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { IPrinterLocation, PrinterLocationsService } from 'src/app/_services/menu/printer-locations.service';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { METRCItemsCategories } from 'src/app/_interfaces/metrcs/items';

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
  itemType_PackageTypes = this.itemTypeService.packageType;
  itemType_UseTypes  = this.itemTypeService.useType;
  itemType_Types     = this.itemTypeService.type;

  labelTypes        : ISetting[];
  receiptList$      : Observable<ISetting[]>;
  labelList$        : Observable<ISetting[]>;
  prepReceiptList$  : Observable<ISetting[]>;
  printerLocations$ : Observable<IPrinterLocation[]>;
  prepTicketID    : number;
  labelTypeID     : number;
  printerName     : string;
  printLocationID : number;
  packageType: string;
	// this.receiptList$     =  this.settingService.getReceipts(site);
  //   this.labelList$       =  this.settingService.getLabels(site);
  //   this.prepReceiptList$ =  this.settingService.getPrepReceipts(site);

  typeName         : string;
  metrcCategories$ : Observable<METRCItemsCategories[]>;

  constructor(
      private fb: FormBuilder,
      private fbItemTypeService: FbItemTypeService,
      private itemTypeService: ItemTypeService,
      public route: ActivatedRoute,
      private _snackBar: MatSnackBar,
      private settingService: SettingsService,
      private siteService: SitesService,
      private printerLocationsService: PrinterLocationsService,
      private metrcCategoryService: MetrcItemsCategoriesService,
      private dialogRef: MatDialogRef<ItemTypeEditorComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      @Inject(MAT_DIALOG_DATA) public selectedItems: number,
      )
  {

    const form             =  this.initFormFields()
    const site             =  this.siteService.getAssignedSite();
    this.metrcCategories$  =  this.metrcCategoryService.getCategories();
    this.receiptList$      =  this.settingService.getReceipts(site);
    this.printerLocations$ =  this.printerLocationsService.getLocations();

    if (data) {
      this.id = data.id
      if (!this.id) { return }
      if (this.id) {  this.initializeForm(this.id, form)  }
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
        this.labelTypeID     = this.itemType.labelTypeID
        this.printerName     = this.itemType.printerName
        this.prepTicketID    = this.itemType.prepTicketID
        this.printLocationID = this.itemType.printLocationID
        this.packageType     = this.itemType.packageType;
        this.typeName        = this.itemType.type;
      }
    }
  };

  initFormFields(): FormGroup {
    this.inputForm  = this.fbItemTypeService.initForm(this.inputForm);
    return this.inputForm;
  }

  save(event){
    this.update(null);
  }

  saveExit(event) {
    this.update(true);
  }

  async update(optionClose: any): Promise<boolean> {
    let result: boolean;
    return new Promise(resolve => {
      const site = this.siteService.getAssignedSite()

      if (this.inputForm.valid) {
        this.setNonFormValues()

        try {
            if (this.itemTypes) {
              this.itemTypes.forEach( item => {
                const id = item.id;
                item = this.inputForm.value;
                item.id = id;
                item.labelTypeID = this.labelTypeID;
                return  this.updateItem(site, item)
              })
              if (optionClose) { this.onCancel(null) }
            }
            if (this.itemType) {   return  this.updateItem(site, this.itemType) }
            if (optionClose) { this.onCancel(null) }
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
    const result = await this.update(true)
    if (result) {
      this.onCancel(null);
    }
  }

  setPrepTicketID(event) {
    this.itemType.prepTicketID = parseInt(event)
  }

  setLocationID(event) {
    this.printLocationID  = parseInt(event)
  }

  setLabelID(event) {
    // this.itemType.labelTypeID;
    this.itemType.labelTypeID = parseInt(event);
    this.labelTypeID = event
  }

  setNonFormValues() {
    if (this.itemType && this.inputForm) {

    }
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  deleteItem(event) {
    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }
    const item = this.inputForm.value;
    const id   = item.id;
    const site = this.siteService.getAssignedSite();
    const item$ = this.itemTypeService.delete(site, id)
    item$.subscribe(data => {
      this.notifyEvent('Item deleted.', 'Success');
      this.onCancel(null);
    })
  }


  copyItem() {
    //do confirm of delete some how.
    //then
  }

  // (outputeupdateItem)     ="save($event)"
  // (outputupdateItemExit)  ="saveExit($event)"
  // (outputupdatedeleteItem)="delete($event)"
  // (outputupdateonCancel)  ="onCancel($event)"

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
