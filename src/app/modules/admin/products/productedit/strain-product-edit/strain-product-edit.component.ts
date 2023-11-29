import { Component, Inject,  OnInit,} from '@angular/core';
import { IItemBasic, MenuService } from 'src/app/_services';
import { FormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup,} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IProduct } from 'src/app/_interfaces/raw/products';
import { Observable, of } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSnackBar} from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { switchMap } from 'rxjs/operators';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { ItemTypeMethodsService } from 'src/app/_services/menu/item-type-methods.service';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { UnitTypeMethodsService } from 'src/app/_services/menu/unit-type-methods.service';
import { SearchModel } from 'src/app/_services/system/paging.service';
import { IMenuItem, menuButtonJSON } from 'src/app/_interfaces/menu/menu-products';
import { LabelingService } from 'src/app/_labeling/labeling.service';

@Component({
  selector: 'app-strain-product-edit',
  templateUrl: './strain-product-edit.component.html',
  styleUrls: ['./strain-product-edit.component.scss']
})
export class StrainProductEditComponent implements OnInit {

  managerProtected     : boolean;
  productForm          : UntypedFormGroup;
  unitSearchForm       : UntypedFormGroup;
  reOrderUnitSearchForm: UntypedFormGroup;
  pbSearchForm         : UntypedFormGroup;

  jsonForm: FormGroup;
  get f() { return this.productForm;}
  action$             :  Observable<any>;
  performingAction    : boolean;
  message             = ""
  bucketName:             string;
  awsBucketURL:           string;
  id:                     string;
  product$:               Observable<IProduct>;
  product = {} as         IProduct;
  result:                 any;
  priceCategoryID:        number;
  itemType                = {} as IItemType;
  get brandID()       { return this.productForm.get("brandID") as UntypedFormControl;}
  urlImageMain: string;
  productJSONObject: menuButtonJSON;
 
  itemTags: string;
  //size search selector add on
  unitTypeNameSelected: string;
  unitTypeSelections = []   as IItemBasic[];
  unitSelectorSearchForm: FormGroup

