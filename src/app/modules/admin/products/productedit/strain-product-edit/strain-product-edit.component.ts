import { Component, Inject,  OnInit,} from '@angular/core';
import { MenuService } from 'src/app/_services';
import { FormBuilder, FormControl, FormGroup,} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar} from '@angular/material/snack-bar';
import { IProduct } from 'src/app/_interfaces/raw/products';
import { Observable } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-strain-product-edit',
  templateUrl: './strain-product-edit.component.html',
  styleUrls: ['./strain-product-edit.component.scss']
})
export class StrainProductEditComponent implements OnInit {

  productForm: FormGroup;

  get f() { return this.productForm;}

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
              private dialogRef: MatDialogRef<StrainProductEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
    )
  {
    if (data) {
      // this.id = data.id
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

  async ngOnInit() {

    const site = this.siteService.getAssignedSite();
    if (this.id == '0') {
      this.product$ = this.menuService.getProduct(site, this.id)
    }

    if (!this.product) {
      this.product = await this.product$.pipe().toPromise();
    }

    if (!this.product) { return }

    if (this.itemType) {
      this.product.prodModifierType = this.itemType.id;
      console.log('current item type, product.itemType', this.itemType.id)
    }

    if (!this.itemType) {
      if (this.product && this.product.prodModifierType && this.product.prodModifierType != 0) {
        this.itemTypeService.getItemType(site, this.product.prodModifierType).subscribe(itemType=> {
          this.itemType = itemType
        }, catchError  => {
          console.log('err', catchError)
        }
        )
      }
    }

    this.initializeForm()
  };

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

  async  updateItem(event): Promise<boolean> {
    const site = this.siteService.getAssignedSite()
    if (this.setValues())  {
      const product$ = this.menuService.saveProduct(site, this.product);
      product$.pipe(switchMap(
          data => {
            this.product = data;
            return this.itemTypeService.getItemType(site,this.product.prodModifierType)
          }
      )).subscribe(data => {
        this.notifyEvent('Item Updated', 'Success')
        this.itemType = data;
      })
    }
    return false
  };

  updateItemExit(event) {
    if  (this.updateItem(event)) {
      this.onCancel(event);
    }

  };

  openPriceCategory() {
    if (!this.product) { return }
    this.priceCategoryService.openPriceCategoryEditor(this.product.priceCategory)
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  deleteItem(event) {

    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }

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
