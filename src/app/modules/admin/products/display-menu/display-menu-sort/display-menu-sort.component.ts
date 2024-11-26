import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, of, switchMap } from 'rxjs';
import { IDisplayMenu } from 'src/app/_interfaces/menu/price-schedule';
import { DisplayMenuService } from 'src/app/_services/menu/display-menu.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { CdkDragDrop, moveItemInArray,  } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'display-menu-sort',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './display-menu-sort.component.html',
  styleUrls: ['./display-menu-sort.component.scss']
})
export class DisplayMenuSortComponent implements OnInit {

  action$ : Observable<any>;
  @Input() inputForm       : UntypedFormGroup;
  displayMenus           : IDisplayMenu[];
  displayMenu            : IDisplayMenu;
  index                    : number;

  displayMenus$: Observable<any>;
  saveSort$: Observable<any>;

  constructor(
    private displayMenuService      : DisplayMenuService,
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
    this.displayMenus$ = this.displayMenuService.getMenus(site).pipe(
      switchMap( data => {
        this.displayMenus = data.sort((a, b) => (a.sort > b.sort ? 1 : -1));
        return of(this.displayMenus)
      }
    ))
  }

  initList(list: IDisplayMenu[]) {
    if (list) {
      list = list.sort((a , b) => (+a.sort > +b.sort) ? 1: -1)
    }
  }

  assignItem(item, index) {
    if (item) {
      this.displayMenu = item
      this.index = index
    }
  }


  drop(event: CdkDragDrop<string[]>) {
    if (this.displayMenus) {
      moveItemInArray(this.displayMenus, event.previousIndex, event.currentIndex);
      this.saveMenu()
    }
  }

  saveMenu() {
    const site = this.siteService.getAssignedSite();
    if (this.displayMenus) {

      const schedule$ = this.displayMenuService.postMenusList(site, this.displayMenus)
      schedule$.subscribe(data => {
          this.displayMenus = data.sort((a, b) => (a.sort > b.sort ? 1 : -1));
        }
      )
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
