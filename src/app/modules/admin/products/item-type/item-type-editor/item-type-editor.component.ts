import { Component, Inject, OnDestroy, OnInit, } from '@angular/core';
import { FbItemTypeService } from 'src/app/_form-builder/fb-item-type.service';
import { IItemType, ItemTypeService, ItemType_Properties } from 'src/app/_services/menu/item-type.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup,} from '@angular/forms';
import { ActivatedRoute,  } from '@angular/router';
import { MatLegacySnackBar as MatSnackBar} from '@angular/material/legacy-snack-bar';
import { BehaviorSubject, Observable, Subscription, of, switchMap,  } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { IPrinterLocation, PrinterLocationsService } from 'src/app/_services/menu/printer-locations.service';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { METRCItemsCategories } from 'src/app/_interfaces/metrcs/items';
import { IItemBasic, MenuService } from 'src/app/_services';
import { ItemTypeMethodsService } from 'src/app/_services/menu/item-type-methods.service';

@Component({
  selector: 'app-item-type-editor',
  templateUrl: './item-type-editor.component.html',
  styleUrls: ['./item-type-editor.component.scss']
})
export class ItemTypeEditorComponent implements OnInit, OnDestroy  {
  searchForm  : UntypedFormGroup;
  inputForm   : UntypedFormGroup;
  jsonForm    : UntypedFormGroup;

  action$: Observable<any>;

  prepList          = this.itemTypeService.prepList
  wicEBTList        = [{id: 0, name: 'NONE'},{id: 1, name: 'WIC'},{id: 2, name: 'EBT'},{id: 2, name: 'WIC and EBT'}]
  taxesSetting      = [{id: 0, name: 'Never'},{id: 1, name: 'Taxable'},{id: 2, name: 'According To Transaction'}]
  something         : any;
  itemTypes         = [] as IItemType[];
  itemType          : IItemType;
  id                : any;
  selected          : any;
  itemRowColor: string =''
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
  productName: string;

  addOnItems = [] as IItemBasic[]
  typeName         : string;
  metrcCategories$ : Observable<METRCItemsCategories[]>;

  properties: ItemType_Properties;
  metrcGroup_List :  IItemBasic[] ;

  exitSubscrption: Subscription;
  private _exitSubscrption     = new BehaviorSubject<boolean>(null);
  public  exitActions$        = this._exitSubscrption.asObservable();

