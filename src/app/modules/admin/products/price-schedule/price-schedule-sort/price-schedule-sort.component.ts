import { Component, Input, OnInit, } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { catchError, of, switchMap , Observable} from 'rxjs';
import { CdkDragDrop, moveItemInArray,  } from '@angular/cdk/drag-drop';
import { IPriceSearchModel } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'price-schedule-sort',
  templateUrl: './price-schedule-sort.component.html',
  styleUrls: ['./price-schedule-sort.component.scss']
})
export class PriceScheduleSortComponent implements OnInit   {

  action$ : Observable<any>;
  @Input() inputForm       : UntypedFormGroup;
  priceSchedules           : IPriceSearchModel[];
  priceSchedule            : IPriceSearchModel;
  index                    : number;

  priceSchedules$: Observable<any>;
  saveSort$: Observable<any>;

  constructor(
    private priceScheduleService      : PriceScheduleService,
    private siteService               : SitesService,
    private _snackBar                 : MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.refreshList()
  }

  ngDestroy() {
    const i = 0
  }

  refreshList() {
    const site = this.siteService.getAssignedSite();
    this.priceSchedules$ = this.priceScheduleService.getMenuList(site).pipe(
      switchMap( data => {
        this.priceSchedules = data.results
        // this.priceSchedules.sort((a, b) => (a.sort > b.sort ? 1 : -1));
        this.priceSchedules.sort((a, b) => a.sort - b.sort);
        return of(this.priceSchedules)
      }
    ))
  }

  refreshAllSchedules() {
    const site = this.siteService.getAssignedSite();
    this.priceSchedules$ = this.priceScheduleService.getListBySearch(site,null).pipe(
      switchMap( data => {
        this.priceSchedules = data.results
        console.table(this.priceSchedules)
        // this.priceSchedules.sort((a, b) => (a.sort > b.sort ? 1 : -1));
        this.priceSchedules.sort((a, b) => a.sort - b.sort);
        console.table(this.priceSchedules)
        return of(this.priceSchedules)
      }
    ))
  }

  initList(list: IPriceSearchModel[]) {
    if (list) {
      list = list.sort((a , b) => (+a.sort > +b.sort) ? 1: -1)
    }
  }

  assignItem(item, index) {
    if (item) {
      this.priceSchedule = item
      this.index = index
    }
  }


  drop(event: CdkDragDrop<string[]>) {
    if (this.priceSchedules) {
      moveItemInArray(this.priceSchedules, event.previousIndex, event.currentIndex);
      this.saveMenu()
    }
  }

  saveMenu() {
    const site = this.siteService.getAssignedSite();
    if (this.priceSchedules) {
      const schedule$ = this.priceScheduleService.postSchedulesList(site, this.priceSchedules)
      this.saveSort$  = schedule$.pipe(
        switchMap(data => {
          this.priceSchedules = data;
          return of(data)
        }
      ))
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  assignType(id: number) {

  }


}

// ngOnInit(): void {
//   const i = 0;
//   console.log('ngOnInit id', this.id)
//   if (this.id) {
//     const site   = this.siteService.getAssignedSite();
//     this.menus$  = this.priceScheduleService.getScheduleMenuItems(site, +this.id).pipe(switchMap(data => {
//       data.sort((a, b) => (a.sort > b.sort ? 1 : -1));
//       this.menuItems = data;
//       this.sort = 1
//       return of(data)
//     }))
//   }
// }

// toggleSort() {
//   if (this.sort == 1) {
//     console.log('this.sort', this.sort)
//     this.sort = 2;
//     this.menuItems.sort((a, b) => (a.name > b.name) ? 1 : -1)
//     return;
//   }

//   if (this.sort == 2) {
//     console.log('this.sort', this.sort)
//     this.sort = 1;
//     this.menuItems.sort((a, b) => (a.sort > b.sort ? 1 : -1));
//     return;
//   }

// }
