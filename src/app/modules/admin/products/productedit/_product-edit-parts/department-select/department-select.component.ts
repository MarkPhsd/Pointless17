import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, of,switchMap } from 'rxjs';
import { MenuService } from 'src/app/_services';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-department-select',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
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


