import { ChangeDetectionStrategy, Component, Inject, Input,  OnInit,} from '@angular/core';
import { AWSBucketService, MenuService } from 'src/app/_services';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, FormsModule, ReactiveFormsModule,  } from '@angular/forms';
import { ActivatedRoute,  } from '@angular/router';
import { Subject, of } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { MatLegacySnackBar as MatSnackBar} from '@angular/material/legacy-snack-bar';
import { IProduct } from 'src/app/_interfaces/raw/products';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { PriceCategories } from 'src/app/_interfaces/menu/price-categories';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { employee } from 'src/app/_interfaces';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { EditButtonsStandardComponent } from 'src/app/shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { ActivityTogglesMetrcComponent } from '../../metrc/packages/metrc-inventory-properties/activity-toggles-metrc/activity-toggles-metrc.component';
import { ActivityTogglesComponent } from './_product-edit-parts/activity-toggles/activity-toggles.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ValueFieldsComponent } from './_product-edit-parts/value-fields/value-fields.component';
import { CategorySelectComponent } from './_product-edit-parts/category-select/category-select.component';
import { DepartmentSelectComponent } from './_product-edit-parts/department-select/department-select.component';
import { BrandTypeSelectComponent } from './_product-edit-parts/brand-type-select/brand-type-select.component';
import { PriceCategorySelectComponent } from './_product-edit-parts/price-category-select/price-category-select.component';
import { MetaTagChipsComponent } from './_product-edit-parts/meta-tag-chips/meta-tag-chips.component';
import { UploaderComponent } from 'src/app/shared/widgets/AmazonServices';

// http://jsfiddle.net/0ftj7w1q/

