import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, of,switchMap } from 'rxjs';
import { MenuService } from 'src/app/_services';
import { FormControl, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-department-select',
  templateUrl: './department-select.component.html',
  styleUrls: ['./department-select.component.scss']
})
export class DepartmentSelectComponent implements OnInit {

  @Input()  inputForm:    UntypedFormGroup;
  @Output() outputDepartmentID   :      EventEmitter<any> = new EventEmitter();

  departments$:           Observable<IMenuItem[]>;
  loadingItems  : boolean;

  constructor(
              private menuService:  MenuService,
              private sitesService: SitesService) { }

  ngOnInit(): void {
    const site        =      this.sitesService.getAssignedSite();
    this.loadingItems = true;
    this.departments$ =      this.menuService.getListOfDepartmentsAll(site).pipe(
      switchMap(data => {
        this.loadingItems = false
        return of(data)
      })
    )
  }

  getDepartment(event) {
    this.outputDepartmentID.emit(event)
  }

}


