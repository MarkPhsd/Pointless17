import { Component, Input, OnInit } from '@angular/core';
import { catchError, delay, Observable, repeatWhen, throwError } from 'rxjs';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { IMenuItemsResultsPaged, MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-category-items-board',
  templateUrl: './category-items-board.component.html',
  styleUrls: ['./category-items-board.component.scss']
})
export class CategoryItemsBoardComponent implements OnInit {

  headers: any;
  results$: Observable<IMenuItemsResultsPaged>;
  menu$: Observable<IMenuItem[]>;
  menu: IMenuItem[]

  @Input() chartHeight: any;
  @Input() listItemID : any;
  @Input() MMJMenu: boolean;

  gridClass=  'grid-flow prices border'
  constructor(private menuService: MenuService,
              private siteService:            SitesService,
              ) {
      }

  ngOnInit(): void {
    const minutes = 600
    this.initCSSClass();
    const searchItems = {} as ProductSearchModel;
    console.log(this.listItemID)
    if (!this.listItemID) { return }
    const item =  JSON.parse( JSON.stringify(this.listItemID))
    searchItems.categoryID = item.id
    searchItems.pageCount  = 1;
    searchItems.pageSize   = 25;
    searchItems.active     = true;
    searchItems.web        = true;
    const site = this.siteService.getAssignedSite();
    this.results$  = this.menuService.getMenuItemsBySearchPaged(site, searchItems)
    .pipe(
      repeatWhen(notifications =>
        notifications.pipe(
          delay(minutes* 5)),
      ),
      catchError((err: any) => {
        return throwError(err);
      })
    )
  }

  initCSSClass() {
    if (this.MMJMenu) {  this.gridClass = 'grid-flow-cannabis prices border' }
  }
}
