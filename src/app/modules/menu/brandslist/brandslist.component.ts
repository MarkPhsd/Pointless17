import { Component, ElementRef,AfterViewInit,
         OnInit, EventEmitter,Output,
        ViewChild,
        Input} from '@angular/core';
import { ClientSearchModel, ClientSearchResults, IUserProfile }  from 'src/app/_interfaces';
import { AWSBucketService, ContactsService, MenuService} from 'src/app/_services';
import { trigger, transition, animate, style, query, stagger } from '@angular/animations';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Capacitor, Plugins } from '@capacitor/core';
import { ElectronService } from 'ngx-electron';
import { IPagedList } from 'src/app/_services/system/paging.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { PlatformService } from 'src/app/_services/system/platform.service';

// https://codeburst.io/how-to-create-horizontal-scrolling-containers-d8069651e9c6
// horizontal scroll

const { Keyboard } = Plugins;

@Component({
  selector: 'app-brandslist',
  templateUrl: './brandslist.component.html',
  styleUrls: ['./brandslist.component.scss'],
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
export class BrandslistComponent implements OnInit, AfterViewInit {
  @ViewChild('input', {static: true}) input: ElementRef;
  @ViewChild('nextPage', {read: ElementRef, static:false}) elementView: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  get platForm() {  return Capacitor.getPlatform(); }
  @Input()         panelHeightValue = 300;
  panelHeightStyle= ''
  classcontainer   : string;
  currentPage : number;
  startRow    : number;
  endRow      : number;

  searchForm       : UntypedFormGroup;
  searchPhrase     :         Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();
  placeHolderImage   : String = "assets/images/placeholderimage.png"

  searchItems$              : Subject<ClientSearchResults[]> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch()
    )
  )

  isDown =                false;
  startX:                 any;
  scrollLeft:             any;
  href:                   string;
  brandslider:            HTMLElement;
  section:                number;
  bucketName:             string;
  bucket:                 string;
  brands$:                Observable<IUserProfile[]>;
  brands:                 IUserProfile[];
  singlePage:             boolean;
  noBrands: boolean;
  clientSearchModel       = {} as ClientSearchModel;
  endOfRecords            = false;
  loading                 : boolean;
  // platForm                =  this.getPlatForm()
  appName                 = ''
  isApp                   = false;
  value: any;

  orderslist       = 'orders-list'
  clientSearchResults$: Observable<ClientSearchResults>;
  itemsPerPage     : number;
  totalRecords     : number;
  pagingInfo       : IPagedList;
  scrollingInfo    : any;
  endofItems       : boolean;
  toggleSearch     : boolean;
  throttle         = 300;
  scrollDistance   = 1;
  scrollUpDistance = 1.5;
  scrollContainer  :   any;
  isNearBottom     :   any;

  constructor(
      private platformService: PlatformService,
      private fb             : UntypedFormBuilder,
      private router         : Router,
      private siteService    : SitesService,
      private contactsService: ContactsService,
      private awsBucket      : AWSBucketService,
      private menuService    : MenuService,

      )
  {  }

  initClass(placement) {
    if (this.href === '/brandslist') {
      // this.singlePage = true
      // this.classcontainer = 'parent-container-single-page'
      // this.orderslist = 'orders-list-single-page'

      this.singlePage = true
      this.classcontainer = 'parent-container-single-page'
      this.orderslist = 'orders-list-single-page'
      return;

    }
    // if (this.href != '/brandslist') {
    //   this.singlePage = false
    //   this.classcontainer = 'parent-container'
    //   this.orderslist     = 'orders-list'
    // }
    this.singlePage = false
    this.classcontainer = 'parent-container'
    this.orderslist     = 'orders-list'

  }

  async ngOnInit()  {
    this.isApp =  this.platformService.isApp();
    this.initForm();
    this.section = 1;
    this.href = this.router.url;
    this.initClass('constructor');
    await this.getBucket()
    const site = this.siteService.getAssignedSite();
    const searchModel       = {} as ClientSearchModel;
    searchModel.pageNumber  = 1
    searchModel.pageSize    = 25;
    this.clientSearchModel        = searchModel;
    this.initFirstSearch(site, searchModel);
  }

  async initFirstSearch(site, searchModel) {
    this.clientSearchModel.pageNumber   = 1
    this.clientSearchModel.currentPage  = 1
    this.clientSearchResults$     = this.contactsService.getLiveBrands(site, searchModel)
    const data                    = await this.clientSearchResults$.pipe().toPromise();
    if (!data) { return }
    this.brands                   = data.results
    if (!this.endOfRecords) {
      this.brands.push(this.loadMore)
    }
    if (!this.brands) { return }
    if (this.brands.length == 0 ) { this.noBrands = true }
  }

  ngAfterViewInit() {
    this.initSearchOption();
    // this.initClass('ngAfterViewInit');
  }

  initSearchOption() {
    try {
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
    } catch (error) {
      console.log('error', error)
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
    console.log('bucket', this.bucket)
  }

  showAll() {
    this.router.navigate(["/brandslist/"]);
  }

  getBrandSource(imageName: string) {
    return this.getItemSrc(imageName)
  }

  getItemSrc(nameArray: string) {
    // if (this.bucket) {

    //   return
    // }
    return this.awsBucket.getImageURLFromNameArray(this.bucket, nameArray)
  }

  /* lists items in BrandComponent */
  listItems(id:number) {
    //make search model for inifinite page.
    this.initProductSearchModel(id)
    this.router.navigate(["/menuitems-infinite/", {brandID:id}]);
  }

  initProductSearchModel(id: number): ProductSearchModel {
    let productSearchModel        = {} as ProductSearchModel;
    productSearchModel.brandID    = id;
    productSearchModel.pageSize   = 25
    productSearchModel.pageNumber = 1
    this.menuService.updateSearchModel(productSearchModel)
    return productSearchModel
  }

  onScrollDown() {
    this.scrollingInfo = 'scroll down'
    this.nextPage();
  }

  onScrollUp() {
    console.log('scrolled up!!');
  }

  searchToggle() {
    this.toggleSearch = !this.toggleSearch
    if (this.toggleSearch) {
      this.initForm();
      this.initSearchOption();
      if (this.input) {
        this.input.nativeElement.focus();
      }
    }
  }

  initForm() {
    this.searchForm   = this.fb.group( {
      itemName        : [''],
    })
  }

  async nextPage() {
    this.clientSearchModel.currentPage   = this.clientSearchModel.currentPage + 1;
    await this.addToList(this.clientSearchModel.pageSize, this.clientSearchModel.pageNumber )
  }

  scrollDown() {
    var scrollingElement = (document.scrollingElement || document.body);
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
  }

  async addToList(pageSize: number, pageNumber: number)  {
    const model                    = this.clientSearchModel
    if (!model.currentPage)        { model.currentPage = 1}
    model.pageNumber               = pageNumber
    model.pageSize                 = pageSize
    const site                     = this.siteService.getAssignedSite();
    const results$                 = this.contactsService.getLiveBrands(site, model);
    this.loading                   = true

    results$.subscribe(data => {
      console.log('data.results', data.results)
      if (!data || data.results.length == 0 || data.results == null) {
        this.value = 100;
        this.loading = false;
        this.endOfRecords = true
        return
      }

      if (!this.brands)  { this.brands = [] as IUserProfile[] }
      this.itemsPerPage = this.itemsPerPage + data.results.length;

      if (this.brands) {

        if (this.brands[this.brands.length-1]?.id == -1) {
          this.brands.splice(this.brands.length-1, 1)
        }

        data.results.forEach( item => {
          this.brands.push(item)
        })

        this.totalRecords = data.paging.totalRecordCount;

        if ( this.brands.length == this.totalRecords ) {
          this.endOfRecords = true;
          this.loading = false;
          this.value = 100;
        }

        this.value = ((this.brands.length /  data.paging.totalRecordCount ) * 100).toFixed(0)

        console.log('this.endofRecords', this.endOfRecords)
        if (!this.endOfRecords) {
          this.brands.push(this.loadMore)
        }

        this.loading      = false
        return
      }
        this.pagingInfo = data.paging
        if (data) {
          this.brands    = data.results
          this.loading      = false
          this.value = 100;
        }
      }
    )
  };

  get loadMore() {
    let item = { } as  IUserProfile
    item.company = 'Load More';
    item.id = -1;
    return item
  }
  //this is called from subject rxjs obversablve above constructor.
  async refreshSearch() {
    this.currentPage                    = 1
    const site                          = this.siteService.getAssignedSite()
    const searchModel                   = this.initSearchModel();
    this.startRow                       = 1;
    this.endRow                         = 25
    this.clientSearchModel              = searchModel
    this.brands                         = [] as IUserProfile[]
    this.clientSearchModel.pageSize     = 25
    this.clientSearchModel.pageNumber   = 1
    this.clientSearchModel.currentPage  = 1
    await this.addToList(this.clientSearchModel.pageSize, this.clientSearchModel.pageNumber )
    return this._searchItems$
  }

  initSearchModel(): ClientSearchModel {
    let searchModel        = {} as ClientSearchModel;
    searchModel = this.applyBrandSearchModel(searchModel)
    return searchModel
  }

  applyBrandSearchModel(searchModel: ClientSearchModel) : ClientSearchModel {
    if (this.itemName.value) {
      searchModel.name        = this.input.nativeElement.value
    }
    searchModel.pageSize   = 25
    searchModel.pageNumber = 1
    return searchModel;
  }



}
