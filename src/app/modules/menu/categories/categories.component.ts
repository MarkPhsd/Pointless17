
import {  Component, ElementRef,AfterViewInit,
   OnInit, EventEmitter,Output,
  ViewChild,
  ChangeDetectorRef} from '@angular/core';
import { IProductCategory }  from 'src/app/_interfaces';
import { AWSBucketService, IProductSearchResults, MenuService} from 'src/app/_services';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { trigger, transition, animate, style, query, stagger } from '@angular/animations';
import { Capacitor, Plugins } from '@capacitor/core';
import { ElectronService } from 'ngx-electron';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { IPagedList } from 'src/app/_services/system/paging.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { PlatformService } from 'src/app/_services/system/platform.service';
const { Keyboard } = Plugins;

// https://codeburst.io/how-to-create-horizontal-scrolling-containers-d8069651e9c6
//we are only using one section now.
// https://dev.to/angular/ain-t-nobody-needs-hostlistener-fg4


// Multi Column Grid - cdk To change 'isHandSet
// https://stackoverflow.com/questions/53477373/cdk-virtualscroll-with-mat-grid-list

//nice design based on cards.
//https://zoaibkhan.com/blog/create-a-responsive-card-grid-in-angular-using-flex-layout-part-1/

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  animations: [
    trigger('pageAnimations', [
      transition(':enter', [
        query('.photo-record, .menu li, form', [
          style({opacity: 0, transform: 'translateY(-100px)'}),
          stagger(-30, [
            animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('filterAnimation', [
      transition(':enter, * => 0, * => -1', []),
      transition(':increment', [
        query(':enter', [
          style({ opacity: 0, width: '0px' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, width: '*' })),
          ]),
        ])
      ]),
      transition(':decrement', [
        query(':leave', [
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 0, width: '0px' })),
          ]),
        ])
      ]),
    ]),
    trigger('listAnimation', [
      transition('* => 3', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-100px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'none' })),
          ]),
        ])
      ]),
      transition('1 => 2', [
        query(':enter', [
          style({ position: 'absolute', opacity: 0, transform: 'translateX(-100px)' })
        ]),
        query(':leave', [
          style({ opacity: 1, transform: 'translateX(0px)' }),
          animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(100px)' })),
          style({ position: 'absolute' }),
        ]),
        query(':enter', [
          style({ position: 'static' }),
          animate('300ms ease-out', style({ opacity: 1, transform: 'none' })),
        ])
      ]),
      transition('2 <=> 1', [
        query(':enter', [
          style({ position: 'absolute', opacity: 0, transform: 'translateX(100px)' })
        ]),
        query(':leave', [
          style({ opacity: 1, transform: 'translateX(0px)' }),
          animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-100px)' })),
          style({ position: 'absolute' }),
        ]),
        query(':enter', [
          style({ position: 'static' }),
          animate('300ms ease-out', style({ opacity: 1, transform: 'none' })),
        ])
      ]),
      transition('* => 1, * => 2', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-100px)' }),
          animate('300ms ease-out', style({ opacity: 1, transform: 'none' })),
        ])
      ]),
    ]),
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class CategoriesComponent implements OnInit, AfterViewInit{
  // @HostBinding('@pageAnimations')
  amount: any;

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  currentPage : number;
  startRow    : number;
  endRow      : number;
  loading     : boolean;
  endOfRecords: boolean;
  searchForm       : FormGroup;
  searchPhrase     :         Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  searchModel: ProductSearchModel
  searchItems$              : Subject<IProductSearchResults> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch()
    )
  )

  productSearchResults : IProductSearchResults
  categories$:    Observable<IMenuItem[]>;
  categories:     IMenuItem[];
  isDown  =       false;
  startX:         any;
  scrollLeft:     any;
  href:           string;
  slider:         HTMLElement;
  section:        number;
  bucket:         string;
  private destroy$ = new Subject<void>();
  singlePage:     boolean;
  public style    = {};
  platForm =  this.getPlatForm()
  appName = ''
  isApp   = false;

  value: any;
  itemsPerPage  : number;
  totalRecords  : number;
  pagingInfo    : IPagedList;
  scrollingInfo : any;
  endofItems    : boolean;
  toggleSearch  : boolean;
  throttle         = 300;
  scrollDistance   = 1;
  scrollUpDistance = 1.5;

  scrollContainer  :   any;
  isNearBottom     :   any;

  classcontainer   : string;
  orderslist       : string
  getPlatForm() {  return Capacitor.getPlatform(); }

  constructor(
                private menuService:     MenuService,
                private awsBucket:       AWSBucketService,
                private router:          Router,
                private siteService:     SitesService,
                private platFormService :PlatformService,
   )
  {

    this.isApp = this.platFormService.isApp();
    this.section = 1
    this.href = this.router.url;
    this.initClass('constructor');
  }

  async  ngOnInit() {
   await this.getBucket()
   this.init()
  }

  init() {
    const site = this.siteService.getAssignedSite()
    const searchModel = {} as ProductSearchModel;
    searchModel.itemTypeID = '4'
    searchModel.pageSize = 25;
    searchModel.currentPage = 1;
    searchModel.pageSize = 1;
    this.searchModel = searchModel;
    this.addToList(searchModel.pageNumber, searchModel.pageSize)
  }

  initClass(placement) {
    if (this.href === '/categories') {
      this.singlePage = true
      this.classcontainer = 'parent-container-single-page'
      this.orderslist = 'orders-list-single-page'
    }
    if (this.href != '/categories') {
      this.singlePage = false
      this.classcontainer = 'parent-container'
      this.orderslist     = 'orders-list'
    }
  }

  ngAfterViewInit() {
    this.initSearchOption();
  }

  initSearchOption() {
    if (this.input) {
      fromEvent(this.input.nativeElement,'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(250),
        distinctUntilChanged(),
        tap((event:KeyboardEvent) => {
          const search  = this.input.nativeElement.value
          this.input.nativeElement.focus();
          this.refreshSearch();
        })
      )
      .subscribe();
    }

    if (this.platForm != 'web') {
      setTimeout(()=> {
        this.input.nativeElement.focus();
        Keyboard.hide();
      }, 200 )
    }
  }

  clearAll(){
    this.initSearchModel();
    this.input.nativeElement.value = ''
    this.input.nativeElement.focus();
    Keyboard.hide();
  }

  async getBucket() {
    this.bucket =   await this.awsBucket.awsBucket();
  }

  refreshMouseMove(pageX: any) {
    if (this.slider) {
      const x = pageX - this.slider.offsetLeft;
      const walk = (x -  this.startX) * 3; //scroll-fast
      this.slider.scrollLeft =  this.scrollLeft - walk;
    }
  }

  showAll() {
    this.router.navigate(["/categories/"]);
  }

  listItems(id:number) {
    this.initProductSearchModel(id)
    this.router.navigate(["/menuitems-infinite/", {categoryID:id}]);
  }

  // getImageSource(imageName: string) {
  //   return this.getItemSrc(imageName)
  // }

  getItemSrc(nameArray: string) {
    return this.awsBucket.getImageURLFromNameArray(this.bucket, nameArray)
  }

  initProductSearchModel(id: number): ProductSearchModel {
    let productSearchModel        = {} as ProductSearchModel;
    { productSearchModel.categoryID  = id.toString(); }
    productSearchModel.pageSize   = 25
    productSearchModel.pageNumber = 1
    this.menuService.updateMeunuItemData(productSearchModel)
    return productSearchModel;
  }

  initSearchModel(): ProductSearchModel {
    let searchModel       = {} as ProductSearchModel;
    searchModel           = this.applyBrandSearchModel(searchModel)
    return searchModel
  }

  async nextPage() {
    this.searchModel.currentPage   = this.searchModel.currentPage + 1;
    await this.addToList(this.searchModel.pageSize, this.searchModel.pageNumber )
  }

  onScrollDown() {
    this.scrollingInfo = 'scroll down'
    this.nextPage();
  }

  onScrollUp() {
    console.log('scrolled up!!');
  }

  async addToList(pageSize: number, pageNumber: number)  {

    const model                    = this.searchModel
    if (!model.currentPage)        { model.currentPage = 1}
    model.pageNumber               = model.currentPage
    model.pageSize                 = pageSize
    const site                     = this.siteService.getAssignedSite();
    const results$                 = this.menuService.getMenuItemsBySearchPaged(site, model);
    this.loading                   = true

    results$.subscribe(data => {
      this.loading = false;

      if (!data || data.results.length == 0 || data.results == null) {
        this.value = 100;
        this.loading      = false
        this.endOfRecords = true
        return
      }

      if (!this.categories)  { this.categories = [] as IMenuItem[] }
      this.itemsPerPage = this.itemsPerPage + data.results.length;

      if (this.categories) {
        // this.menuItems = this.menuItems.concat(data.results)
        if (data.results) {
          data.results.forEach( item => {
            this.categories.push(item)
          })
        }

        this.totalRecords = data.paging.totalRecordCount;
        if ( this.categories.length == this.totalRecords ) {
          this.endOfRecords = true;
          this.loading = false;
          this.value = 100;
        }

        this.value = ((this.categories.length /  data.paging.totalRecordCount ) * 100).toFixed(0)
        this.loading      = false
        return
      }

        this.pagingInfo = data.paging
        if (data) {
          this.categories    = data.results
          this.loading      = false
          this.value = 100;
        }
      }
    )

  };


    //this is called from subject rxjs obversablve above constructor.
    async refreshSearch() {
      this.currentPage         = 1
      const site               = this.siteService.getAssignedSite()
      const searchModel        = this.initSearchModel();
      this.startRow            = 1;
      this.endRow              = 25
      this.searchModel = searchModel
      this.productSearchResults = {} as IProductSearchResults
      this.searchModel.pageSize    = 25
      this.searchModel.pageNumber  = 1
      this.searchModel.currentPage = 1
      this.searchModel.itemTypeID  = '4'
      await this.addToList(this.searchModel.pageSize, this.searchModel.pageNumber )
      return this._searchItems$
    }



    applyBrandSearchModel(searchModel: ProductSearchModel) : ProductSearchModel {
      if (this.itemName.value) {
        searchModel.categoryName        = this.input.nativeElement.value
      }
      searchModel.pageSize   = 25
      searchModel.pageNumber = 1
      return searchModel;
    }


}
