import { Component, ViewChild, ChangeDetectorRef, OnInit, Input, SimpleChange, OnChanges, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatLegacyTableDataSource as MatTableDataSource, MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent} from '@angular/material/legacy-paginator';
import {  IProductCategory, Item, }  from 'src/app/_interfaces';
import { Subject ,Observable } from 'rxjs';
import { MenuService } from 'src/app/_services/menu/menu.service';
import { ActivatedRoute, RouteConfigLoadEnd, Router } from '@angular/router';
import { fadeInAnimation } from 'src/app/_animations';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService } from 'src/app/_services';
import { MatSort } from '@angular/material/sort';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-categorieslistview',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './categorieslistview.component.html',
  styleUrls: ['./categorieslistview.component.scss'],
  animations:  [ fadeInAnimation ],
})

export class CategorieslistviewComponent  implements OnInit,OnChanges {

  @Input() notifier: Subject<boolean>

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any;

  length:           number;
  pageSize:         number;
  pageSizeOptions:  any;

  columnsToDisplay = ['id','name', 'image', 'edit'];

  product:          IMenuItem;
  bucketName:       string
  item:             Item; //for routing
  constructor(private menuService: MenuService,
     private cd: ChangeDetectorRef,
              private route: ActivatedRoute,
              private router: Router,
              private awsBucket: AWSBucketService,
              private siteService: SitesService,
              private productEditButtonService: ProductEditButtonService,
             ) { }

  async ngOnInit() {
    this.bucketName =   await this.awsBucket.awsBucket();
    this.refreshTable();
  };

  ngAfterViewInit(){
    this.refreshTable()
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.refreshTable();
  }

  refreshTable(): void {
    this.menuService.getCategoryList(this.siteService.getAssignedSite()).subscribe(
      data => {

        this.pageSize = 10
        this.length = data.length
        this.pageSizeOptions = [5, 10, 25]
        this.dataSource = new MatTableDataSource(data)
        if (this.dataSource) {

          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          console.log("Paginator set")

        }

        },
        error => {
          console.log("refreshTable", error)
        }
      );
  };

  // editItem(id:number) {
  //   this.router.navigate(["/productedit/", {id:id}]);
  // }

  editItem(id:any) {
    this.productEditButtonService.openProductDialog(id);
    return
    this.router.navigate(["/productedit/", {id:id}]);
  }

  getImageURL(nameArray: string) {
    return this.awsBucket.getImageURLFromNameArray(this.bucketName, nameArray)
  }
}
