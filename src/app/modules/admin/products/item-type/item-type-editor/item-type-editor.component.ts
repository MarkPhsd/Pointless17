 import { Component, Inject, } from '@angular/core';
import { FbItemTypeService } from 'src/app/_form-builder/fb-item-type.service';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { FormBuilder, FormControl, FormGroup,} from '@angular/forms';
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
import { IItemBasic } from 'src/app/_services';

@Component({
  selector: 'app-item-type-editor',
  templateUrl: './item-type-editor.component.html',
  styleUrls: ['./item-type-editor.component.scss']
})
export class ItemTypeEditorComponent   {
  wicEBTList        = [{id: 0, name: 'NONE'},{id: 1, name: 'WIC'},{id: 2, name: 'EBT'},{id: 2, name: 'WIC and EBT'}]
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
  itemType_Types     = this.itemTypeService.typesList.sort((a, b) => (a.name > b.name) ? 1 : -1);
  useType  : any;

  labelTypes        : ISetting[];
  receiptList$      : Observable<IItemBasic[]>;
  labelList$        : Observable<ISetting[]>;
  prepReceiptList$  : Observable<IItemBasic[]>;
  printerLocations$ : Observable<IPrinterLocation[]>;
  prepTicketID      : number;
  labelTypeID       : number;
  printerName       : string;
  printLocationID   : number;
  instructions      : string;
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
      public  route: ActivatedRoute,
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

  initializeForm(id: any, form: FormGroup)  {
    if (form && id) {
      const site = this.siteService.getAssignedSite();
      this.itemType$ = this.itemTypeService.getItemType(site, id)
      this.itemType$.subscribe(
        {
          next:  data => {
            this.initFormData(data)
          },
          error: error =>  {
            console.log(error)
          }
        }
      )
    }
  };

  setUseType(event) {
    console.log(event);
    this.useType = event;
    this.inputForm.controls['useGroupID'].setValue(this.useType.id);
    this.inputForm.controls['type'].setValue(event.name);
  }

  getUseType(id: any) {
    this.useType = this.itemType_Types.filter(data => data.id.toString() === id.toString())[0]
    console.log('getUseType', this.useType)
    if (this.useType) {
      this.inputForm.controls['useGroupID'].setValue(this.useType.id);
      this.inputForm.controls['type'].setValue(this.useType.name);
      return this.useType;
    }
  }

  initFormData(itemType: IItemType) {
    this.itemType = itemType;
    if (this.itemType) {
      try {
        this.useType = {name: this.itemType?.type, id: this.itemType?.useGroupID}
        this.inputForm.patchValue(this.itemType);
        this.setUseType({name: this.itemType?.type, id: this.itemType?.useGroupID})
        console.log(this.inputForm.value)
      } catch (error) {
        console.log(error)
      }
      try {
        this.labelTypeID     = this.itemType.labelTypeID
        this.printerName     = this.itemType.printerName
        this.prepTicketID    = this.itemType.prepTicketID
        this.printLocationID = this.itemType.printLocationID
        this.packageType     = this.itemType.packageType;
        this.typeName        = this.itemType.type;
      } catch (error) {
        console.log(error)
      }
    }
  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(field => {  //{2}
      const control = formGroup.get(field);             //{3}
      if (control instanceof FormControl) {             //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

  initFormFields(): FormGroup {
    this.inputForm  = this.fbItemTypeService.initForm(this.inputForm);
    return this.inputForm;
  }

  save(event){
    this.update(false);
  }

  saveExit(event) {
    this.update(true);
  }

  update(optionClose: boolean) {
    let result: boolean;
    const site = this.siteService.getAssignedSite();

    if (!this.inputForm.valid) {
      this._snackBar.open(`Form not valid, please address issues.`, 'Oops', { duration: 2000} )
      this.validateAllFormFields(this.inputForm)
      return
    }

    if (this.inputForm.valid) {
      const itemType =  this.setNonFormValues();

      if (this.itemTypes) {
        this.itemTypes.forEach( item => {
          const id = item.id;
          item = this.inputForm.value;
          console.log('item value', item)
          item.id = id;
          item.labelTypeID = this.labelTypeID;
          return  this.updateItem(site, item, optionClose)
        })
      }

      if (itemType) {
        // this._snackBar.open(itemType.name, 'Added', { duration: 2000} )
        return  this.updateItem(site, itemType, optionClose)
      }
    }

  };

  updateItem(site, item: IItemType, optionClose: boolean) {
    try {

      if (!item) {
        this._snackBar.open(`Update item problem`, 'failed', { duration: 2000} )
        return
      }

      if (this.itemType) {  item.imageName = this.itemType.imageName  }

      const temp =  this.inputForm.value
      const useType = temp.useGroupID;
      console.log(useType)
      if (useType) {
        this.useType = this.getUseType( useType )
        item.useGroupID = this.useType.id;
        item.type       = this.useType.name;
        console.log('this.useType', this.useType)
      }

      console.log(item)
      const item$ = this.itemTypeService.putItemTypeNoChildren(site, item)

      item$.subscribe(
        {
          next: data => {
            this._snackBar.open(`Update item`, "Succcess", { duration: 2000} )
            if (optionClose) { this.onCancel(optionClose) }
            return true
         },
          error: error => {
              this._snackBar.open(`Update item ${error}`, "Failure", { duration: 2000} )
              return false
            }
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  // async updateExit() {
  //   const result =  this.update(true)
  //   if (result) {
  //     this.onCancel(true);
  //   }
  // }

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
      let item          = this.itemType;
      const id          = item.id;
      item              = this.inputForm.value;
      item.id           = id;
      item.labelTypeID  = this.labelTypeID;
      item.printerName  = this.printerName;
      item.prepTicketID = this.prepTicketID;
      this.itemType     = item;
      return item;
    }
  }

  onCancel(event) {
    this.dialogRef.close(Event);
  }

  deleteItem(event) {
    // const result = window.confirm('Are you sure you want to delete this item?')
    // if (!result) { return }
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
