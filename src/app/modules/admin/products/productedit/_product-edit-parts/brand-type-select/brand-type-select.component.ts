import { Component, OnInit, Input , EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, OnChanges} from '@angular/core';
import { BrandslistComponent } from 'src/app/modules/menu/brandslist/brandslist.component';
import { ClientSearchModel, ClientSearchResults, ISite, IUserProfile } from 'src/app/_interfaces';

import { ContactsService, IItemBasic } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';

import { FormBuilder, FormControl, FormGroup,  } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy, NgModule } from "@angular/core";

@Component({
  selector: 'app-brand-type-select',
  templateUrl: './brand-type-select.component.html',
  styleUrls: ['./brand-type-select.component.scss']
})
export class BrandTypeSelectComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  itemNameInput: string; //for clear button
  @Input() inputForm:         FormGroup;
  @Input() searchForm:        FormGroup;
  @Input() searchField:       FormControl;
  @Input() id                 : number;
  @Input() name:              string;
  // @Input() formFieldClass     = 'formFieldClass';

  searchPhrase:               Subject<any> = new Subject();
  item:                       IUserProfile;
  site:                       ISite;

  get brandLookupControl()   { return this.inputForm.get("brandID") as FormControl};

  brands$                   : Observable<ClientSearchResults>;
  brands                    : IUserProfile[]

  @Input()  formFieldClass = 'formFieldClass'

  results$ = this.searchPhrase.pipe(
    debounceTime(225),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
        this.searchList(searchPhrase)
    )
  )

  searchList(searchPhrase) {
    const site = this.siteService.getAssignedSite();
    const model = this.initSearchModel(searchPhrase)
    return this.contactsService.getLiveBrands(site, model)
  }

  constructor(  private contactsService: ContactsService,
                private fb             : FormBuilder,
                private router         : Router,
                public  route           : ActivatedRoute,
                private siteService    : SitesService,
               ) {

    this.site = this.siteService.getAssignedSite();
    this.searchForm = this.fb.group({
      brandIDLookup: [],
    })

  }

  async init() {

    if (this.inputForm) {
      if (this.id) {
        const model   = this.initModel(this.id)
        const site    = this.siteService.getAssignedSite();
        const results$ = this.contactsService.getLiveBrands(site, model)
        results$.subscribe (data => {
          const items = data.results
          if (items) {
            this.searchForm = this.fb.group({
              brandIDLookup   : [items[0]],
            })
          }
        })
      }
    }
  }

  async ngOnInit() {
    this.init()
  }

  async ngOnChanges() {
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
    this.brandLookupControl.setValue(item.id)
    this.itemSelect.emit(item)
  }

  displayFn(item) {
    if (!item) { return }
    this.selectItem(item)
    return item ? item.company : '';
  }

  async  getName(id: number): Promise<any> {
    if (!id) {return null}
    if (id == 0) {return null}
    if (id == undefined) {return null}
    const site  = this.siteService.getAssignedSite();
    if(site) {
      const  item =  await this.contactsService.getContact(site, id.toString()).pipe().toPromise();
      return item
    }
  }

  initSearchModel(searchPhrase: string): ClientSearchModel {
    const model = {} as ClientSearchModel
    model.pageSize    = 100;
    model.currentPage = 1;
    model.name        = searchPhrase;
    model.company     = searchPhrase;
    model.accountNumber = searchPhrase
    return model;
  }
  initModel(id: number): ClientSearchModel {
    const model = {} as ClientSearchModel
    model.pageSize    = 100;
    model.currentPage = 1;
    model.id          = id
    return model;
  }

}

