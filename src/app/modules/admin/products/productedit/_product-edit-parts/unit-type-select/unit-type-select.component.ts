import { Component, OnInit, Input , EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, } from '@angular/core';
import {  IProduct, ISite, ProductPrice,  } from 'src/app/_interfaces';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, of } from 'rxjs';
import { ActivatedRoute,  } from '@angular/router';
import { SearchModel } from 'src/app/_services/system/paging.service';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { UnitType } from 'src/app/_interfaces/menu/price-categories';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PB_Components } from 'src/app/_services/partbuilder/part-builder-main.service';

@Component({
  selector: 'unit-type-select',
  templateUrl: './unit-type-select.component.html',
  styleUrls: ['./unit-type-select.component.scss']
})
export class UnitTypeSelectComponent implements OnInit, AfterViewInit {

  @Input() productPrice       : ProductPrice;
  @Input() product            : IProduct;
  @Input() pb_Component: PB_Components
  unitType$                   : Observable<UnitType[]>;
  unitTypes                   : UnitType[]
  @Input()  index             : number;
  @Input()  outputType        = ''
  formfieldValue: UntypedFormGroup;

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  itemNameInput: string; //for clear button
  @Input() inputForm:         UntypedFormGroup;
  @Input() searchForm:        UntypedFormGroup;
  @Input() formGroupName: UntypedFormGroup
  // @Input() formGroupName: string
  @Input() searchField:       UntypedFormControl;
  @Input() id                 : number;
  @Input() name:              string;
  searchPhrase:               Subject<any> = new Subject();
  item:                       UnitType;
  site:                       ISite;

  get searchControl()   { return this.inputForm.get("searchField") as UntypedFormControl};
  @Input()  formFieldClass = 'mat-form-field form-background'

  results$ = this.searchPhrase.pipe(
    debounceTime(225),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
       this.searchList(searchPhrase)
    )
  )

  searchList(searchPhrase) {
    const site  = this.siteService.getAssignedSite();
    const model = this.initSearchModel(searchPhrase)
    return this.unitTypesService.getUnitTypesSearch(site, model)
  }

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement,'keyup')
      .pipe(
          filter(Boolean),
          debounceTime(225),
          distinctUntilChanged(),
          tap((event:KeyboardEvent) => {
            const search  = this.input.nativeElement.value
            this.refreshSearch(search);
          })
      )
    .subscribe();
  }

  getField() {
    let field = ""
    if (this.product) { field ="searchField"  }
    if (!this.product) { field ="searchField"  }
    return field;
  }

  constructor(  private unitTypesService : UnitTypesService,
                private fb               : UntypedFormBuilder,
                public  route            : ActivatedRoute,
                private siteService      : SitesService,
               ) {

    this.site = this.siteService.getAssignedSite();
    this.searchForm = this.fb.group({
      searchField: []
    })
    this.formfieldValue = this.fb.group({
      unitTypeID: []
    })
  }

  init() {
    if (this.inputForm) {
      const field = this.getField()

      if (this.inputForm.controls[field]?.value) {
        const value = this.inputForm.controls[field].value;
        this.id = value;
      }
    }
  }

  initForm() {
    this.searchForm = this.fb.group({
      searchField: [],
    })
  }

  ngOnInit() {
    this.initForm();
    this.init();
    if (this.id) { this.getName(this.id)  }
  }

  refreshSearch(search: any){
    if (search) {this.searchPhrase.next( search ) }
  }

  searchItems(name: string) {
    this.searchPhrase.next(name);
  }

  onChange(selected: any) {
    const item = selected.option.value;
    if (item) {
      this.selectItem(item)
      this.item = item
      if (!item || !item.name){
        return ''
      }  else {
        return item.name
      }
    }
  }

  selectItem(item){
    if (!item) {return}

    let unit = {} as any;

    if (this.product) {
      unit = { unitTypeID : item.id }
      this.inputForm.patchValue(  unit  )
    }

    if (!this.product) {

    }

    if (!this.product) {
      // const data = {unitTypeID: item.id, index: this.index, unitName: item.name, unitType: item }
      // this.itemSelect.emit(data)
      // item = { unitTypeID : item.id }
      // this.inputForm.patchValue(  unit  )
      // console.log('select item', item)
      if (this.productPrice) {
        this.productPrice.unitTypeID = item.id;
        this.productPrice.unitType = item.name;
      }

      if (this.pb_Component) {
        this.pb_Component.unitTypeID = item.id;
        this.pb_Component.unitName = item.name;
        this.pb_Component.unitType  = item;
        this.searchForm.patchValue( {searchField: item.name} )
        this.itemSelect.emit(item)
      }

      if (this.outputType === 'priceLine') {
        const data = {unitTypeID: item.id, index: this.index, unitName: item.name, unitType: item }
        this.itemSelect.emit(data)

        const value =  { searchField: item.name  }
        this.searchForm.patchValue( value )
        return
      }

      return;
    }

    const value =  { searchField: item.name  }
    this.searchForm.patchValue( value )
  }

  getName(id: number) {
    if (!id)             {return null}
    const site  = this.siteService.getAssignedSite();
    if(site) {
      this.unitTypesService.get(site, id).subscribe(data => {
        this.item = data;
        const price =  { searchField: data.name  }
        this.searchForm.patchValue( price )
      })
    }
  }

  initSearchModel(searchPhrase: string): SearchModel {
    const model = {} as SearchModel
    model.pageSize    = 100;
    model.currentPage = 1;
    model.name        = searchPhrase;
    return model;
  }

  initModel(id: number): SearchModel {
    const model = {} as SearchModel
    model.pageSize    = 100;
    model.currentPage = 1;
    model.id = id;
    return model;
  }

}

  // selectItem(item: any){
  //   if (!item) { return }
  //   const data = {unitTypeID: item.id, index: this.index, unitName: item.name, unitType: item }
  //   this.itemSelect.emit(item)
  // }


