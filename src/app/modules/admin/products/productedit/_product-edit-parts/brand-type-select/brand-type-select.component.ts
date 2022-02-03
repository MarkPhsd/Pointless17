import { Component, OnInit, Input , EventEmitter,
        Output, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { ClientSearchModel, ClientSearchResults, ISite, IUserProfile } from 'src/app/_interfaces';
import { ContactsService, IItemBasic } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormBuilder, FormControl, FormGroup,  } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-brand-type-select',
  templateUrl: './brand-type-select.component.html',
  styleUrls: ['./brand-type-select.component.scss'],
})
export class BrandTypeSelectComponent implements  AfterViewInit {
// , AfterViewInit, OnChanges
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  itemNameInput: string; //for clear button
  @Input() formFieldClass     = 'formFieldClass-standard'
  @Input() inputForm:         FormGroup;
  @Input() searchForm:        FormGroup;
  @Input() searchField:       FormControl;
  @Input() id               : number;
  @Input() name:              string;
  searchPhrase:               Subject<any> = new Subject();
  item:                       IUserProfile;
  site:                       ISite;

  get brandLookupControl()   { return this.inputForm.get("brandID") as FormControl};

  brands$                   : Observable<ClientSearchResults>;
  brands                    : IUserProfile[]

  results$ = this.searchPhrase.pipe(
    debounceTime(225),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
        this.searchList(searchPhrase)
    )
  )

  searchList(searchPhrase):  Observable<ClientSearchResults> {
    const site = this.siteService.getAssignedSite();
    const model = this.initSearchModel(searchPhrase)
    return this.contactsService.getLiveBrands(site, model)
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

  constructor(  private contactsService: ContactsService,
                private fb             : FormBuilder,
                public  route          : ActivatedRoute,
                private siteService    : SitesService,
               ) {

    this.site = this.siteService.getAssignedSite();

    if (this.inputForm) {
      this.id = this.inputForm.controls['brandID'].value;
    }
    this.initForm();
    this.getName(this.id)

  }

  initForm(){
    this.searchForm = this.fb.group({
      brandIDLookup: [],
    })
  }

  getName(id: number) {
    if (!id)             {return null}
    const site  = this.siteService.getAssignedSite();
    if(site) {
      let model = this.initModel(this.id)
      this.contactsService.getLiveBrands(site, model).subscribe(data => {
        if (data && data.results) {
          const price =  { priceCategoryLookup: data.results[0].company  }
          console.log(price)
          this.searchForm.patchValue( price )
        }
      })
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

  selectItem(item: IUserProfile){
    if (!item) { return }
    this.itemSelect.emit(item)

    const lookup = { brandID : item.id }
    this.inputForm.patchValue( lookup )

    const brand =  { brandIDLookup: item.company }
    console.log('brand', brand)
    this.searchForm.patchValue( brand )
  }

  onChange(selected: any) {
    const item = selected.option.value as IUserProfile;

    if (item) {
      this.selectItem(item)

      this.item = item
      if (!item || !item.company){
        return ''
      }  else {
        return item.company;
      }
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


