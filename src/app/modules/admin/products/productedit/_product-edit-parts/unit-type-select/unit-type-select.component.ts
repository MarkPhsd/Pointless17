import { Component, OnInit, Input , EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, OnChanges, } from '@angular/core';
import {  IProduct, ISite, PosOrderItem, ProductPrice,  } from 'src/app/_interfaces';
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
export class UnitTypeSelectComponent implements OnInit, AfterViewInit, OnChanges {

  @Output() undoSetChange     = new EventEmitter();
  @Output() itemSelect        = new EventEmitter();
  @ViewChild('input', {static: true}) input: ElementRef;

  @Input() productPrice       : ProductPrice;
  @Input() product            : IProduct;
  @Input() pb_Component       : PB_Components
  @Input() posOrderItem       : PosOrderItem;
  @Input() outputType        = ''
  @Input() setChange         : boolean;
  // formfieldValue: UntypedFormGroup;
  @Input() index             : number;
  @Input() inputForm:           UntypedFormGroup;
  @Input() searchForm:          UntypedFormGroup;
  @Input() formGroupName      : UntypedFormGroup
  @Input() formControlName    = 'unitTypeID';
  @Input() searchField:         UntypedFormControl;
  @Input() id                 : number;
  @Input() name:                string;
  @Input()  formFieldClass    = 'mat-form-field form-background'
  unitType$                   : Observable<UnitType[]>;
  unitTypes                   : UnitType[]
  itemNameInput               : string; //for clear button
  searchPhrase                : Subject<any> = new Subject();
  item:                         UnitType;
  site:                         ISite;

  get  searchControl() {   return this.inputForm.get("searchField") as UntypedFormControl };

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

  getField() {
    let field = ""
    if (this.product)  { field ="searchField"  }
    if (!this.product) { field ="searchField"  }
    return field;
  }

  constructor(  private unitTypesService : UnitTypesService,
                private fb               : UntypedFormBuilder,
                public  route            : ActivatedRoute,
                private siteService      : SitesService,
              ) {

  }


  ngOnInit() {
    this.initForm();
    this.init();
    this.site = this.siteService.getAssignedSite();

    if (this.id) {
      console.log('get item', this.id)
      this.getName(this.id)  }
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
      ).subscribe();
  }

  init() {
    if (this.inputForm) {
      const field = this.formControlName// this.getField()
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

  ngOnChanges() {
    if (this.setChange) {
      this.getName(this.id)
      this.setChange = false
      this.undoSetChange.emit(false)
    }
    if (this.id) {
      // console.log('get item', this.id)
      this.getName(this.id)  }
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
   
      return
      this.item = item
      return item?.name

    }
  }

  selectItem(item){
    if (!item) {return}

    let unit = {} as any;

    if (this.product) {

      // console.log('product')
      if (this.formControlName == 'reOrderUnitTypeID') {
        unit = { reOrderUnitTypeID : item.id }
      } else {
        unit = {  unitTypeID : item.id }
      }
      this.inputForm.patchValue(  unit  )
      this.setValue(item);
      this.getName(item.id)
      // 
      return;
    }

    if (!this.product) {
      if (this.productPrice) {
        this.productPrice.unitTypeID = item.id;
        this.productPrice.unitType = item.name;
      }

      if (this.posOrderItem) {
        this.posOrderItem.unitType = item.id;
        this.posOrderItem.unitName = item.name;
        // this.posOrderItem.unitType  = item;
        this.searchForm.patchValue( {searchField: item.name} )
        this.itemSelect.emit(item)
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
    this.setValue(item)

  }

  setValue(item) {
    const value =  { searchField: item.name  }
    this.searchForm.patchValue( item )
    this.itemSelect.emit(item)
  }

  getName(id: number) {
    console.log('getName', id)
    if (!id)             {return null}
    const site  = this.siteService.getAssignedSite();
    if(site) {
      this.unitTypesService.get(site, id).subscribe(data => {
        this.item = data;
        console.log(data.name,data.id)
        const item =  { searchField: data.name  }
        this.searchForm.patchValue( item )
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

  get searchValueAssigned() {
    let unit = {} as any;
    let item = {} as UnitType;
    if (this.searchForm.controls['searchField'].value) {
      return true
    }
    return false;
  }

  clearInput() {
    let unit = {} as any;
    let item = {} as UnitType;

    if (this.product) {
      this.id = null;
      if (this.formControlName == 'reOrderUnitTypeID') {
        unit = { reOrderUnitTypeID : 0}
      } else {
        unit = {  unitTypeID : 0 }
      }
      this.inputForm.patchValue(  unit  )
      this.setValue(item);
    }

    if (!this.product) {
      if (this.productPrice) {
        this.productPrice.unitTypeID = 0;
        this.productPrice.unitType = {} as UnitType;
      }

      if (this.posOrderItem) {
        this.posOrderItem.unitType = 0;
        this.posOrderItem.unitName = '';
        this.searchForm.patchValue( {searchField: ''} )
        this.itemSelect.emit(item)
      }

      if (this.pb_Component) {
        this.pb_Component.unitTypeID = 0;
        this.pb_Component.unitName =  '';
        this.pb_Component.unitType  = item;
        this.searchForm.patchValue( {searchField: ''} )
        this.itemSelect.emit(item)
      }

      if (this.outputType === 'priceLine') {
        const data = {unitTypeID: 0, index: this.index, unitName: '', unitType: item }
        this.itemSelect.emit(data)
        const value =  { searchField: item.name  }
        this.searchForm.patchValue( value )
        return
      }
    }

    this.initForm();
    this.itemSelect.emit({})
  }

}

