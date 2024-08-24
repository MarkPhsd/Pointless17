import { Component, Inject,  OnInit, Optional, TemplateRef, ViewChild,} from '@angular/core';
import { IItemBasic, MenuService } from 'src/app/_services';
import { FormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup,} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IProduct } from 'src/app/_interfaces/raw/products';
import { Observable, of } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { catchError, switchMap } from 'rxjs/operators';
import { ItemTypeMethodsService } from 'src/app/_services/menu/item-type-methods.service';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { UnitTypeMethodsService } from 'src/app/_services/menu/unit-type-methods.service';
import { SearchModel } from 'src/app/_services/system/paging.service';
import { menuButtonJSON } from 'src/app/_interfaces/menu/menu-products';
import { LabelingService } from 'src/app/_labeling/labeling.service';
import { InventoryEditButtonService } from 'src/app/_services/inventory/inventory-edit-button.service';

import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
@Component({
  selector: 'app-strain-product-edit',
  templateUrl: './strain-product-edit.component.html',
  styleUrls: ['./strain-product-edit.component.scss']
})
export class StrainProductEditComponent implements OnInit {

  // <div *ngIf="fbProductsService.isGrouping(itemType)">
  @ViewChild('cannabisTemplate')     cannabisTemplate : TemplateRef<any>;
  @ViewChild('priceCategoryTemplate') priceCategoryTemplate : TemplateRef<any>;
  @ViewChild('tareValueTemplate')     tareValueTemplate : TemplateRef<any>;
  @ViewChild('retailProductTemplate') retailProductTemplate : TemplateRef<any>;
  @ViewChild('gluetenFreeTemplate')   gluetenFreeTemplate : TemplateRef<any>;
  @ViewChild('liquorTemplate') liquorTemplate : TemplateRef<any>;
  @ViewChild('priceCategorySelectorTemplate') priceCategorySelectorTemplate : TemplateRef<any>;
  @ViewChild('groceryPromptTemplate') groceryPromptTemplate : TemplateRef<any>;

  thumbNailWidth: number = 110
  thumbNailHeight: number = 80
  get groceryPromptView() {
    const itemType = this.itemType;
    if ( itemType && itemType.useType && (itemType.type?.toLowerCase() === 'grocery' ||
          itemType.type?.toLowerCase() === 'tobacco' ||
          itemType.type?.toLowerCase() === 'restaurant' ||
          itemType.type?.toLowerCase() === 'food')) {
      return this.groceryPromptTemplate
    }
    return null;
  }

  get priceCategorySelectorView() {
    const itemType = this.itemType;
    if (itemType &&  (itemType.useType &&
          ( itemType.useType?.toLowerCase() === 'product' ||
            itemType.useType?.toLowerCase() === 'modifier'
          ) )) {
      return this.priceCategorySelectorTemplate
    }
    return null;
  }

  get liquorView() {
    const itemType = this.itemType;
    if (this.fbProductsService.isLiquor(itemType)) {
      return this.liquorTemplate
    }
    return null;
  }
  get cannabisView() {
    const itemType = this.itemType;
    if (this.fbProductsService.isCannabis(this.itemType)) {
      return this.cannabisTemplate;
    }
    return null;
  }

  get gluetenFreeView() {
    const itemType = this.itemType;
    if (itemType && itemType.useType && (itemType.type?.toLowerCase() === 'grocery' ||
         itemType.type?.toLowerCase() === 'restaurant')) {
     return this.gluetenFreeTemplate
    }
    return null;
  }

  get tareValueView() {
    const itemType = this.itemType;
    if (this.fbProductsService.isWeightedItem(itemType)) {
      return this.tareValueTemplate
    }
    return null;
  }

  get retailProductView() {
    const itemType = this.itemType;
   if (this.fbProductsService.isRetail(itemType)){
    return this.retailProductTemplate
   }
   return null;
  }

  get tareValueTemplateView() {
   const itemType = this.itemType;
   if (this.fbProductsService.isWeightedItem(itemType)) {
    return this.tareValueTemplate;
   }
   return null;
  }

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
  thumbnail : string;

   genders = this.menuService.genders;
  itemTags: string;
  //size search selector add on
  unitTypeNameSelected: string;
  unitTypeSelections = []   as IItemBasic[];
  unitSelectorSearchForm: FormGroup
  dialogData: any;

