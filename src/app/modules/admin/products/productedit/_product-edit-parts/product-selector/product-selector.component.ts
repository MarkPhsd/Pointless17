import { Component, OnInit, Input, ElementRef, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, debounceTime, distinctUntilChanged, filter, fromEvent, of, switchMap, tap } from 'rxjs';
import { IProduct, ISite, PosOrderItem } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { AWSBucketService, MenuService } from 'src/app/_services';
import { PB_Components } from 'src/app/_services/partbuilder/part-builder-main.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'product-selector',
  templateUrl: './product-selector.component.html',
  styleUrls: ['./product-selector.component.scss']
})
export class ProductSelectorComponent implements OnInit, AfterViewInit {
  @Input() bucketName: string;
  @Input() showUOM          : boolean;
  @Input() product            : IProduct;
  @Input() pb_Component       : PB_Components
  @Input() posOrderItem:      PosOrderItem;
  product$                   : Observable<IProduct[]>;
  products                   : IProduct[]
  @Input()  index             : number;
  @Input()  outputType        = ''
  formfieldValue: UntypedFormGroup;
  bucket$: Observable<string>;
  @Output() clearInputsEmit = new EventEmitter();

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  itemNameInput: string; //for clear button
  @Input() inputForm:         UntypedFormGroup;
  @Input() searchForm:        UntypedFormGroup;
  @Input() formGroupName      : UntypedFormGroup
  @Input() searchField:       UntypedFormControl;
  @Input() id                 : number;
  @Input() name:              string;
  searchPhrase:               Subject<any> = new Subject();
  item:                       IProduct;
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
    return this.menuService.getProductsBySearchForLists(site, model)
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

  constructor(  private menuService : MenuService,
    private fb               : UntypedFormBuilder,
    public  route            : ActivatedRoute,
    private awsBucketService : AWSBucketService,
    private siteService      : SitesService,
   ) {
    this.site = this.siteService.getAssignedSite();
    this.searchForm = this.fb.group({
      searchField: [],
      unitDescription: [],
      id: [],
      unitTypeID: [],
    })
    this.formfieldValue = this.fb.group({
      id: [],
      searchField: [],
      unitDescription: [],
      unitTypeID: [],
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
      id: [],
      unitDescription: [],
      unitTypeID: [],
    })
  }

  ngOnInit() {
    this.initForm();
    this.init();
    if (this.id) { this.getName(this.id)  }


    if (!this.bucketName) {
      this.bucket$    = this.awsBucketService.awsBucketURLOBS().pipe(switchMap(data => {
            this.bucketName = data
            return of(data)
        }));
    }
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
        // if (this.showUOM) {
        //   return `${item?.name} ${item?.unitDescription}`
        // }
        return `${item?.name}`
      }
    }
  }

  selectItem(item){
    if (!item) {return}

    if (this.posOrderItem) {
      this.posOrderItem.productID = item.id;
      this.posOrderItem.productName = item.name;
      this.searchForm.patchValue( {id: item?.id, searchField: item?.name, unitTypeID: item?.unitTypeID} )
      this.itemSelect.emit(item)
      return;
    }
    if (this.pb_Component) {
      this.pb_Component.productID = item.id;
      this.pb_Component.name = item.name;
      this.pb_Component.product  = item;
      this.searchForm.patchValue( {searchField: item.name} )
      this.itemSelect.emit(item)
      return;
    }

    const value =  { searchField: item.name  }
    this.searchForm.patchValue( value )
  }

  getName(id: number) {
    if (!id)             {return null}
    const site  = this.siteService.getAssignedSite();
    if(site) {
      this.menuService.getProduct(site, id).subscribe(data => {
        this.item = data;
        const menuItem =  { searchField: data.name,id: id, unitTypeID: data?.unitTypeID  }
        this.searchForm.patchValue( menuItem )
      })
    }
  }

  initSearchModel(searchPhrase: string): ProductSearchModel {
    const model = {} as ProductSearchModel
    model.pageSize    = 100;
    model.currentPage = 1;
    model.name        = searchPhrase;
    return model;
  }

  initModel(id: number): ProductSearchModel {
    const model = {} as ProductSearchModel
    model.pageSize    = 100;
    model.currentPage = 1;
    return model;
  }

  clearInput() {
    this.clearInputsEmit.emit('true')
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/placeholderimage.png'; // Angular will resolve this path correctly.
  }

  getItemSrc(item:IMenuItem) {
    if (!this.bucketName) { return}
    const thumbnail = item?.thumbnail ?? item?.urlImageMain;
    if (!thumbnail) {
         return null
    } else {
      const thumbnail =  item?.thumbnail ?? item?.urlImageMain;
      const imageName =  thumbnail.split(",")
      if (!imageName || imageName.length == 0) {
        return null
      }
      const image =`${this.bucketName}${imageName[0]}`
      return image
    }
  }


}

