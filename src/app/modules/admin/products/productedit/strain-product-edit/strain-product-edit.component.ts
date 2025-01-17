import { Component, Inject,  OnInit, Optional, TemplateRef, ViewChild,} from '@angular/core';
import { IItemBasic, MenuService } from 'src/app/_services';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup,} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IProduct } from 'src/app/_interfaces/raw/products';
import { Observable, of } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { IItemType, ItemType_Properties, ItemTypeService } from 'src/app/_services/menu/item-type.service';
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
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { EditButtonsStandardComponent } from 'src/app/shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { ActivityTogglesComponent } from '../_product-edit-parts/activity-toggles/activity-toggles.component';
import { UploaderComponent } from 'src/app/shared/widgets/AmazonServices';
import { PriceCategorySelectComponent } from '../_product-edit-parts/price-category-select/price-category-select.component';
import { PromptGroupSelectComponent } from '../_product-edit-parts/prompt-group-select/prompt-group-select.component';
import { ValueFieldsComponent } from '../_product-edit-parts/value-fields/value-fields.component';
import { MatSelectComponent } from 'src/app/shared/widgets/mat-select/mat-select.component';
import { FieldValueSelectorComponent } from '../../../report-designer/designer/field-value-selector/field-value-selector.component';
import { UnitTypeSelectComponent } from '../_product-edit-parts/unit-type-select/unit-type-select.component';
import { MetaTagChipsComponent } from '../_product-edit-parts/meta-tag-chips/meta-tag-chips.component';
import { TagChipsProductsComponent } from '../_product-edit-parts/tag-chips-products/tag-chips-products.component';
import { CategorySelectComponent } from '../_product-edit-parts/category-select/category-select.component';
import { DepartmentSelectComponent } from '../_product-edit-parts/department-select/department-select.component';
import { BrandTypeSelectComponent } from '../_product-edit-parts/brand-type-select/brand-type-select.component';
import { ProductTypeSelectComponent } from '../_product-edit-parts/product-type-select/product-type-select.component';
import { RetailProductEditComponent } from '../retail-product-edit/retail-product-edit.component';
import { CannabisItemEditComponent } from '../cannabis-item-edit/cannabis-item-edit.component';
import { ItemassociationsComponent } from '../_product-edit-parts/itemassociations/itemassociations.component';
import { UnitTypeSelectorComponent } from 'src/app/shared/widgets/unit-type-selector/unit-type-selector.component';
import { PartBuilderSelectorComponent } from '../_product-edit-parts/part-builder-selector/part-builder-selector.component';
@Component({
  selector: 'app-strain-product-edit',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    EditButtonsStandardComponent,ActivityTogglesComponent,UploaderComponent,
    PriceCategorySelectComponent,
    PromptGroupSelectComponent,
    ValueFieldsComponent,
    PartBuilderSelectorComponent,
    MatSelectComponent,
    UnitTypeSelectComponent,
    MetaTagChipsComponent,
    TagChipsProductsComponent,
    CategorySelectComponent,
    DepartmentSelectComponent,
    BrandTypeSelectComponent,
    ProductTypeSelectComponent,
    RetailProductEditComponent,
    CannabisItemEditComponent,
    ItemassociationsComponent,
    UnitTypeSelectComponent,
    UnitTypeSelectorComponent,
    SharedPipesModule],
  templateUrl: './strain-product-edit.component.html',
  styleUrls: ['./strain-product-edit.component.scss']
})
export class StrainProductEditComponent implements OnInit {

  // <div *ngIf="fbProductsService.isGrouping(itemType)">
  @ViewChild('cannabisTemplate')      cannabisTemplate : TemplateRef<any>;
  @ViewChild('priceCategoryTemplate') priceCategoryTemplate : TemplateRef<any>;
  @ViewChild('tareValueTemplate')     tareValueTemplate : TemplateRef<any>;
  @ViewChild('retailProductTemplate') retailProductTemplate : TemplateRef<any>;
  @ViewChild('gluetenFreeTemplate')   gluetenFreeTemplate : TemplateRef<any>;
  @ViewChild('liquorTemplate')        liquorTemplate : TemplateRef<any>;
  @ViewChild('priceCategorySelectorTemplate') priceCategorySelectorTemplate : TemplateRef<any>;
  @ViewChild('groceryPromptTemplate') groceryPromptTemplate : TemplateRef<any>;

  uiHome: UIHomePageSettings;
  uiHome$ : Observable<UIHomePageSettings>;

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

