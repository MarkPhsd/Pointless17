import { Component, Input, OnInit , OnDestroy} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AWSBucketService, IDepartmentList, MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { trigger,state,style,animateChild,transition,animate,keyframes,query,stagger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { ISite } from 'src/app/_interfaces';

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
  id: any;
  departments$: any;
  textLength: 20;
  bucketName: string;
  @Input() departmentID: number;
  department : IDepartmentList;
  _department: Subscription;
  site: ISite;

  initSubscriptions() {
    this._department    = this.toolBarUIService.departmentMenu$.subscribe( data => {
      if (!data) {
        this.department = null
        return
      }
      this.department   = data;
      this.departments$ = this.menuService.getGetDepartment(this.site, data.id)
    })
  }

  constructor(
    private router            : Router,
    public route              : ActivatedRoute,
    private menuService:        MenuService,
    private siteService:        SitesService,
    private awsBucketService  : AWSBucketService,
    private toolBarUIService  : ToolBarUIService,
  ) { }

  async  ngOnInit() {
    const i         =1
    this.site       = this.siteService.getAssignedSite();
    this.bucketName =   await this.awsBucketService.awsBucket();
    this.initDepartment();
    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    if (!this._department) {return}
    this._department.unsubscribe();
  }

  initDepartment() {
    if ( this.route.snapshot.paramMap.get('id') ) {
      const id = this.route.snapshot.paramMap.get('id');
      this.id = id;
      this.refreshDepartment(+id);
      return
    }
  }

  refreshDepartment(id: number) {
    const site = this.siteService.getAssignedSite();
    this.departments$ = this.menuService.getGetDepartment(site, id)
  }

  categoryList(event) {
    if (!event) { return }
    this.router.navigate(["/menuitems-infinite/", {categoryID:event.id }]);
  }

  getItem() {

  }

  getItemSrc(imageName) {
    return this.awsBucketService.getImageURLFromNameArray(this.bucketName, imageName)
  }

}
