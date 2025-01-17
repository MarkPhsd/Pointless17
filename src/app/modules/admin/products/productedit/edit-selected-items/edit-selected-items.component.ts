import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { catchError, Observable, of, switchMap } from 'rxjs';

import { MenuService, RouteDispatchingService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProducteditComponent } from '../productedit.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ProductTypeSelectComponent } from '../_product-edit-parts/product-type-select/product-type-select.component';
import { DepartmentSelectComponent } from '../_product-edit-parts/department-select/department-select.component';
import { CategorySelectListFilterComponent } from 'src/app/shared/widgets/category-select-list-filter/category-select-list-filter.component';
import { CategorySelectComponent } from '../_product-edit-parts/category-select/category-select.component';
import { BrandTypeSelectComponent } from '../_product-edit-parts/brand-type-select/brand-type-select.component';
import { SpeciesListComponent } from '../_product-edit-parts/species-list/species-list.component';
import { ValueFieldsComponent } from '../_product-edit-parts/value-fields/value-fields.component';
import { PromptGroupSelectComponent } from '../_product-edit-parts/prompt-group-select/prompt-group-select.component';
import { FieldSelectorComponent } from '../../../report-designer/designer/field-selector/field-selector.component';
import { FieldValueSelectorComponent } from '../../../report-designer/designer/field-value-selector/field-value-selector.component';
import { PartBuilderSelectorComponent } from '../_product-edit-parts/part-builder-selector/part-builder-selector.component';
@Component({
  selector: 'app-edit-selected-items',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    ProductTypeSelectComponent,
    DepartmentSelectComponent,
    CategorySelectComponent,
    BrandTypeSelectComponent,
    SpeciesListComponent,
    ValueFieldsComponent,
    PromptGroupSelectComponent,
    FieldValueSelectorComponent,
    FormsModule,ReactiveFormsModule,
    PartBuilderSelectorComponent,
  SharedPipesModule],
  templateUrl: './edit-selected-items.component.html',
  styleUrls: ['./edit-selected-items.component.scss']
})
export class  EditSelectedItemsComponent implements OnInit {
  action$   : Observable<any>;
  inputForm : UntypedFormGroup;
  get subCategoryID()    { return this.inputForm.get("subCategoryID") as UntypedFormControl;}
  get categoryID()    { return this.inputForm.get("categoryID") as UntypedFormControl;}
  get departmentID()  { return this.inputForm.get("departmentID") as UntypedFormControl;}
  get itemTypeID()    { return this.inputForm.get("prodModifierType") as UntypedFormControl;}
  get species()       { return this.inputForm.get("species") as UntypedFormControl;}
  get brandID()       { return this.inputForm.get("brandID") as UntypedFormControl;}
  get active()        { return this.inputForm.get("active") as UntypedFormControl;}
  get webProduct()    { return this.inputForm.get("webProduct") as UntypedFormControl;}
  get sortOrder()     { return this.inputForm.get("sortOrder") as UntypedFormControl;}
  get webWorkRequired()       { return this.inputForm.get("webWorkRequired") as UntypedFormControl;}

  pbSearchForm: UntypedFormGroup;

  // constructor(
  //   private fb: FormBuilder) { }
  selected  : any[];
  pB_MainID = 0;

  constructor(
      private menuService: MenuService,
      public fb: UntypedFormBuilder,
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
      pB_MainID: [],
      sortOrder: [],
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

  initPbSearchForm(){
    this.pbSearchForm = this.fb.group({
      searchField: [],
    })
  }

  exit () {
    this.dialogRef.close()
  }

  updateItems() {
    if (this.selected) {

      const selected = this.selected
      const promptGroupID = this.inputForm.controls['promptGroupID'].value;
      const subCategoryID = this.inputForm.controls['promptGroupID'].value;
      let value : any;

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

      if (this.sortOrder.value != '' && this.sortOrder.value != undefined) {
        // this.updateActive(this.active.value, this.selected)
        this.updateField(this.sortOrder.value, this.selected, 'sortOrder')
      }

  }}

  sortCategoriesSubCategoriesFirst() {
    const site   =  this.siteService.getAssignedSite();
    const items$ =  this.menuService.sortCategoriesSubCategoriesFirst(site)
    this.updates(items$)
  }

  updateField(id: number, listOfItems: any, name: string) {
    const site   =  this.siteService.getAssignedSite();
    const items$ =  this.menuService.updateField(site, name, id, listOfItems)
    this.updates(items$)
  }

  updates(items$: any) {
    this.action$ = items$.pipe(switchMap(data => {
      this.siteService.notify('Items Updated', 'close', 3000, 'green')
      return of(data)
    }))
  }


  setPartBuilder(event) {
    if (!event) { return }
    // console.log('event',event, event.value, event.pB_MainID)
    this.pB_MainID = event.pB_MainID;
    this.inputForm.patchValue(event)
    console.log(this.inputForm.value);
    const warn = window.confirm('Do you want to set the selected items to this kit?')
    if (!warn) { return }
    this.updateField(this.pB_MainID, this.selected, 'pB_MainID')
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