@Component({
  selector: 'app-productedit',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
  EditButtonsStandardComponent,ActivityTogglesMetrcComponent,
  ActivityTogglesComponent,
  ValueFieldsComponent,
  CategorySelectComponent,
  DepartmentSelectComponent,
  BrandTypeSelectComponent,
  PriceCategorySelectComponent,
  MetaTagChipsComponent,
  UploaderComponent,
  SharedPipesModule],
  templateUrl: './productedit.component.html',
  styleUrls: ['./productedit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ProducteditComponent implements  OnInit  {

  productForm: UntypedFormGroup;
  itemTags   : string;
  action$    : Observable<any>;

  get f()             { return this.productForm;}
  get fullProductName(){return this.productForm.get("fullProductName") as UntypedFormControl;}
  get name()          { return this.productForm.get("name") as UntypedFormControl;}
  get metaTags()      { return this.productForm.get("metaTags") as UntypedFormControl;}
  get msrp()          { return this.productForm.get("msrp") as UntypedFormControl;}
  get retail()        { return this.productForm.get("retail") as UntypedFormControl;}
  get priceCategory() { return this.productForm.get("priceCategory") as UntypedFormControl;}
  get brandID()       { return this.productForm.get("brandID") as UntypedFormControl;}
  get taxLookUp()     { return this.productForm.get("taxLookUp") as UntypedFormControl;}
  get tax2()          { return this.productForm.get("tax2") as UntypedFormControl;}
  get tax3()          { return this.productForm.get("tax3") as UntypedFormControl;}
  get taxable()       { return this.productForm.get("taxable") as UntypedFormControl;}
  get categoryID()    { return this.productForm.get("categoryID") as UntypedFormControl;}
  get subCategoryID() { return this.productForm.get("subCategoryID") as UntypedFormControl;}
  get departmentID()  { return this.productForm.get("departmentID") as UntypedFormControl;}
  get prodModifierType()  { return this.productForm.get("prodModifierType") as UntypedFormControl;}
  // get urlImageOther_ctl() { return this.productForm.get("departmentID") as FormControl;}
  // get urlImageMain_ctl()  { return this.productForm.get("departmentID") as FormControl;}
  priceCategories:        PriceCategories;
  displayContent        : boolean;
  bucketName:             string;
  awsBucketURL:           string;
  dispatcherID          : number
  showDescription       : boolean;

  id: string;
  product$     : Observable<IProduct>;
  dispatchers$ : Observable<employee[]>;
  departments$ : Observable<IMenuItem[]>;
  departments  : IMenuItem[];

  itemType     = {} as IItemType;

  product = {} as IProduct;
  result  : any;
  onlineDescription = '';
  onlineShortDescription = '';
  productTypeID: number;
  priceCategoryID: number;
  notificationDurationInSeconds = 5;

  //these are from the components as well.
  @Input() urlImageOther: string;
  @Input() urlImageMain: string;
  @Input() fileName: string;

  returnUrl: string;

  childNotifier : Subject<boolean> = new Subject<boolean>();

  constructor(private menuService: MenuService,
              public  route: ActivatedRoute,
              public  fb: UntypedFormBuilder,
              private sanitizer : DomSanitizer,
              private awsBucket: AWSBucketService,
              private _snackBar: MatSnackBar,
              private priceCategoryService: PriceCategoriesService,
              private siteService: SitesService,
              private fbProductsService: FbProductsService,
              private itemTypeService  : ItemTypeService,
              private productEditButtonService: ProductEditButtonService,
              private dialogRef: MatDialogRef<ProducteditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
            )
  {
    if (data) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }
    this.initializeForm()
  }

  async ngOnInit() {
    this.bucketName   =    await this.awsBucket.awsBucket();
    this.awsBucketURL =    await this.awsBucket.awsBucketURL();
  };

  openProductEditor() {
    // this.inventoryEditButon.openProductDialog(this.product.id,)
    this.action$ =  this.productEditButtonService.openProductEditorOBS(this.product.id, this.product.prodModifierType).pipe(switchMap(data => {
      this.dialogRef.close()
      return of(data)
    }))
  }

  refreshDisplayContent() {  this.displayContent = !this.displayContent; }

  async initializeForm()  {

    this.initFormFields();
    const site = this.siteService.getAssignedSite();

    if (this.productForm && this.id) {
      this.product$ = this.menuService.getProduct(site, this.id).pipe(
          tap(data => {
            this.product         = data
            this.priceCategoryID = this.product?.priceCategory
            this.itemTags        = this.product?.metaTags;
            this.productForm.patchValue(this.product)
          }
        )
      );

      this.product$.pipe(
        switchMap(
          data => {
            this.product = data
            this.urlImageMain  = this.product?.urlImageMain;
            this.urlImageOther = this.product?.urlImageOther;
            this.itemTags      = this.product.metaTags;
            return this.itemTypeService.getItemType(site, data.prodModifierType)
          }
      )).subscribe( data => {
        this.itemType = data
      })
    }

  };

  initFormFields() {
    this.productForm  = this.fbProductsService.initForm(this.productForm)
  }

  setValues(): boolean {
    this.product  = this.fbProductsService.setProductValues(this.product, this.productForm)
    if (this.product) {
      this.product.urlImageMain  = this.urlImageMain
      this.product.urlImageOther = this.urlImageOther
      return true
    }
  }

  async updateItem(event): Promise<boolean> {
    let result: boolean;
    return new Promise(resolve => {
       if (this.productForm.valid) {
        this.setValues();
        this.setNonFormValues()
        const site = this.siteService.getAssignedSite()
        const product$ = this.menuService.saveProduct(site, this.product)
        product$.subscribe( {
          next: data => {
                this.notifyEvent('Item Updated', 'Success')
                resolve(true)
              },
          error: error => {
                this.notifyEvent(`Update item. ${error}`, "Failure")
                resolve(false)
              }
          }
        )
       }
      }
    )
  };

  async updateItemExit(event) {
    const result = await this.updateItem(event)
    if (result) { this.onCancel(event);  }
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  deleteItem(event) {

    // const result = window.confirm('Are you sure you want to delete this item?')
    // if (!result) { return }

    const site = this.siteService.getAssignedSite()
    if (!this.product) {
      this._snackBar.open("No Product Selected", "Success")
       return
    }

    this.menuService.deleteProduct(site, this.product.id).subscribe( data =>{
      this._snackBar.open("Item deleted", "Success")
      this.onCancel(event)
    })
  }

  copyItem(event) {
    //do confirm of delete some how.
    //then
  }

  setNonFormValues() {
    if (this.product && this.productForm) {

      this.product                          = this.productForm.value;
      this.product.fullProductName          = this.fullProductName.value
      if (this.name.value == '') { this.product.name  = this.product.fullProductName }
      this.product.metaTags                 = this.itemTags;
      this.product.msrp                     = this.msrp.value
      this.product.priceCategory            = this.priceCategory.value
      this.product.retail                   = this.retail.value
      this.product.prodModifierType         = this.prodModifierType.value
      this.product.departmentID             = this.departmentID.value
      this.product.categoryID               = this.categoryID.value

      if (this.onlineShortDescription) {
        this.product.onlineShortDescription = this.onlineShortDescription
      }
      if (this.onlineDescription)  {
        this.product.onlineDescription      = this.onlineDescription
      }

      this.product.urlImageMain             = this.urlImageMain
      this.product.urlImageOther            = this.urlImageOther
    }
  }

  setItemTags(event) {
    console.log(' edit item tags', event)
    this.itemTags = event;
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
    if (this.id) {  this.updateItem(null); }
  };

  received_URLImageOther(event) {
    let data = event
    this.urlImageOther = data
    if (this.id) {  this.updateItem(null); }
  };

  updateUrlImageMain($event) {
    this.urlImageMain = $event
    this.product.urlImageMain = $event
  }

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
    return images
  }

  openPriceCategory() {
    if (!this.product) { return }
    this.priceCategoryService.openPriceCategoryEditor(this.product.priceCategory)
  }

  getProductTypeID(event) {
    if (event) {
      this.productTypeID = event
    }
  }
  sanitize(html) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  showDescriptions() {
    this.showDescription = !this.showDescription
    return true
  }

  getPriceCategory(event) {

    const item = event
    if (item) {
      if (item.id) {
        const site = this.siteService.getAssignedSite();
        this.priceCategoryService.getPriceCategory(site, item.id).subscribe(data => {
          this.priceCategories = data
          }
        )
      }
    }

  }

}
