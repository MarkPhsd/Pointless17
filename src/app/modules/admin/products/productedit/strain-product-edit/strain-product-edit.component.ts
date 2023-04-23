import { Component, Inject,  OnInit,} from '@angular/core';
import { MenuService } from 'src/app/_services';
import { FormBuilder, FormControl, FormGroup,} from '@angular/forms';
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

@Component({
  selector: 'app-strain-product-edit',
  templateUrl: './strain-product-edit.component.html',
  styleUrls: ['./strain-product-edit.component.scss']
})
export class StrainProductEditComponent implements OnInit {

  productForm: FormGroup;
  unitSearchForm: FormGroup;
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
  get brandID()       { return this.productForm.get("brandID") as FormControl;}
  urlImageMain: string;

  constructor(private menuService: MenuService,
              public route: ActivatedRoute,
              public fb: FormBuilder,
              private _snackBar: MatSnackBar,
              private itemTypeService  : ItemTypeService,
              private priceCategoryService: PriceCategoriesService,
              private siteService: SitesService,
              private fbProductsService: FbProductsService,
              private productEditButtonService: ProductEditButtonService,
              private dialogRef: MatDialogRef<StrainProductEditComponent>,
              private itemTypeMethodsService: ItemTypeMethodsService,
              private unitTypeMethodsService: UnitTypeMethodsService,
              private unitTypeService: UnitTypesService,
              @Inject(MAT_DIALOG_DATA) public data: any
    )
  {
    if (data) {
      if (data.product) {
        this.product = data.product
        if (this.product.id) {
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
        this.initializeForm()
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

  copyItem($event) {
    //do confirm of delete some how.
    //then
    const site = this.siteService.getAssignedSite()
    if (this.product) {
      this.performingAction= true;
      this.product.name = this.product.name + ' Copy'
      this.message = ''
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
    if (!id) { return }
    this.action$ = this.unitTypeMethodsService.openUnitEditorOBS(id).pipe(switchMap(data => {
      const search = {id: data.id} as SearchModel
      return  this.unitTypeService.getUnitTypesSearch(site, search);
    })).pipe(switchMap(data => {
      return of(data)
    }))
  }

  clearUnit() {
    this.productForm.patchValue({ unitTypeID: 0})
    this.unitSearchForm = this.fb.group({
      searchField: []
    })
  }

  assignItem(event) {
    if (!event) { return }
    if (!event.unitTypeID) {return}
    const unitTypeID = event.unitTypeID
    const unitName   = event.unitName
    const unitType   = event.unitType;
    this.product.unitTypeID = event.unitTypeID
    this.productForm.patchValue({unitTypeID: unitTypeID})
    this.action$ = this.updateItem(null)
  }

  updateItem(event) {
    const site = this.siteService.getAssignedSite()
    if (this.setValues())  {
      if (this.product.webProduct) { this.product.webProduct = -1     }
      if (!this.product.webProduct) {  this.product.webProduct = 0    }
      this.message = ""
      this.performingAction= true;
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
    console.log('images',images)
    return images
  }

  updateUrlImageMain($event) {
    this.urlImageMain = $event
    this.product.urlImageMain = $event
    // this.urlImageOther_ctl.setValue($event)
  }

  parentFunc(event){
    console.log(event)
  }

}
