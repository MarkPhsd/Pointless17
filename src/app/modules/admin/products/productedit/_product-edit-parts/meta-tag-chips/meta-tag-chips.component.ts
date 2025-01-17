import { Component, ElementRef, Input, ViewChild, AfterViewInit, Output, OnInit, EventEmitter} from '@angular/core';
import { COMMA, ENTER} from '@angular/cdk/keycodes';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent, MatLegacyAutocomplete as MatAutocomplete} from '@angular/material/legacy-autocomplete';
import { MatLegacyChipInputEvent as MatChipInputEvent} from '@angular/material/legacy-chips';
import { fromEvent, Observable, Subject} from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, tap} from 'rxjs/operators';
import { IProduct, ISite } from 'src/app/_interfaces';
import { MenuService } from 'src/app/_services';
import { IMetaTag, MetaTagsService } from 'src/app/_services/menu/meta-tags.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'app-meta-tag-chips',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,
  SharedPipesModule],
  templateUrl: './meta-tag-chips.component.html',
  styleUrls: ['./meta-tag-chips.component.scss']
})

export class MetaTagChipsComponent implements AfterViewInit, OnInit  {

  get f()   { return this.inputForm;}

  @Input() placeholder = 'meta tags';
  @Input() fieldDescription ='Meta Tags';

  @ViewChild('input', {static: true}) input: ElementRef;
  @ViewChild('metaTag') metaTag: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete ;
  get metaTags()  { return this.inputForm.get("metaTags") as UntypedFormControl;}

  // @Output() itemSelect  = new EventEmitter();
  @Input()  inputForm  :        UntypedFormGroup;
  @Input()  metaTagList:        string;
  @Input()  itemTags          : string[]
  @Input()  product      :        IProduct;
  @Input()  inventory    : IInventoryAssignment;
  @Input()  serviceTypeFeatures: any;

  // @Output() outPutItemTags = new EventEmitter()
  @Output() outPutItemTags = new EventEmitter<any>();
  // @Output() testOutPut     :   EventEmitter<boolean> = new EventEmitter();
  @Output() testOutPut     = new EventEmitter<any>();

  visible           = true;
  selectable        = true;
  removable         = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredFruits    : Observable<string[]>;

  @Output() callEmit = new EventEmitter();
  // Existing Tags from string, must convert to string array.
  // fruits: string[] = ['Lemon'];


  //need to init list of meta tags.
  //also need to be able to push to list of meta tags.
  //but the list of meta tags isn't a list, it's  a compiled result of the array of
  //strings from all products. ? Or should I just have a list that is automatically generated
  //
  // allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  allMetaTags: Observable<IMetaTag[]>;
  searchPhrase:    Subject<any> = new Subject();
  site:            ISite;
  @Input() isDisabled :boolean;
  results$ = this.searchPhrase.pipe(
            debounceTime(250),
            distinctUntilChanged(),
            switchMap(searchPhrase =>
                this.metaTagService.getBasicLists(this.site,  searchPhrase)
    )
  )

  constructor(private menuService: MenuService,
            private sitesService: SitesService,
            private metaTagService: MetaTagsService,
            private _fb: UntypedFormBuilder)
  {

    this.inputForm = this._fb.group({ metaTags: [''] })
    this.site = this.sitesService.getAssignedSite()
  }

  ngOnInit() {

    //the nput from the parent shouold work
    if (this.metaTags) {
      if (! this.metaTags.value) {
        return;
      }
      this.initMetaTags( this.metaTags.value)// this.metaTagsList
    }
    return
  }

  initMetaTags(list: string){
    if ( list ) {
      this.itemTags = list.split(',')
    }
  }

  ngAfterViewInit() {
    if (this.input) {
      fromEvent(this.input.nativeElement,'keyup')
          .pipe(
              filter(Boolean),
              debounceTime(500),
              distinctUntilChanged(),
              tap ((event:KeyboardEvent) => {
                const search  = this.input.nativeElement.value
                this.refreshSearch(search);
              })
          )
      .subscribe();
    }

    if (this.metaTags && this.metaTags.value) {
      this.initMetaTags(this.metaTags.value)
    }

    if (this.metaTagList) {
      this.initMetaTags(this.metaTagList)
    }
  }

  addtoDataList(value: string) {
    let tag = {} as IMetaTag;
    tag.name = value
    if (this.inventory) {
      tag.departmentID = this.inventory?.departmentID;
      tag.brandID      = this.inventory?.brandID;
      tag.attribute    = this.inventory?.attribute;
    }
    if (this.product) {
      tag.departmentID = this.product?.departmentID;
      tag.brandID      = this.product?.brandID;
    }
    if (this.serviceTypeFeatures) {
      // tag.servipeID = this.product?.departmentID;
      // tag.brandID      = this.product?.brandID;
      return;
    }

    const tags$ = this.metaTagService.post(this.site, tag)
    tags$.subscribe()
  }

  add(event: MatChipInputEvent): void {
    if (!event || event == null ) { return }
    const input = event.input;
    const value = event.value;

    this.addtoDataList(value)
    this.setTagValue(value, input)
  }

  remove(item: string): void {
    const index = this.itemTags.indexOf(item);
    if (index >= 0) {
      this.itemTags.splice(index, 1);
    }
    this.outPutItemTags.emit(this.itemTags.toString())
    this.setMetaTagsToProduct();
  }

  setTagValue(value: string, input: HTMLInputElement) {
    this.outPutItemTags.emit('output items meta tags')

    if (!this.itemTags) { this.itemTags = []}
    if ((value || '').trim()) { this.itemTags.push(value.trim()); }
    if (input) { input.value = ''; }
    let tags = ''

    this.itemTags.forEach( data =>
    { if (tags != '' && tags == 'undefined' )
      { tags = `${tags},${data}` }
    })

    this.outPutItemTags.emit(this.itemTags.toString())

    if (tags) {
      this.metaTags.setValue(tags)
      this.setMetaTagsToProduct()
    }
  }

  setMetaTagsToProduct() {
    let tags : string;
    tags = ''
    this.itemTags.forEach( data => {
      if (typeof data != 'undefined') {
         if (tags === '')
         { tags = `${data}`}
         else
         {tags = `${data},${tags}`}
      }
    })
    if (tags) { this.inputForm.patchValue({metaTag: tags}) }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!event || event == null ) { return }
    this.itemTags.push(event.option.viewValue);
    this.metaTag.nativeElement.value = '';
    this.metaTags.setValue(null);
  }

  refreshSearch(search: any){
    if (search) {
      this.searchPhrase.next( search )
    }
  }

  searchItems(name: string) {
    this.searchPhrase.next(name);
  }

  selectItem(item: string){
    // this.itemSelect.emit(item)
    console.log('select item', item)
  }


  displayFn(item) {
    if (item) {
      this.selectItem(item)
      return item.name;
    }
  }

}
