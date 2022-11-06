import { Component, OnInit, Input , EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, } from '@angular/core';
import {  ISite, ProductPrice,  } from 'src/app/_interfaces';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { ActivatedRoute,  } from '@angular/router';
import { SearchModel } from 'src/app/_services/system/paging.service';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { UnitType } from 'src/app/_interfaces/menu/price-categories';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'unit-type-select',
  templateUrl: './unit-type-select.component.html',
  styleUrls: ['./unit-type-select.component.scss']
})
export class UnitTypeSelectComponent implements OnInit, AfterViewInit {

  @Input() productPrice       : ProductPrice;
  unitType$                   : Observable<UnitType[]>;
  unitTypes                   : UnitType[]
  @Input()  index             : number;
  @Input()  outputType        = ''
  formfieldValue: FormGroup;

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  itemNameInput: string; //for clear button
  @Input() inputForm:         FormGroup;
  @Input() searchForm:        FormGroup;
  @Input() formGroupName: FormGroup
  // @Input() formGroupName: string
  @Input() searchField:       FormControl;
  @Input() id                 : number;
  @Input() name:              string;
  searchPhrase:               Subject<any> = new Subject();
  item:                       UnitType;
  site:                       ISite;

  get searchControl()   { return this.inputForm.get("searchField") as FormControl};
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

  constructor(  private unitTypesService : UnitTypesService,
                private fb               : FormBuilder,
                public  route            : ActivatedRoute,
                private siteService      : SitesService,
               ) {

    this.site = this.siteService.getAssignedSite();
    this.searchForm = this.fb.group({
      searchField: [],
    })
    this.formfieldValue = this.fb.group({
      unitTypeID: []
    })
  }

  async init() {

    if (this.inputForm) {
      if (this.id) {
        const model   = this.initModel(this.id)
        const site    = this.siteService.getAssignedSite();
        const results$ = this.unitTypesService.getBasicTypes(site, model)
        results$.subscribe (data => {
          const items = data.results
          if (items) {
            this.searchForm = this.fb.group({
              searchField   : [items[0]],
            })
          }
        })
      }
    }
  }

  async ngOnInit() {
    this.init()
  }

  ngAfterViewInit() {
    this.init()
    if (this.searchForm && this.input) {
      try {
        fromEvent(this.input.nativeElement,'keyup')
        .pipe(
            filter(Boolean),
            debounceTime(250),
            distinctUntilChanged(),
            tap((event:KeyboardEvent) => {
              const search  = this.input.nativeElement.value
              this.refreshSearch(search);
            })
        )
        .subscribe();
      } catch (error) {
        console.log(error)
      }
    }
  }

  refreshSearch(search: any){
    if (search) {
      this.searchPhrase.next( search )
    }
  }

  searchItems(name: string) {
    if (!name) { return }
    this.searchPhrase.next(name);
  }

  selectItem(item: any){
    if (!item) { return }
    // this.searchControl.setValue(item.id)
    this.itemSelect.emit(item)
  }

  assignItem() {
    const value =this.searchControl.value
    this.productPrice.unitTypeID = value;
    //emit item to parent.
    this.itemSelect.emit({productPrice: this.productPrice, index: this.index })
  }


  displayFn(item) {

    if (!item) { return }

    if (this.productPrice) {
      this.productPrice.unitTypeID = item.id;
      this.productPrice.unitType = item.name;
    }

    if (this.outputType === 'priceLine') {
      this.itemSelect.emit({index: this.index , unitType: item,
                            unitTypeID: item.id, unitName: item.name})
      return
    }

    this.itemSelect.emit(item)

  }

  async  getName(id: number): Promise<any> {
    if (!id) {return null}
    if (id == 0) {return null}
    if (id == undefined) {return null}
    const site  = this.siteService.getAssignedSite();
    if(site) {
      const  item =  await this.unitTypesService.get(site, id).pipe().toPromise();
      return item
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
    return model;
  }

}

