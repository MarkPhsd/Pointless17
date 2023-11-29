import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, Subject, debounceTime, distinctUntilChanged, filter, fromEvent, of, switchMap, tap } from 'rxjs';
import { IProduct, ISite } from 'src/app/_interfaces';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { IItemBasic, MenuService } from 'src/app/_services';
import { MatricesService, IMatrix } from 'src/app/_services/menu/matrices.service';
import { MetaTagsService } from 'src/app/_services/menu/meta-tags.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-item-Associations',
  templateUrl: './itemassociations.component.html',
  styleUrls: ['./itemassociations.component.scss']
})
export class ItemassociationsComponent implements OnInit,OnDestroy,AfterViewInit {

  @Input() product : IProduct;

  
  @ViewChild('input', {static: true}) input: ElementRef;
  @ViewChild('metaTag') metaTag: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete ;
  get productNameControl()  { return this.inputForm.get("productName") as UntypedFormControl};
 
  // @ViewChild('productName') productNameTags: ElementRef<HTMLInputElement>;
  // @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @Input() filter: ProductSearchModel; //productsearchModel;

  
  @Input()  list:        string;

  productName: string;

  productNameSearch
  visible           = true;
  selectable        = true;
  removable         = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredFruits    : Observable<string[]>;
  allMetaTags       : Observable<IMatrix[]>;
  action$: Observable<any>;

  inputForm : FormGroup;
  searchForm: FormGroup;

  searchPhrase:    Subject<any> = new Subject();
  site:            ISite;
  deleteItem$: Observable<any>;
  associations$: Observable<any>;
  itemList          : IMatrix[];
  itemTags          : string[];
  itemStringList 
  searchModel                 =  {} as ProductSearchModel;
  
  results$ = this.searchPhrase.pipe(
    debounceTime(250),
    distinctUntilChanged(),
    switchMap(searchPhrase => {
      console.log('searchPhrase', searchPhrase)
      if (this.filter) { this.searchModel = this.filter }
      this.searchModel.name = searchPhrase;
      return this.menuService.getItemBasicBySearch(this.site,  this.searchModel)
     }
    )
  )

  constructor(private siteService: SitesService,
              private matricesService: MatricesService,
              private menuService: MenuService,
              private fb: FormBuilder
              ) { 
    this.site = this.siteService.getAssignedSite()
  }

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite();
    if (this.product.id != 0) { 
      this.initMatrices(this.product.id)
    }
 
  }
  
  ngOnDestroy() { 

  }
  ngAfterViewInit() {
    this.initSearchForm()
  }
  refreshSearch(search: any){
    if (search) {
      this.searchPhrase.next( search )
    }
  }

  initMetaTags(list: string){
    if ( list ) {
      this.itemTags = list.split(',')
    }
  }

  initMatrices(productID: number) { 
    //then we get the matrices by list. 
    const site = this.siteService.getAssignedSite()
    const item$  = this.matricesService.listAssociationsForTaging(site, this.product.id)
    this.associations$ = item$.pipe(switchMap(data => { 
      this.refreshData(data)
      return of(data);
    }))
  }

  intForm() { 
    this.inputForm = this.fb.group({
      id: [],
      name: [],
      fieldID1: [],
      fieldID2: [],
      MatrixFieldType1: [],
      MatrixFieldType2: [],
      productID: [],
      productName: [],
    })
  }

  publishData(list: IMatrix[]) {
    this.itemTags = [];
    list.forEach( data => { 
      data.productID = this.product.id ;
      if (data.fieldID1 == this.product.id) { 
        this.itemTags.push(data.matrixField2)
      }
      if (data.fieldID2 == this.product.id) { 
        this.itemTags.push(data.matrixField1)
      }
    })
  }

  refreshData(data) { 
    this.itemList = data;
    this.intForm();
    this.publishData(data);
  }

  remove(item: string): void {
    let items = [] as IMatrix[]
    this.itemList.forEach(data => { 
      let addItem : boolean;
      addItem = true
      if (data.matrixField1 == item) {
        //remove this item
        console.log('id 1 -', data.id)
        this.deleteItem$ = this.matricesService.deleteMatrix(this.site, data.id)
        addItem = false
       }
       if (data.matrixField2 == item) {
        console.log('id 2 -', data.id)
        this.deleteItem$ = this.matricesService.deleteMatrix(this.site, data.id)
        addItem = false
       }

       if (addItem) { 
        items.push(data)
       }
    })
 
    this.refreshData(items)
  }

  initSearchForm() {
    this.searchForm = this.fb.group( {
      productName: []
    })
    // this.searchForm.patchValue({productName: ''})
    // this.productNameControl.setValue('')// = ''
  }

  selectItem(item: string){
    console.log('select item', item);
  }
  
  getItem(event) {
    const item = {} as IItemBasic;
    item.name = event?.name;
    item.id = event?.id;

    if (!this.itemTags) { this.itemTags = []};
    this.itemTags.push(item.name)

    const matrix = {} as IMatrix;
    matrix.fieldID1 = this.product.id;
    matrix.matrixField1 = this.product.name;
    matrix.productID = this.product.id;
    matrix.productName = this.product.name;

    matrix.matrixField2 = event?.name;
    matrix.fieldID2 = event?.id;

    if (!this.itemList) { this.itemList = []}
    this.itemList.push(matrix)
    this.initSearchForm();

    this.saveMatrixItem(matrix)
  }

  add(event) { 
    console.log('add', event)
  }

  saveItemList() { 
    this.action$ =  this.matricesService.saveMatrixList(this.site, this.itemList,this.product.id).pipe(switchMap(data => { 
      console.log('data', data)
      return of(data)
    }))
  }

  saveMatrixItem(item:IMatrix) { 

    let associationID = 0;
    if (item.fieldID1 == this.product.id) { 
      associationID = item.fieldID2
    } else { 
      associationID = item.fieldID1
    }

    this.action$ =  this.matricesService.saveMatrix(this.site, item ,this.product.id, associationID).pipe(switchMap(data => { 
      console.log('data', data)
      return of(data)
    }))
  }

  onChange(item: any) {
    const menuItem = item.option.value as IItemBasic;
    const menuItemName =`${menuItem.name}`;
    console.log('menuItem', menuItem)
    if (item) {
      // this.selectItem(menuItem)
      // this.item = item
      // if (!item || !item.name){
      //   return ''
      // }  else {
      //   return menuItemName
      // }
    }
  }

  displayFn(item) {
    console.log('item', item)
    return;
    if (item) {
      this.selectItem(item);
      return item.name;
    }
  }


}