  constructor(private menuService: MenuService,
              public  route: ActivatedRoute,
              public  fb: UntypedFormBuilder,
              private _snackBar: MatSnackBar,
              private itemTypeService  : ItemTypeService,
              private priceCategoryService: PriceCategoriesService,
              private siteService: SitesService,
              public fbProductsService: FbProductsService,
              private productEditButtonService: ProductEditButtonService,
              private itemTypeMethodsService: ItemTypeMethodsService,
              private unitTypeMethodsService: UnitTypeMethodsService,
              public  labelingService: LabelingService,
              private unitTypeService: UnitTypesService,
              private dialogRef: MatDialogRef<StrainProductEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
    )
  {

    //init all search forms that are not bound to data.
    this.initPbSearchForm();
    this.initUnitForm();
    this.initReOrderUnitSearchForm();

    if (data) {
      if (data.product) {
        this.product = data.product as IProduct
        if (this.product.id) {
          this.initMenuButtonJson(this.product);
          this.initJSONForm(this.product.json)
          this.id = this.product.id.toString();
          if (this.product && data.itemType && data.itemType.id) {
            if (!this.product.prodModifierType ) {
              this.product.prodModifierType = parseInt(data.itemType.id);
            }
          }
        }
        if (data.itemType) {
          this.itemType = data.itemType
        }
      }

    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }

  initUnitSearchForm() {
    this.unitSelectorSearchForm = this.fb.group( {
      unitTypeSelections: ['']
    });
    this.unitSelectorSearchForm.patchValue({ unitTypeSelections: ''})
    this.unitTypeNameSelected = '';
  }

  getUnitSelectorItem(event) { 
      const item = {} as IItemBasic;
      item.name = event?.name;
      item.id = event?.id;
      if (!this.unitTypeSelections) { this.unitTypeSelections= [] as IItemBasic[] }
      this.unitTypeSelections.push(item);
      this.initUnitSearchForm();
  }

  initJSONForm(prodJSON: string) {
    this.jsonForm = this.fb.group({
       tareValue: [],
       pieceWeight: [],
       unitTypeSelections: [],
    })
    
    try {
      const item = JSON.parse(prodJSON)
      this.unitTypeSelections = JSON.parse(this.productJSONObject.unitTypeSelections)
    } catch (error) {
      
    }
    this.initUnitSearchForm()
  }

  initMenuButtonJson(product: IProduct) {
    if (product && !product.json) {
      this.productJSONObject  = {}  as menuButtonJSON;
      this.productJSONObject.buttonColor = '';
      this.productJSONObject.backColor = '';
      this.productJSONObject.managerProtected = false;
      this.productJSONObject.pieceWeight = 0;
      this.productJSONObject.tareValue = 0;
      this.productJSONObject.unitTypeSelections = null;
      return
    }
    // product.reOrderUnitTypeID
    if (product.json) {
      try {
        this.productJSONObject = JSON.parse(product.json) as menuButtonJSON
        this.managerProtected = this.productJSONObject?.managerProtected;
      } catch (error) {
        
      }
    }
  }

  get JSONAsString() {
    if (this.product) {
      if (this.jsonForm) {
        this.productJSONObject.tareValue = this.jsonForm.controls['tareValue'].value
        this.productJSONObject.pieceWeight =  this.jsonForm.controls['pieceWeight'].value
        // this.productJSONObject.unitTypeSelections =  this.jsonForm.controls['unitTypeSelections'].value as IItemBasic[];
      }

      try {
        this.productJSONObject.unitTypeSelections = JSON.stringify(this.unitTypeSelections);
        this.productJSONObject.managerProtected = this.managerProtected;
        return JSON.stringify(this.productJSONObject) ;
      } catch (error) {
        return ''
      } 
      return this.product.json
    }
   
  }

  ngOnInit() {
    this.initializeDataAndForm()
  };

  initializeDataAndForm() {
    const site = this.siteService.getAssignedSite();
    this.product$ = this.menuService.getProduct(site, this.id).pipe(switchMap(data => {
      this.product = data;
      return  this.itemTypeService.getItemType(site, this.product.prodModifierType)
      })).pipe(switchMap(data => {
        this.itemType = data

        this.initializeForm();
        this.initJSONForm(this.product.json)

        return of(this.product)
    }))
  }

  editType() {
    if (this.product.prodModifierType) {
      let dialogRef = this.itemTypeMethodsService.openItemEditor(this.product.prodModifierType);
      dialogRef.afterClosed().subscribe(result => {
        //need to refresh whole item in case features about it change.
        this.product = null;
        this.initializeDataAndForm()
        if (result) {
        }
      });
    }
  }

  initializeForm()  {
    const site = this.siteService.getAssignedSite();
    this.initFormFields();
    if (this.productForm && this.product) {
      this.productForm.patchValue(this.product)
      this.urlImageMain = this.product.urlImageMain;
    }
  };

  initFormFields() {
    this.productForm  = this.fbProductsService.initForm(this.productForm)
  }

  setValues(): boolean {
    this.product  = this.fbProductsService.setProductValues(this.product, this.productForm)
    if (this.product) {
      this.product.urlImageMain  = this.urlImageMain
      return true
    }
  }

  assignItem(event) {
    if (!event) { return }
    if (!event.unitTypeID) {return}
    this.product.unitTypeID = event.unitTypeID
    this.productForm.patchValue({unitTypeID: event?.unitTypeID})
    this.action$ = this.updateItem(null)
  }

  reOrderUnitAssignItem(event) {
    if (!event) { return }
    if (!event.unitTypeID) {return}
    this.product.reOrderUnitTypeID = event.reOrderUnitTypeID
    this.productForm.patchValue({reOrderUnitTypeID: event?.reOrderUnitTypeID})
    this.action$ = this.updateItem(null)
  }

  setPartBuilder(event) {
    if (!event) { return }
    // console.log('event',event, event.value, event.pB_MainID)
    this.product.pB_MainID = event.pB_MainID;
    this.productForm.patchValue(event)
    console.log(this.productForm.value);
    this.action$ = this.updateItem(null)
  }

  copyItem($event) {
    //do confirm of delete some how.
    //then
    const site = this.siteService.getAssignedSite()
    if (this.product) {
      this.performingAction= true;
      this.product.name = this.product.name + ' Copy'
      this.message = ''
      this.product.json = this.JSONAsString;
      this.action$ = this.menuService.postProduct(site, this.product).pipe(
        switchMap(data => {
          this.product = data;
          this.message = 'Saved'
          this.performingAction = false;
          return of(data)
        })
      )
    }
  }

  openUnit() {
    const site = this.siteService.getAssignedSite();
    const id = this.productForm.controls['unitTypeID'].value;
    this.action$ = this.unitTypeMethodsService.openUnitEditorOBS(id).pipe(switchMap(data => {
      const search = {id: data.id} as SearchModel
      return  this.unitTypeService.getUnitTypesSearch(site, search);
    })).pipe(switchMap(data => {
      return of(data)
    }))
  }

  openReOrderUnit() {
    const site = this.siteService.getAssignedSite();
    const id = this.productForm.controls['reOrderUnitTypeID'].value;
    this.action$ = this.unitTypeMethodsService.openUnitEditorOBS(id).pipe(switchMap(data => {
      const search = {id: data.id} as SearchModel
      return  this.unitTypeService.getUnitTypesSearch(site, search);
    })).pipe(switchMap(data => {
      return of(data)
    }))
  }

  initPbSearchForm(){
    this.pbSearchForm = this.fb.group({
      searchField: [],
    })
  }

  clearUnit() {
    this.productForm.patchValue({ unitTypeID: 0})
    this.product.unitTypeID = 0;
    this.initUnitForm();
  }

  clearReOrderUnit() {
    this.productForm.patchValue({ reOrderUnitTypeID: 0})
    this.product.reOrderUnitTypeID = 0;
    this.initReOrderUnitSearchForm();
  }

  
  setItemTags(event) {
    console.log(' edit item tags', event)
    this.itemTags = event;
  }

  initUnitForm() {
    this.unitSearchForm = this.fb.group({
      searchField: []
    })
  }

  initReOrderUnitSearchForm() {
    this.reOrderUnitSearchForm = this.fb.group({
      searchField: []
    })
  }

  clearPB() {
    this.productForm.patchValue({ pB_MainID: 0})
    this.product.pB_MainID = 0;
    this.initPbSearchForm();
  }

  updateItem(event) {
    const site = this.siteService.getAssignedSite()
    if (this.setValues())  {
      if (this.product.webProduct) { this.product.webProduct = -1     }
      if (!this.product.webProduct) {  this.product.webProduct = 0    }
      this.message = ""
      this.performingAction= true;
      this.product.json = this.JSONAsString ;
      this.product.metaTags = this.itemTags;
      this.product = this.menuService.cleanProduct(this.product)

      const product$ = this.menuService.saveProduct(site, this.product);
      return product$.pipe(switchMap(
          data => {
            if (data) {
              if (data.errorMessage) {
                this.notifyEvent('Save did not succeed: ' + data.errorMessage, 'Success')
                return of(data)
              }
            }
            this.product = data;
            this.notifyEvent('Item Updated', 'Success')
            this.message = 'Saved'
            this.performingAction = false;
            return this.itemTypeService.getItemType(site,this.product.prodModifierType)
          }
      ))
    }
  };

  updateSave(event) {
    this.action$ = this.updateItem(event);
  }

  updateItemExit(event) {
    this.action$ = this.updateItem(event).pipe(switchMap ( data => {
      this.performingAction = false;
      this.onCancel(event);
      return of(data);
    }));
  };

  openPriceCategory() {
    if (!this.product) { return }
    this.priceCategoryService.openPriceCategoryEditor(this.product.priceCategory)
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  deleteItem(event) {
    const site = this.siteService.getAssignedSite()
    if (!this.product) {
      this._snackBar.open("No Product Selected", "Success")
       return
    }

    this.action$ =  this.menuService.deleteProduct(site, this.product.id).pipe(
      switchMap( data =>{
        this.notifyEvent(data.toString(), "Result")
        this.onCancel(event)
        return of(data)
      })
    )
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  //image data
  received_URLMainImage(event) {
    let data = event
    this.urlImageMain = data
    if (this.product) {
      this.product.urlImageMain  = this.urlImageMain
    }
    if (this.id) {  this.updateItem(null); }
  };


  removeItemFromArray(itemToRemove : string, arrayString : any): any {
    let images = '';
    if (!arrayString){
      return ""
    } else {
      let array = arrayString.split(",")
      array.forEach( element => {
        if ( element = itemToRemove ) {
          array.pop()
          images =  array.toString()
        }
      });
    }
    // console.log('images',images)
    return images
  }

  updateUrlImageMain($event) {
    this.urlImageMain = $event
    this.product.urlImageMain = $event
    // this.urlImageOther_ctl.setValue($event)
  }

  parentFunc(event){
    // console.log(event)
  }

  removeAddOnSize(item: IItemBasic): void {
    const index = this.unitTypeSelections.indexOf(item);

    if (index >= 0) {
      this.unitTypeSelections.splice(index, 1);
    }
  }


}
