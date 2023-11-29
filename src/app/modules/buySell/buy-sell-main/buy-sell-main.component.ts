import { Component, OnInit } from '@angular/core';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, MenuService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BrandsResaleService } from 'src/app/_services/resale/brands-resale.service';
import { ClassesResaleService } from 'src/app/_services/resale/classes-resale.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'buy-sell-main',
  templateUrl: './buy-sell-main.component.html',
  styleUrls: ['./buy-sell-main.component.scss']
})
export class BuySellMainComponent implements OnInit {

  buyItem$: Observable<any>;
  isApp     = false;
  itemFound$: Observable<any>;

  attributes$: Observable<any>;
  departments$: Observable<any>;
  brands$: Observable<any>;
  genderID: number;
  departmentID: number;
  attribute: string;
  genders =  [{ id:0, name: 'Male'}, { id: 1, name: 'Female'}]
  brandID: number;
  gender = {id: 1, name:'Female'}
  uiHomePage: UIHomePageSettings
  _uiHomePage: Subscription;
  menuItem: IMenuItem

  _posDevice: Subscription;
  posDevice: ITerminalSettings
  bucketName: string;

  subscribeUIHomePage() {
    try {
      this._uiHomePage = this.uISettingsService.homePageSetting$.subscribe(data => {
        if (data) {
          this.uiHomePage = data;
        }
      })
    } catch (error) {

    }

    try {
      this._posDevice = this.uISettingsService.posDevice$.subscribe(data => {
        this.posDevice = data;
      })
    } catch (error) {

    }
  }

  constructor(
    private uISettingsService : UISettingsService,
    private classesResaleService: ClassesResaleService,
    private menuService: MenuService,
    private siteService: SitesService,
    public  platFormService   : PlatformService,
    private awsBucket         : AWSBucketService,
    private productEditButtonService: ProductEditButtonService,
    private orderMethodsService: OrderMethodsService,
    private brandsResaleService: BrandsResaleService) { }

  async ngOnInit() {
    this.isApp    = this.platFormService.isApp()
    this.subscribeUIHomePage()
    this.bucketName =   await this.awsBucket.awsBucket();
    this.reset()
  }

  getUrl(imageUrl) {
    if (!imageUrl) {
      if (this.isApp) { return }
      const image = this.awsBucket.getImageURLPath(this.bucketName, "placeholderproduct.png")
      return image
    } else {
      const imageName =  imageUrl.split(",")
      const image =`${this.bucketName}${imageName[0]}`
      return image
    }
  }

  reset() {
    this.genderID = 0;
    this.gender = {id: 1, name:'Female'}
    this.departmentID = 0
    this.attribute = null;
    const site  = this.siteService.getAssignedSite()
    this.departments$ = this.menuService.getGetDepartmentList(site)
  }

  setBrandID(id:number) {
    this.brandID = id;
    this.findItem()
  }

  findItem() {

    const site  = this.siteService.getAssignedSite()
    const item$ = this.menuService.findItemForBuyBack(site, this.departmentID, this.attribute, this.gender.id, this.brandID, this.gender.id)
    this.itemFound$ = item$.pipe(switchMap(data => {
      this.menuItem = data;
      return of(data)
    }))

  }

  setDepartmentID(id: number) {
    console.log(event)
    this.departmentID = id
    this.attribute = null;
    this.brands$ = null;
    this.refreshAttributes()
  }

  refreshBrands() {
    const site  = this.siteService.getAssignedSite()
    this.brands$ = this.brandsResaleService.getBrandsByAttributeDepartment_sub(site, this.departmentID, this.attribute, this.gender?.id)
  }

  refreshAttributes()  {
    const site  = this.siteService.getAssignedSite()
    this.attributes$ = this.classesResaleService.getAttributeListByDepartment(site,  this.departmentID)
  }

  setAttribute(event) {
    console.log(event.value)
    const site  = this.siteService.getAssignedSite()
    this.attribute = event;
    this.refreshBrands()
  }


  buyItem() {
    if (!this.menuItem) {
      return
    }
    const site = this.siteService.getAssignedSite()
    const item$ = this.menuService.getMenuItemByID(site, this.menuItem.id)

    this.buyItem$ = item$.pipe(switchMap(data => {
        if (!data) {
          console.log('no item')
          return of(null)
        }
        console.log('menu Item', data)
        return   this.productEditButtonService.openBuyInventoryItemDialogObs(data,  this.orderMethodsService.order)

      }
    ))
                                                                                ;
  }


}