// assignItem() {
//   const value =this.searchControl.value
//   if (this.productPrice && value) {
//     this.productPrice.unitTypeID = value;
//     this.itemSelect.emit({productPrice: this.productPrice, index: this.index })
//   }

//   if (this.product && value) {
//     this.product.unitTypeID = value;
//     this.inputForm.patchValue({unitTypeID: value})
//     this.itemSelect.emit({unitTypeID: value, index: this.index })
//   }
// }

  // async  getName(id: number): Promise<any> {
  //   if (!id) {return null}
  //   if (id == 0) {return null}
  //   if (id == undefined) {return null}
  //   const site  = this.siteService.getAssignedSite();
  //   if(site) {
  //     const  item =  await this.unitTypesService.get(site, id).pipe().toPromise();
  //     return item
  //   }
  // }
// init() {
  //   if (this.inputForm && this.id) {
  //     let model = this.initSearchModel(null)
  //     if (this.product) {
  //       model = this.initModel(this.id)
  //     }

  //     console.log(model)

  //     const site     = this.siteService.getAssignedSite();
  //     this.results$ = this.unitTypesService.getBasicTypes(site, model).pipe(
  //       switchMap(data => {
  //         const items  = data.results
  //         if (items) {

  //           if (this.product) {
  //             this.searchForm = this.fb.group({
  //               searchField   : [items[0].name],
  //             })
  //           }

  //           if (!this.product) {
  //             this.searchForm = this.fb.group({
  //               searchField   : [items[0].name],
  //             })
  //           }
  //           return of(data)
  //         }
  //       })
  //     )
  //   }
  // }

  // ngAfterViewInit() {

  //   if (!this.searchForm || !this.input) {
  //     console.log('not ready')
  //   }
  //   if (this.searchForm && this.input) {
  //     console.log('ready')
  //     try {
  //       fromEvent(this.input.nativeElement, 'keyup')
  //       .pipe(
  //           filter(Boolean),
  //           debounceTime(250),
  //           distinctUntilChanged(),
  //           tap((event:KeyboardEvent) => {
  //             const search  = this.input.nativeElement.value
  //             console.log('after view init refresh search', search)
  //             this.refreshSearch(search);
  //           })
  //       )
  //       .subscribe();
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }
  // }


  // displayFn(item) {
  //   if (!item) { return }
  //   console.log('selection', item)
  //   // this.searchForm = this.fb.group({
  //   //   searchField: [item]
  //   // })

  //   return

  //   this.formfieldValue.patchValue({unitTypeID: item.id})

  //   if (this.productPrice) {
  //     this.productPrice.unitTypeID = item.id;
  //     this.productPrice.unitType = item.name;
  //   }

  //   if (this.outputType === 'priceLine') {
  //     const data = {unitTypeID: item.id, index: this.index, unitName: item.name, unitType: item }
  //     this.itemSelect.emit(data)
  //     return
  //   }

  //   if (this.product && item) {

  //     this.formfieldValue.patchValue({unitTypeID: item.id})
  //     this.itemSelect.emit({unitTypeID: item.id})
  //     return
  //   }

  //   this.itemSelect.emit(item)

  // }
