import { Component, OnInit, Input, ElementRef, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Observable, Subject, debounceTime, distinctUntilChanged, filter, fromEvent, of, switchMap, tap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { MenuService } from 'src/app/_services';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { PartBuilderMainService } from 'src/app/_services/partbuilder/part-builder-main.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'field-value-selector',
  templateUrl: './part-builder-selector.component.html',
  styleUrls: ['./part-builder-selector.component.scss']
})
export class PartBuilderSelectorComponent implements OnInit, AfterViewInit {

  @Input() inputForm: UntypedFormGroup;
  @Input() searchForm: UntypedFormGroup;
  @Input() searchField:       UntypedFormControl;
  @Input() index             : number;
  @Input() outputType        = ''

  @Input() id                 : number;
  @Input() name:              string;

  @Input() searchType : string = 'product';
  @Input() fieldProperty: string;
  @Input() friendlyName: string;
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  items$: Observable<any[]>;
  items : any[];
  item  : any;
  site  : ISite;

  searchPhrase:               Subject<any> = new Subject();
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
    if (this.searchType == 'unitType') {
      const model = this.initSearchModel(searchPhrase, this.searchType);
      return this.unitTypesService.getUnitTypesSearch(site, model)
    }
    if (this.searchType == 'product') {
      const model = this.initSearchModel(searchPhrase, this.searchType);
      return this.menuService.getProductsBySearchForLists(site, model)
    }
    if (this.searchType == 'pB_Component' && this.fieldProperty == 'unitTypeID') {
      const model = this.initSearchModel(searchPhrase, this.searchType);
      return this.unitTypesService.getUnitTypesSearch(site, model)
    }
    if (this.searchType == 'pB_Component' && this.fieldProperty == 'productID') {
      const model = this.initSearchModel(searchPhrase, this.searchType);
      return this.menuService.getProductsBySearchForLists(site, model)
    }
    if (this.searchType == 'pB_MainID' ) {
      const model = this.initSearchModel(searchPhrase, this.searchType);
      return this.partBuilderService.searchMenuPrompts(site, model)
    }
    return of('')
  }

  getField() {
    return  "searchField";
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

  refreshSearch(search: any){
    if (search) {this.searchPhrase.next( search ) }
  }

  constructor(
          private siteService      : SitesService,
          private menuService : MenuService,
          private partBuilderService: PartBuilderMainService,
          private unitTypesService : UnitTypesService,
          private fb               : UntypedFormBuilder) {

    this.site = this.siteService.getAssignedSite();
    this.searchForm = this.fb.group({
      searchField: []
    })
    this.initInputForm()
  }

  ngOnInit() {
    this.initForm();
    this.init();
    if (this.id) { this.getName(this.id)  }
  }

  getName(id: number) {
    if (!id)             {return null}
    const site  = this.siteService.getAssignedSite();
    if(site) {
      let item$
      console.log('get name partbuilder', this.id, id)
      //fieldProperty
      if (this.fieldProperty == 'productID') {
        item$ = this.menuService.getProduct(site, id)
      }
      if (this.fieldProperty == 'unitTypeID') {
        item$ = this.menuService.getProduct(site, id)
      }
      if (this.fieldProperty == 'pB_MainID' ) {
        item$ = this.partBuilderService.getItem(site, id)
      }

      item$.subscribe(data => {
        console.log('getname data', data)
        this.item = data;
        const price =  { searchField: data.name  }
        this.searchForm.patchValue( price )
      })
    }

  }

  selectItem(item){
    if (!item) {return}

    let unit = {} as any;

    if (this.item && this.searchType === 'unitType') {
      const value =  { searchField: item.name  }
      this.searchForm.patchValue( value )
      unit = { unitTypeID : item.id }
      this.inputForm.patchValue(  unit  )
      return;
    }

    if (this.searchType === 'productPrice' ) {
      if (this.item) {
        this.item.unitTypeID = item.id;
        this.item.unitType = item.name;
      }
      const value =  { searchField: item.name  }
      this.searchForm.patchValue( value )
      return;
    }

    if (this.fieldProperty === 'pB_MainID'  ) {
      if (this.item) {
        // this.item.unitTypeID = item.id;
        this.item.pB_MainID = item.id;
      }
      const value =  { searchField: item.name  }
      this.searchForm.patchValue( value )
      this.itemSelect.emit({ pB_MainID: item.id  })
      return;
    }


    if (this.outputType === 'priceLine') {
      const data = {unitTypeID: item.id, index: this.index, unitName: item.name, unitType: item }
      this.itemSelect.emit(data)
      const value =  { searchField: item.name  }
      this.searchForm.patchValue( value )
      return
    }

    if (this.searchType === 'pB_Component'  && this.fieldProperty === 'unitTypeID' ) {
      this.item.unitTypeID = item.id;
      this.item.unitName = item.name;
      this.item.unitType  = item;
      this.searchForm.patchValue( {searchField: item.name} )
      this.itemSelect.emit(item)
      return;
    }

    if (this.searchType === 'pB_Component' && this.fieldProperty === 'productID' ) {
      this.item.unitTypeID = item.id;
      this.item.unitName = item.name;
      this.item.unitType  = item;
      this.searchForm.patchValue( {searchField: item.name} )
      this.itemSelect.emit(item)
    }
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

  initInputForm() {
    if (this.searchType == 'unitType') {
      this.inputForm = this.fb.group({
        unitTypeID: []
      })
    }
    if (this.searchType == 'product') {
      this.inputForm = this.fb.group({
        productID: []
      })
    }

    if (this.searchType == 'pB_Component'  && this.fieldProperty === 'productID') {
      this.inputForm = this.fb.group({
        productID: []
      })
    }
    if (this.searchType == 'pB_Component'  && this.fieldProperty === 'unitTypeID') {
      this.inputForm = this.fb.group({
        unitTypeID: []
      })
    }

    if (this.searchType == 'pB_MainID'  ) {
      this.inputForm = this.fb.group({
        pB_MainID: []
      })
    }
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
  initSearchModel(searchPhrase: string, type: string) {
    const model = {} as any;
    model.name = searchPhrase;
    model.pageNumber = 1;
    model.pageSize = 100;
    return model;
  }
}