  get storeSelectorEnabled() {
    if (this.uiHome?.binaryStoreValue) {
      return true;
    }
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
  jsonForm             : FormGroup;
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
  createThumbNail: boolean;

  homePage$: Observable<UIHomePageSettings>;
  // uiHome: UIHomePageSettings;

  initHomePageSettings() {
    this.homePage$ =  this.uiSettings.UIHomePageSettings.pipe(switchMap( data => {
      this.uiHome  = data as UIHomePageSettings;
      return of(data)
    }));
  }

  constructor(private menuService: MenuService,
              public  route: ActivatedRoute,
              public  fb: UntypedFormBuilder,
              private itemTypeService  : ItemTypeService,
              private priceCategoryService: PriceCategoriesService,
              private siteService: SitesService,
              private uiSettings: UISettingsService,
              public  fbProductsService: FbProductsService,
              private inventoryEditButon: InventoryEditButtonService,
              private itemTypeMethodsService: ItemTypeMethodsService,
              private unitTypeMethodsService: UnitTypeMethodsService,
              public  labelingService: LabelingService,
              private unitTypeService: UnitTypesService,
              private settingService: SettingsService,
              private productEditButtonService: ProductEditButtonService,
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
    this.uiHome$ = this.settingService.getUIHomePageSettings().pipe(switchMap(data => {
      this.uiHome = data;
      return of(data)
    }))
    // this.uiHome.
  }

  refreshProductInfo(product: IProduct, itemType: IItemType) {
    if (itemType) {  this.itemType = itemType  }
    if (product) {   this.product  = product  }

    if (product.id) {
      this.initializeForm();
      this.initMenuButtonJson(product);
      this.initJSONForm(this.product.json)
      this.id = product.id.toString();

      if (product &&  itemType &&  itemType.id) {
        if (!product.prodModifierType ) {
          this.product.prodModifierType = parseInt(itemType?.id.toString());
        }
      }
    }
  }

  setInit(data) {

    try {
      this.initPbSearchForm();
      this.initUnitForm();
      this.initReOrderUnitSearchForm();

      const product = data?.product;
      const itemType = data?.itemType;
      if (data.product) {
        this.refreshProductInfo(product, itemType)
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

    this.logInvalidControls(this.productForm)
    this.logInvalidControls(this.unitSearchForm)
    this.logInvalidControls(this.reOrderUnitSearchForm)
    this.logInvalidControls(this.pbSearchForm)
    this.logInvalidControls(this.jsonForm)


   // productForm          : UntypedFormGroup;
    // unitSearchForm       : UntypedFormGroup;
    // reOrderUnitSearchForm: UntypedFormGroup;
    // pbSearchForm         : UntypedFormGroup;
    // jsonForm             : FormGroup;
  };

  logInvalidControls(form: FormGroup) {
    try {
      Object.keys(form.controls).forEach(key => {
        const control = form.get(key);
        if (!control) {
          console.error(`Control with name '${key}' is missing or null.`);
        } else {
          // console.log(`${key}:`, control);
        }
      });
    } catch (error) {

    }
  }

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
      this.urlImageMain = this.product?.urlImageMain;
      this.thumbnail = this.product?.thumbnail;
      this.createThumbNail = true;
      if (this.thumbnail) {
        this.createThumbNail = false
      }
    }
  };

  initFormFields() {
    this.productForm  = this.fbProductsService.initForm(this.productForm)
  }

  setValues(): boolean {
    this.product  = this.fbProductsService.setProductValues(this.product, this.productForm)
    if (this.product) {   return true  }
  }

  assignItem(event) {
    // console.log('assignItem',event.unitTypeID, event?.id, event.value, event)
    if (!event) { return }
    if (!event.unitTypeID) {return}
    this.product.unitTypeID = event.id
    this.productForm.patchValue({unitTypeID: event?.id})
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
    // console.log('update item product', this.product)
    let itemType: IItemType;
    if (this.setValues())  {
      if (this.product.webProduct) { this.product.webProduct   = -1     }
      if (!this.product.webProduct) {  this.product.webProduct = 0    }
      this.message          = ""
      this.performingAction = true;
      this.product.json     = this.JSONAsString ;
      this.product.metaTags = this.itemTags;

      this.product = this.setPrefixPosFix(this.product)

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

            this.urlImageMain     = this.product?.urlImageMain;
            this.thumbnail        = this.product?.thumbnail;

            return this.itemTypeService.getItemType(site, this.product?.prodModifierType)
        }
      )).pipe(switchMap(data => {
          this.setInit({product: this.product, itemType: data})
          return this.menuService.getMenuItemByID(site, this.product.id)
        }
      )).pipe(switchMap(data => {
        this.menuService.updateMenuItem(data)
        return of(this.product)
      }))
    }
  }

  // setPrefixPosFix(product: IProduct) {
  //   if (this.product) {
  //     if (this.itemType) {
  //       if (this.itemType.json) {
  //         const itemProp = JSON.parse(this.itemType.json) as ItemType_Properties;
  //         // itemNamePrefix: string;
  //         // itemNameSuffix: string;
  //         product.name = `${itemProp.itemNamePrefix} ${product.name} ${itemProp.itemNameSuffix}`
  //       }
  //     }
  //   }
  // }

  setPrefixPosFix(product: IProduct) {
    if (this.product) {
      if (this.itemType) {
        if (this.itemType.json) {
          const itemProp = JSON.parse(this.itemType.json) as ItemType_Properties;
          let { itemNamePrefix, itemNameSuffix } = itemProp;

          // Ensure that prefix and suffix are only added if they are not already part of the name
          if (itemNamePrefix && !product.name.startsWith(itemNamePrefix)) {
            product.name = `${itemNamePrefix} ${product.name}`;
          }

          if (itemNameSuffix && !product.name.endsWith(itemNameSuffix)) {
            product.name = `${product.name} ${itemNameSuffix}`;
          }
        }
      }
    }
    return product;
  }


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
      this.productForm.patchValue({urlImageMain: data})
    }

    console.log('out put files received', event, this.product)
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

  updateUrlImageMain(event) {
    this.urlImageMain = event
    this.product.urlImageMain = event
    this.productForm.patchValue({urlImageMain: event})
  }

  setThumbNail(event) {
    this.thumbnail = event;
    this.product.thumbnail = event;
    this.productForm.patchValue({thumbnail: event})
    console.log(this.product)
  }

  openStoreSelector() {
    const site = this.siteService.getAssignedSite()
    this.action$ = this.menuService.getMenuItemByID(site, this.product?.id).pipe(switchMap(data => {
      const dialogRef = this.productEditButtonService.openStoreSelector({menuItem: data, activeOnly: true})
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          this.product = data
        }
      })
      return of(data)
    }))

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
