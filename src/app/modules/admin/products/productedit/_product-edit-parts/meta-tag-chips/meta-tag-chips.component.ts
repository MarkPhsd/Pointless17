import { Component, ElementRef, Input, ViewChild, AfterViewInit, Output, OnInit} from '@angular/core';
import { COMMA, ENTER} from '@angular/cdk/keycodes';
import { FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import { MatChipInputEvent} from '@angular/material/chips';
import { fromEvent, Observable, Subject} from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, tap} from 'rxjs/operators';
import { IProduct, ISite } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IItemBasic, MenuService } from 'src/app/_services';
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
  @Input()  inputForm:      FormGroup;
  @Input()  metaTagList:   string;
  @Input()  product:        IProduct;

  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  filteredFruits: Observable<string[]>;

  // Existing Tags from string, must convert to string array.
  // fruits: string[] = ['Lemon'];
  itemTags: string[]

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
    this.initMetaTags( this.metaTags.value)// this.metaTagsList
    console.log(this.metaTagList)
    return

  }

  initMetaTags(list: string){
    if ( list ) {
      this.itemTags = list.split(',')
    }
  }

  ngAfterViewInit() {

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
    // this.metaTags.setValue(null);

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

    this.setMetaTagsToProduct();

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

    this.inputForm.patchValue({metaTags: tags})
    this.inputForm.patchValue({metaTag: tags})

  }

  setTagValue(value: string, input: HTMLInputElement) {

    if (!this.itemTags) { this.itemTags  = []}

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

    this.metaTags.setValue(tags)
    this.setMetaTagsToProduct()

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
  }

  displayFn(item) {
    if (item) {
      this.selectItem(item)
      // this.item = item
      return item.name;
    }
  }

}
