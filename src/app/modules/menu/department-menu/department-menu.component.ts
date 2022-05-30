import { Component, Input, OnInit , OnDestroy} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AWSBucketService, IDepartmentList, MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { trigger,state,style,animateChild,transition,animate,keyframes,query,stagger } from '@angular/animations';
import { Observable, Subscription } from 'rxjs';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { ISite } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-department-menu',
  templateUrl: './department-menu.component.html',
  styleUrls: ['./department-menu.component.scss'],
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({opacity: 0}),
          animate('100ms ease',
            style({opacity: 1})
        ),
        query("@*", [animateChild()], {optional: true})
      ]),
      transition(':leave', [
        query("@*", [animateChild()], {optional: false}),
      ]),
    ]),

    trigger('childAnimation', [
      transition(':enter', [
          style({transform: 'translateX(100%)'}),
          animate('800ms cubic-bezier(0.2, 1, 0.3, 1)',
            style({transform: 'translateX(0%)'})
          )
      ]),
      transition(':leave', [
          style({transform: 'translateX(0%)'}),
          animate('300ms ease',
            style({
              transform: 'translateX(100%)',
              boxShadow: '0px 0 00px 0px rgba(87,73,86,0.0)'}
              )
          )
      ])
    ])

  ]
})
export class DepartmentMenuComponent implements OnInit, OnDestroy {

  @Input() departmentID: number;
  categoryID: number;
  subCateogryID: number;

  id: any;
  departments$: any;
  items: any[];
  subCategories$ : Observable<IMenuItem[]>;
  textLength: 20;
  bucketName: string;
  department : IDepartmentList;
  _department: Subscription;
  site: ISite;

  initSubscriptions() {
    this._department    = this.toolBarUIService.departmentMenu$.subscribe( data => {
      if (!data) {
        this.department     = null
        this.departmentID   = 0
        this.categoryID     = 0
        this.subCateogryID  = 0;
        return
      }
      this.department     = data;
      this.departments$   = this.menuService.getGetDepartment(this.site, data.id)
      this.categoryID     = 0
      this.subCateogryID  = 0;
    })


  }

  constructor(
    private router            : Router,
    public route              : ActivatedRoute,
    private menuService:        MenuService,
    private siteService:        SitesService,
    private awsBucketService  : AWSBucketService,
    private toolBarUIService  : ToolBarUIService,
    public  deviceService:   DeviceDetectorService,
  ) { }

  async  ngOnInit() {
    const i         = 1
    this.site       = this.siteService.getAssignedSite();
    this.bucketName = await this.awsBucketService.awsBucket();
    this.initDepartment();
    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    if (this._department)  {  this._department.unsubscribe();}
    
  }

  initDepartment() {
    console.log(this.departmentID)
    if ( this.route.snapshot.paramMap.get('id') ) {
      const id = this.route.snapshot.paramMap.get('id');
      this.id = id;
      this.refreshDepartment(+id);
      return
    }

    console.log(this.departmentID)
    if (this.departmentID) { this.refreshDepartment(+this.departmentID) }
  }

  refreshDepartment(id: number) {
    const site = this.siteService.getAssignedSite();
    this.departments$ = this.menuService.getGetDepartment(site, id)
    this.categoryID = 0
  }

  categoryList(event) {
    if (this.deviceService.isTablet) {
      this.categoryListDisplay(event);
      return
    }
    this.categoryListNavigate(event)
  }

  categoryListNavigate(event) {
    if (!event) { return }
    this.router.navigate(["/menuitems-infinite/", {categoryID:event.id }]);
    this.categoryID = event.id
    this.close();
  }

  categoryListDisplay(event) {
    if (!event) { return }
    this.router.navigate(["/menuitems-infinite/", {categoryID:event.id }]);
    this.categoryID = event.id
    this.getListOfSubCategories( this.categoryID )
  }

  subCategoryListDisplay(event) {
    if (!event) { return }
    this.router.navigate(["/menuitems-infinite/", {subCategoryID:event.id }]);
    this.subCateogryID = event.id
    this.getListOfSubCategories( this.categoryID );
    this.close();
  }

  subCategoryList(event) {
    if (!event) { return }
    this.subCateogryID = event.id
    this.router.navigate(["/menuitems-infinite/", {subCategoryID:event.id }]);
  }

  getListOfSubCategories(id: number) {
    const site = this.siteService.getAssignedSite();
    this.subCategories$ = this.menuService.getListOfSubCategoriesByCategory(site, id)
  }

  getItem() {

  }

  close() {
    this.toolBarUIService.updateDepartSearch(0)
    this.toolBarUIService.updateDepartmentMenu(null)
  }

  getItemSrc(imageName) {
    return this.awsBucketService.getImageURLFromNameArray(this.bucketName, imageName)
  }

}
