import { Component, OnInit, Input , EventEmitter,
        Output, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { ClientSearchModel, ClientSearchResults, ISite, IUserProfile } from 'src/app/_interfaces';
import { ContactsService  } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UntypedFormBuilder, FormControl, UntypedFormGroup,  } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent } from 'rxjs';
@Component({
  selector: 'app-brand-type-select',
  templateUrl: './brand-type-select.component.html',
  styleUrls: ['./brand-type-select.component.scss'],
})

export class BrandTypeSelectComponent implements  OnInit, AfterViewInit {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect      = new EventEmitter();
  itemNameInput             : string; //for clear button
  @Input() formFieldClass     = 'formFieldClass-standard'
  @Input() inputForm:         UntypedFormGroup;
  @Input() searchForm:        UntypedFormGroup;
  @Input() id               : any;
  @Input() disableDelete    : boolean;
  @Input() fieldName        = 'brandID';
  searchPhrase:               Subject<any> = new Subject();
  item:                       IUserProfile;
  site:                       ISite;

  // get brandLookupControl()   { return this.inputForm.get("brandID") as FormControl};

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
    const site  = this.siteService.getAssignedSite();
    const model = this.initSearchModel(searchPhrase)
    if (this.fieldName == 'productSupplierCatID') {
      return this.contactsService.getContactBySearchModel(site,model)
    }
    if (this.fieldName != 'brandID') {
      return this.contactsService.getContactBySearchModel(site,model)
    }
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
                private fb             : UntypedFormBuilder,
                private siteService    : SitesService,
               ) {
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.site = this.siteService.getAssignedSite();
    if (this.inputForm) {
      if (this.id != 0) {
        if (this.fieldName) {
          this.id = this.inputForm.controls[this.fieldName].value;
        }
        if (!this.fieldName) {
          this.id = this.inputForm.controls['brandID'].value;
        }

      }
    }
    this.initForm();
    this.getName(this.id)
  }

  initForm(){
    this.searchForm = this.fb.group({
      idLookup: [],
    })
  }

  getName(id: number) {
    if (!id)             {return null}
    const site  = this.siteService.getAssignedSite();
    if(site) {
      let model = this.initModel(this.id)
      let search$  = this.contactsService.getContactBySearch(site, this.id, 1, 10)
      // console.log(this.fieldName, this.id)
      search$.subscribe( data => {
        // console.log('getName ' + this.fieldName,  data?.results[0]?.company)
        if (data && data.results && data?.results[0]?.company) {
          // this.setValues(this.searchForm, this.fieldName, data?.results[0]?.company );
          const item =  { idLookup: data?.results[0]?.company }
          this.searchForm.patchValue( item )
        }
      })
    }
  }

  clearInput() {
    const item =  { idLookup: '' }
    this.searchForm.patchValue( item )
    this.setValues(this.inputForm, this.fieldName, '')
  }

  get searchValueAssigned() {
    if (this.searchForm.controls['idLookup'].value) {
      return true
    }
    return false;
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

    this.setValues(this.inputForm, this.fieldName, item.id  )
    // const lookup = { brandID : item.id }
    // this.inputForm.patchValue( lookup )
    const brand =  { idLookup: item.company }
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

  setValues(form: UntypedFormGroup, fieldName: string, data: any) {
    if (fieldName == 'yearsOld') {
      const  item =  { yearsOld: data  }
      form.patchValue( item )
    }
    if (fieldName == 'packager') {
      const item =  { packager: data  }
      form.patchValue( item )
    }
    if (fieldName === 'brandID') {
      let item =  { brandIDLookup: data  }
      form.patchValue( item )
    }
    if (fieldName === 'productSupplierCatID') {
      let item =  { productSupplierCatID: data  }
      form.patchValue( item )
    }
    // console.log('form value', form.value)
  }

}