  constructor(
      private fb: UntypedFormBuilder,
      private fbItemTypeService: FbItemTypeService,
      private itemTypeService: ItemTypeService,
      private menuService: MenuService,
      public  route: ActivatedRoute,
      private _snackBar: MatSnackBar,
      private settingService: SettingsService,
      private siteService: SitesService,
      private printerLocationsService: PrinterLocationsService,
      private metrcCategoryService: MetrcItemsCategoriesService,
      private itemTypeMethodsService: ItemTypeMethodsService,
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
    this.metrcGroup_List   =  this.itemTypeService.metrcGroups ;

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

  ngOnInit() {
    this.initSearchForm();
    this.exitSubscrption = this.exitActions$.subscribe(data => {
      // console.log('exit subscription', data)
      if (data && data != null) {
        // console.log('cancel')
        this.onCancel(true)
      }
    })
  }

  ngOnDestroy(): void {
    try {
      this.exitSubscrption.unsubscribe();
    } catch (error) {

    }
}
  initSearchForm() {
    this.searchForm = this.fb.group( {
      productName: []
    })
    this.searchForm.patchValue({productName: ''})
    this.productName = ''
  }

  getItem(event) {
    const item = {} as IItemBasic;
    item.name = event?.name;
    item.id = event?.id;
    if (!this.addOnItems) { this.addOnItems= [] as IItemBasic[] }
    this.addOnItems.push(item);
    this.initSearchForm();
  }

  initializeForm(id: any, form: UntypedFormGroup)  {
    if (form && id) {
      const site = this.siteService.getAssignedSite();
      this.itemType$ = this.itemTypeService.getItemType(site, id)
      this.itemType$.subscribe(
        {
          next:  data => {
            this.initFormData(data)
            this.initJSONForm(data)
          },
          error: error =>  {
            console.log(error)
          }
        }
      )
    }
  };

  setUseType(event) {
    this.useType = event;
    this.inputForm.controls['useGroupID'].setValue(this.useType.id);
    this.inputForm.controls['type'].setValue(event.name);
  }

  getUseType(id: any) {
    this.useType = this.itemType_Types.filter(data => data.id.toString() === id.toString())[0]
    // console.log('getUseType', this.useType)
    if (this.useType) {
      this.inputForm.controls['useGroupID'].setValue(this.useType.id);
      this.inputForm.controls['type'].setValue(this.useType.name);
      return this.useType;
    }
  }

  initFormFields(): UntypedFormGroup {
    this.inputForm  = this.fbItemTypeService.initForm(this.inputForm);
    return this.inputForm;
  }

  initJSONForm(itemType: IItemType): UntypedFormGroup {
    this.jsonForm = this.fb.group({
      inventoryLabelID: [],
      sellByValue: [],
      useByValue: [],
      metrcPackageWeight: [],
      metrcGroup: [],
      itemNameSuffix: [],
      itemNamePrefix: [],
    })

    if (itemType.json) {
      this.properties = JSON.parse(itemType.json) as ItemType_Properties;
    } else {
      this.properties = {} as ItemType_Properties;
    }


    this.jsonForm.patchValue(this.properties)
    return this.jsonForm
  }

  initFormData(itemType: IItemType) {
    this.itemType = itemType;
    if (this.itemType) {
      try {
        this.useType = {name: this.itemType?.type, id: this.itemType?.useGroupID}
        this.inputForm.patchValue(this.itemType);
        this.setUseType({name: this.itemType?.type, id: this.itemType?.useGroupID})
      } catch (error) {
        console.log(error)
      }
      try {
        this.labelTypeID     = this.itemType?.labelTypeID
        this.printerName     = this.itemType?.printerName
        this.prepTicketID    = this.itemType?.prepTicketID
        this.printLocationID = this.itemType?.printLocationID
        this.packageType     = this.itemType?.packageType;
        this.typeName        = this.itemType?.type;
        this.itemRowColor    = this.itemType?.itemRowColor
        this.addOnItems      = JSON.parse(this.itemType?.autoAddJSONProductList) as IItemBasic[];

      } catch (error) {
        console.log(error)
      }
    }
  }

  validateAllFormFields(formGroup: UntypedFormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(field => {  //{2}
      const control = formGroup.get(field);             //{3}
      if (control instanceof UntypedFormControl) {             //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

  save(event){
    this.update(false);
  }

  saveExit(event) {
    this.update(true);
  }

  copyItem(event) {
    const site = this.siteService.getAssignedSite();
    // console.log('copy item', event, this.itemType)
    if (this.itemType) {
      this.itemType.name = 'Copy' + this.itemType?.name
      this.itemType.id = 0
      this.action$ = this.itemTypeService.postItemType(site, this.itemType).pipe(switchMap(data => {
        let dialogRef = this.itemTypeMethodsService.openItemEditor(data.id);
        this._exitSubscrption.next(true)
        return of(data)
      }))
    }
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
      console.log('update', itemType, this.itemRowColor)

      if (this.itemTypes) {
        this.itemTypes.forEach( item => {
          const id = item.id;
          item = this.inputForm.value;
          item.id = id;
          item.labelTypeID = this.labelTypeID;
          return  this.updateItem(site, item, optionClose)
        })
      }

      if (itemType) {
        const json = JSON.stringify(this.jsonForm.value);
        itemType.json = json;
        console.log(json, itemType)
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

      if (useType) {
        this.useType = this.getUseType( useType )
        item.useGroupID = this.useType.id;
        item.type       = this.useType.name;
      }

      const json = JSON.stringify(this.jsonForm.value);
      item.json = json;
      item.autoAddJSONProductList = JSON.stringify(this.addOnItems);

      console.log(json, item)

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

  setPrepTicketID(event) {
    this.itemType.prepTicketID = parseInt(event)
  }

  setLocationID(event) {
    this.printLocationID  = parseInt(event)
  }

  setLabelID(event) {

    this.itemType.labelTypeID = parseInt(event);
    this.labelTypeID = event
  }

  setInventoryLabelID(event) {
    this.properties.inventoryLabelID = parseInt(event);
    this.jsonForm.patchValue({inventoryLabelID: parseInt(event)})
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
      item.itemRowColor = this.itemRowColor

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

  remove(item: IItemBasic): void {
    const index = this.addOnItems.indexOf(item);
    if (index >= 0) {
      this.addOnItems.splice(index, 1);
    }
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
function ofType(LoadUsers: any): any {
  throw new Error('Function not implemented.');
}

