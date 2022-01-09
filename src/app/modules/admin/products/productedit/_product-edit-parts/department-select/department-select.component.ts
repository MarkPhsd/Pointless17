import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { MenuService } from 'src/app/_services';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-department-select',
  templateUrl: './department-select.component.html',
  styleUrls: ['./department-select.component.scss']
})
export class DepartmentSelectComponent implements OnInit {

  @Input()  inputForm:    FormGroup;
  @Output() outputDepartmentID   :      EventEmitter<any> = new EventEmitter();

  departments$:           Observable<IMenuItem[]>;

  constructor(
              private menuService:  MenuService,
              private sitesService: SitesService) { }

  ngOnInit(): void {
    const site        =      this.sitesService.getAssignedSite();
    this.departments$ =      this.menuService.getListOfDepartments(site);
  }

  getDepartment(event) {
    this.outputDepartmentID.emit(event)
  }

}