  constructor(private menuService: MenuService,
              public  route: ActivatedRoute,
              public  fb: UntypedFormBuilder,
              private itemTypeService  : ItemTypeService,
              private priceCategoryService: PriceCategoriesService,
              private siteService: SitesService,
              public  fbProductsService: FbProductsService,
              private inventoryEditButon: InventoryEditButtonService,
              private itemTypeMethodsService: ItemTypeMethodsService,
              private unitTypeMethodsService: UnitTypeMethodsService,
              public  labelingService: LabelingService,
              private unitTypeService: UnitTypesService,
              @Optional() private dialogRef: MatDialogRef<StrainProductEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
    )
  {
    if (data) {
      this.dialogData = data;
    }
    if (!data) {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }

  refreshProductInfo(product: IProduct, itemType: IItemType) {

    if (itemType) {  this.itemType = itemType  }
    if (product) {   this.product = product as IProduct  }

    if (this.product.id) {
      this.initializeForm();
      this.initMenuButtonJson(this.product);
      this.initJSONForm(this.product.json)
      this.id = this.product.id.toString();

      if (this.product &&  itemType &&  itemType.id) {
        if (!this.product.prodModifierType ) {
          this.product.prodModifierType = parseInt(itemType?.id.toString());
        }
      }
    }
  }

  setInit(data) {
    //init all search forms that are not bound to data.
    console.log ('set init data', data)
    try {
      this.initPbSearchForm();
      this.initUnitForm();
      this.initReOrderUnitSearchForm();
      if (data) {
        if (data.product) {
          this.refreshProductInfo(data?.product, data?.itemType)
        }
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  ngOnInit() {
    // console.log('ngOninit data', this.dialogData)
    this.setInit(this.dialogData)
    if (!this.dialogData) {
      this.initializeDataAndForm()
    }
  };

  updateSave(event) {
    this.action$ = this.updateItem(event);
  }

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

  setGender(event) {
    this.productForm.patchValue({gender: event.id})
    this.product.gender = event.id;
  }

  initUnitSearchForm() {
    this.unitSelectorSearchForm = this.fb.group( {
      unitTypeSelections: ['']
    });
    this.unitSelectorSearchForm.patchValue({ unitTypeSelections: ''})
    this.unitTypeNameSelected = '';
  }

  openWebEditor() {
    this.inventoryEditButon.openProductDialog(this.product.id,)
    this.dialogRef.close()
    // this.action$ =  this.productEditButtonService.openProductEditorOBS(this.product.id, this.product.prodModifierType)
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
    if (!prodJSON) {}
    this.jsonForm = this.fb.group({
       backColor: [],
       buttonColor: [],
       managerProtected: [],
       tareValue: [],
       pieceWeight: [],
       unitTypeSelections: [],
       limitMultiplier: [],
       requiresIDCheck: [],
    })


    try {
      const item = JSON.parse(prodJSON) as menuButtonJSON
      this.jsonForm.patchValue(item)

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
      this.productJSONObject.limitMultiplier = 1;
      return
    }
    // product.reOrderUnitTypeID
    if (product.json) {
      try {
        this.productJSONObject = JSON.parse(product.json) as menuButtonJSON
        this.managerProtected = this.productJSONObject?.managerProtected;
      } catch (error) {
        console.log('json error menu button')
      }
    }
  }

  // backColor: string;
  // buttonColor: string;
  // managerProtected: boolean;
  // tareValue: number;
  // pieceWeight: number;
  // unitTypeSelections: string;
  // limitMultiplier: number;

  get JSONAsString() {
    if (this.product) {
      if (this.jsonForm) {
        this.productJSONObject.tareValue = this.jsonForm.controls['tareValue'].value
        this.productJSONObject.pieceWeight =  this.jsonForm.controls['pieceWeight'].value
        this.productJSONObject.limitMultiplier =  this.jsonForm.controls['limitMultiplier'].value
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
      this.thumbnail = this.product.thumbnail;
    }
  };

  initFormFields() {
    this.productForm  = this.fbProductsService.initForm(this.productForm)
  }

  setValues(): boolean {
    this.product  = this.fbProductsService.setProductValues(this.product, this.productForm)
    if (this.product) {
      this.product.urlImageMain  = this.urlImageMain;
      this.urlImageMain = this.product.urlImageMain;
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
    const site = this.siteService.getAssignedSite();

    if (this.product) {
      this.performingAction= true;
      this.product.name = this.product.name + ' Copy'
      this.message = ''
      this.product.json = this.JSONAsString;

      this.action$ = this.menuService.postProduct(site, this.product).pipe(
        switchMap(data => {
          this.product = data;
          this.message = 'Saved'
          this.productForm.patchValue(data)
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
      this.product.json     = this.JSONAsString ;
      this.product.metaTags = this.itemTags;
      this.product          = this.menuService.cleanProduct(this.product)

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

            return this.itemTypeService.getItemType(site,this.product.prodModifierType).pipe(switchMap(data => {
              this.setInit({product: data, itemType: data})
              return of(data)
            }))
          }
      ))
    }
  };



  updateItemExit(event) {
    this.message = "Saving"
    this.action$ = this.updateItem(event).pipe(switchMap ( data => {
      this.performingAction = false;
      this.message = "''"
      this.onCancel(event);
      return of(data);
    })),catchError(data => {
      this.message = data.toString()
      return of(data)
    });
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
      this.siteService.notify("No Product Selected", 'close', 2000, 'green')
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
    this.siteService.notify(message, action, 2000, 'green')
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
  }

  setThumbNail(event) {
    this.thumbnail = event;
    this.product.thumbnail = event;
    this.productForm.patchValue({thumbnail: event})
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
