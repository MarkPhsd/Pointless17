import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProducteditComponent } from '../productedit.component';
@Component({
  selector: 'app-edit-selected-items',
  templateUrl: './edit-selected-items.component.html',
  styleUrls: ['./edit-selected-items.component.scss']
})
export class EditSelectedItemsComponent implements OnInit {
  action$   : Observable<any>;
  inputForm : FormGroup;
  get subCategoryID()    { return this.inputForm.get("subCategoryID") as FormControl;}
  get categoryID()    { return this.inputForm.get("categoryID") as FormControl;}
  get departmentID()  { return this.inputForm.get("departmentID") as FormControl;}
  get itemTypeID()    { return this.inputForm.get("prodModifierType") as FormControl;}
  get species()       { return this.inputForm.get("species") as FormControl;}
  get brandID()       { return this.inputForm.get("brandID") as FormControl;}
  get active()        { return this.inputForm.get("active") as FormControl;}
  get webProduct()       { return this.inputForm.get("webProduct") as FormControl;}
  get webWorkRequired()       { return this.inputForm.get("webWorkRequired") as FormControl;}


  // constructor(
  //   private fb: FormBuilder) { }
  selected  : any[];

  constructor(
      private menuService: MenuService,
      public fb: FormBuilder,
      private snack: MatSnackBar,
      private siteService: SitesService,
      private dialogRef: MatDialogRef<ProducteditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    )
{

  // if (data) {
  //   this.id = data.id
  // } else {
  //   this.id = this.route.snapshot.paramMap.get('id');
  // }

  try {
    const array = data.toString();
    this.selected = array.split(',')

  } catch (error) {
    console.log('error', error)
  }

  // this.initializeForm()
}

  ngOnInit(): void {
    console.log('')

    this.inputForm = this.fb.group( {
      categoryID:       [],
      departmentID:     [],
      subCategoryID    :[],
      prodModifierType: [],
      promptGroupID   : [],
      species:          [],
      brandID:          [],
      active:           [],
      webProduct:       [],
      webWorkRequired:  [],
    })

  }

  delete() {
    const warn = window.confirm('Plase confirm. You can not reverse this decision');
    if (!warn) { return }
    const site   =  this.siteService.getAssignedSite();
    this.action$ = this.menuService.deleteProducts(site, this.selected).pipe(
      switchMap(
      data => {
        return of(`Result: ${data.toString()}. Refresh list to see results.`)
      }),
      catchError(data => {
        return of(data)
      }
      )
    )
  }

  enableAllItems() {
    const warn = window.confirm('Plase confirm. You can not reverse this decision');
    const site   =  this.siteService.getAssignedSite();
    this.action$ = this.menuService.setAllItemsActive(site).pipe(
      switchMap(
      data => {
        return of(`Result: ${data.toString()}. Refresh list to see results.`)
      }),
      catchError(data => {
        return of(data)
      }
      )
    )
  }

  exit () {
    this.dialogRef.close()
  }

