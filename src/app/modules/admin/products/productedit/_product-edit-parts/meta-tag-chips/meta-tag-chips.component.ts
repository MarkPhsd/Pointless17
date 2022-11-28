import { Component, ElementRef, Input, ViewChild, AfterViewInit, Output, OnInit, EventEmitter} from '@angular/core';
import { COMMA, ENTER} from '@angular/cdk/keycodes';
import { FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import { MatChipInputEvent} from '@angular/material/chips';
import { fromEvent, Observable, Subject} from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, tap} from 'rxjs/operators';
import { IProduct, ISite } from 'src/app/_interfaces';
import { MenuService } from 'src/app/_services';
import { IMetaTag, MetaTagsService } from 'src/app/_services/menu/meta-tags.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-meta-tag-chips',
  templateUrl: './meta-tag-chips.component.html',
  styleUrls: ['./meta-tag-chips.component.scss']
})

export class MetaTagChipsComponent implements AfterViewInit, OnInit  {

  get f()   { return this.inputForm;}
  get metaTags()  { return this.inputForm.get("metaTags") as FormControl;}

  @ViewChild('input', {static: true}) input: ElementRef;
  @ViewChild('metaTag') metaTag: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete ;
  // @Output() itemSelect  = new EventEmitter();
  @Input()  inputForm  :        FormGroup;
  @Input()  metaTagList:        string;
  @Input()  product    :        IProduct;

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
  itemTags          : string[]

  //need to init list of meta tags.
  //also need to be able to push to list of meta tags.
  //but the list of meta tags isn't a list, it's  a compiled result of the array of
  //strings from all products. ? Or should I just have a list that is automatically generated
  //
  // allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  allMetaTags: Observable<IMetaTag[]>;

  searchPhrase:    Subject<any> = new Subject();
  site:            ISite;

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
            private _fb: FormBuilder)
  {
    this.inputForm = this._fb.group({ metaTags: [''] })
    const list = this.metaTagService
    this.site = this.sitesService.getAssignedSite()
  }

  async ngOnInit() {
    //the nput from the parent shouold work
    if (this.metaTags) {
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

    this.initMetaTags(this.metaTags.value)
    if (this.metaTagList) {
      this.initMetaTags(this.metaTagList)
    }
  }

  addtoDataList(value: string) {
    const tag = {} as IMetaTag;
    tag.name = value
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
    console.log('set tag value', value)

    if (!this.itemTags) { this.itemTags = []}
    if ((value || '').trim()) { this.itemTags.push(value.trim()); }
    if (input) { input.value = ''; }
    let tags = ''

    this.itemTags.forEach( data =>
    {
      if (tags != '' && tags == 'undefined' )
      {
        tags = `${tags},${data}`
      }
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
