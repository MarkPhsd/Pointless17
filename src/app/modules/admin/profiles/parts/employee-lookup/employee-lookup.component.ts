import { Component, OnInit, Input , EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, OnChanges} from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup,  } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeSearchModel, EmployeeSearchResults, EmployeeService } from 'src/app/_services/people/employee-service.service';
import { employee, IClientTable, ISite, IUserProfile } from 'src/app/_interfaces';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'employee-lookup',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './employee-lookup.component.html',
  styleUrls: ['./employee-lookup.component.scss']
})
export class EmployeeLookupComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() outPutItemSelect  = new EventEmitter();

  @Input() inputForm:         UntypedFormGroup;
  @Input() client             : IClientTable;
  searchForm:                 UntypedFormGroup;
  @Input() searchField:       UntypedFormControl;
  @Input() id                 : number;
  @Input() name:              string;
  searchPhrase:               Subject<any> = new Subject();
  item:                       employee;
  site:                       ISite;
  employeeName                : string;

  get lookupControl()   { return this.inputForm.get("employeeID") as UntypedFormControl};

  employees$                   : Observable<EmployeeSearchResults>;
  employee                     : employee[]
  selectedEmployee             : employee;

  @Input()  formFieldClass = 'mat-form-field form-background'

  results$ = this.searchPhrase.pipe(
    debounceTime(225),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
        this.searchList(searchPhrase)
    )
  )

  searchList(searchPhrase) {
    const site = this.siteService.getAssignedSite();
    const model = this.initSearchModel(searchPhrase)
    return this.employeeService.getEmployeeBySearch(site, model)
  }

  constructor(  private employeeService: EmployeeService,
                private fb             : UntypedFormBuilder,
                private router         : Router,
                public  route           : ActivatedRoute,
                private siteService    : SitesService,
               ) {

    this.site = this.siteService.getAssignedSite();
    this.searchForm = this.fb.group({
      employeeID: [],
    })
    this.inputForm = this.fb.group({
      employeeID: [],
    })

    if (this.client) {
      if (this.client.employeeID != 0 && !this.client.employeeID) {
        this.refreshEmployee(this.client.employeeID);
      }
    }
  }

  refreshEmployee(id: number) {
    if (id == 0 || !id) { return }
    console.log('refreshEmployee', id)
    const site = this.siteService.getAssignedSite();
    const employee$ = this.employeeService.getEmployee(site, id)
    employee$.subscribe(employee => {
      this.employeeName = `${employee.firstName} ${employee.lastName}`
    })
  }

  async ngOnInit() {
    this.init()

    if (this.client) {
      this.refreshEmployee(this.client.employeeID)
    }

  }

  async ngOnChanges() {
    this.init()
  }

  async init() {
    if (this.searchForm) {
      if (this.id) {
        const model   = this.initModel(this.id)
        const site    = this.siteService.getAssignedSite();
        const results$ = this.employeeService.getEmployeeBySearch(site, model)
        results$.subscribe (data => {
          const items = data.results
          if (items) {
            this.searchForm = this.fb.group({
              employeeID   : [items[0]],
            })
          }
        })
      }
    }
  }

  ngAfterViewInit() {
    this.init()
    if (this.searchForm && this.input) {
      try {
        fromEvent(this.input.nativeElement,'keyup')
        .pipe(
            filter(Boolean),
            debounceTime(250),
            distinctUntilChanged(),
            tap((event:KeyboardEvent) => {
              const search  = this.input.nativeElement.value
              this.refreshSearch(search);
            })
        )
        .subscribe();
      } catch (error) {
        console.log(error)
      }
    }
  }

  refreshSearch(search: any){
    if (search) {
      this.searchPhrase.next( search )
    }
  }

  searchItems(name: string) {
    if (!name) { return }
    this.searchPhrase.next(name);
  }

  selectItem(item: any){
    if (!item) { return }
    this.lookupControl.setValue(item.id)
    this.selectedEmployee = item;
    this.refreshEmployee(item.id)
    this.outPutItemSelect.emit(item)
  }

  displayFn(item) {
    if (!item) { return }
    this.selectItem(item)
    return item ? item.firstName : '';
  }

  initSearchModel(searchPhrase: string): EmployeeSearchModel {
    const model = {} as EmployeeSearchModel
    model.pageSize    = 100;
    model.currentPage = 1;
    model.name        = searchPhrase;
    return model;
  }

  initModel(id: number): EmployeeSearchModel {
    const model = {} as EmployeeSearchModel
    model.pageSize    = 100;
    model.currentPage = 1;
    model.id          = id
    return model;
  }

}

  // async  getName(id: number): Promise<any> {
  //   if (!id) {return null}
  //   if (id == 0) {return null}
  //   if (id == undefined) {return null}
  //   const site  = this.siteService.getAssignedSite();
  //   if(site) {
  //     const  item =  await this.employeeService.getEmployee(site, id).pipe().toPromise();
  //     this.selectedEmployee = item
  //     this.refreshEmployee()
  //     return item
  //   }
  // }