  updateItems() {
    if (this.selected) {

      const selected = this.selected
      const promptGroupID = this.inputForm.controls['promptGroupID'].value;

      if (promptGroupID !=0 &&  promptGroupID != undefined) {
        // this.updateCategoryID(this.categoryID.value, this.selected)
        this.updateField(promptGroupID, this.selected, 'promptGroupID');
      }

      if (this.categoryID.value !=0 && this.categoryID.value != undefined) {
        // this.updateCategoryID(this.categoryID.value, this.selected)
        this.updateField(this.categoryID.value, this.selected, 'categoryID')
      }
      if (this.subCategoryID.value !=0 && this.subCategoryID.value != undefined) {
        // this.updateCategoryID(this.categoryID.value, this.selected)
        this.updateField(this.subCategoryID.value, this.selected, 'subCategoryID')
      }
      if (this.departmentID.value !=0 && this.departmentID.value != undefined) {
        // this.updateDeparmentID(this.departmentID.value, this.selected)
        this.updateField(this.departmentID.value, this.selected, 'departmentID')
      }
      if (this.itemTypeID.value !=0 && this.itemTypeID.value != undefined) {
        // this.updateItemTypeID(this.itemTypeID.value, this.selected)
        this.updateField(this.itemTypeID.value, this.selected, 'itemTypeID')
      }
      if (this.species.value != '' && this.species.value != undefined) {
        // this.updateSpecies(this.species.value, this.selected)
        this.updateField(this.species.value, this.selected, 'species')
      }
      if (this.brandID.value != '' && this.brandID.value != undefined) {
        // this.updateBrandID(this.brandID.value, this.selected)
        this.updateField(this.brandID.value, this.selected, 'brandID')
      }
      if (this.active.value != '' && this.active.value != undefined) {
        // this.updateActive(this.active.value, this.selected)
        this.updateField(this.active.value, this.selected, 'active')
      }
      if (this.webProduct.value != '' && this.webProduct.value != undefined) {
        // this.updateWebProduct(this.webProduct.value, this.selected)
        this.updateField(this.webProduct.value, this.selected, 'webProduct')
      }
      if (this.webWorkRequired.value != '' && this.webWorkRequired.value != undefined) {
        this.updateField(this.webWorkRequired.value, this.selected, 'webWorkRequired')
      }
    }
  }

  updateField(id: number, listOfItems: any, name: string) {
    const site   =  this.siteService.getAssignedSite();
    console.log(name, id, listOfItems);
    const items$ =  this.menuService.updateField(site, name, id, listOfItems)
    this.updates(items$)
  }

  updates(item: any) {
    item.subscribe( data => {
      this.snack.open('items Updated', 'success')
    }, err => {
      this.snack.open(err, 'Failure')
    })
  }

}

// updateActive(id: number, listOfItems: any) {
//   const site   =  this.siteService.getAssignedSite();
//   const items$ =  this.menuService.updateField(site, 'active', id, listOfItems)
//   this.updates(items$)
// }

// updateWebProduct(id: number, listOfItems: any) {
//   const site   =  this.siteService.getAssignedSite();
//   const items$ =  this.menuService.updateField(site, 'webProduct', id, listOfItems)
//   this.updates(items$)
// }

// updateWebWorkRequired(id: number, listOfItems: any) {
//   const site   =  this.siteService.getAssignedSite();
//   const items$ =  this.menuService.updateField(site, 'webWorkRequired', id, listOfItems)
//   this.updates(items$)
// }

// updateBrandID(id: number, listOfItems: any) {
//   const site   =  this.siteService.getAssignedSite();
//   const items$ =  this.menuService.updateField(site, 'BrandID', id, listOfItems)
//   this.updates(items$)
// }

// updateCategoryID(id: number, listOfItems: any) {
//   const site   = this.siteService.getAssignedSite();
//   const items$ =  this.menuService.updateField(site, 'categoryID', id, listOfItems)
//   items$.subscribe( data => {
//     this.snack.open('items Updated', 'success')
//   }, err => {
//     this.snack.open(err, 'Failure')
//   })
//   // this.updates(items$)
// }

// updateDeparmentID(id: number, listOfItems: any) {
//   const site   = this.siteService.getAssignedSite();
//   const items$ =  this.menuService.updateField(site, 'DepartmentID', id, listOfItems)
//   this.updates(items$)
// }

// updateItemTypeID(id: number, listOfItems: any) {
//   const site   = this.siteService.getAssignedSite();
//   const items$ =   this.menuService.updateField(site, 'prodModifierType', id, listOfItems)
//   this.updates(items$)
// }

// updateSpecies(type: string, listOfItems: any) {
//   const site   = this.siteService.getAssignedSite();
//   const items$ =  this.menuService.updateField(site, 'species', type, listOfItems)
//   this.updates(items$)
// }
