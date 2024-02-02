import { Injectable } from '@angular/core';
import { HttpClient,   } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { BehaviorSubject, Observable, of, switchMap, } from 'rxjs';
import { employee, employeeJobs, IClientTable, ISite, IUserProfile } from 'src/app/_interfaces';
import { IItemBasic } from '../menu/menu.service';
import { IPagedList } from '../system/paging.service';
import { UntypedFormBuilder, UntypedFormGroup, } from '@angular/forms';
import { Pagination } from 'swiper';


export interface EmployeeClockView {
    id:number;
    employeeID: number;
    employeeName: string;
    logInTime: string;
    logOuttime: string;
    breakMinutes:number;
    breakViews: any[];
    name: string;
}

export interface EmployeeSearchResults {
 results: employee[];
 paging: IPagedList;
}

export interface IEmployeeClient {
  employee: employee;
  client  : IClientTable;
  message : string;
}

export interface EmployeePinResults {
  client:   IUserProfile;
  employee: employee;
 }
//  export interface  EmployeeBasic {
//  id : number;
//  firstName  : string;
//  lastName  : string;
//  dob  : string;
//  email  : string;
//  phone  : string;
//  terminationDate  : string;
// }



export interface EmployeeSearchModel {
  dOB: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  pageSize : number;
  pageNumber : number;
  pageCount : number;
  currentPage : number;
  lastPage : number;
  useNameInAllFieldsForSearch: boolean;
  id: number;
  jobTypeID: number;
  terminated: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private _searchModel       = new BehaviorSubject<EmployeeSearchModel>(null);
  public searchModel$        = this._searchModel.asObservable();


  private _currentEditEmployee       = new BehaviorSubject<employee>(null);
  public currentEditEmployee$        = this._currentEditEmployee.asObservable();

  updateCurrentEditEmployee(employee:  employee) {
    this._currentEditEmployee.next(employee);
  }

  updateSearchModel(searchModel:  EmployeeSearchModel) {
    this._searchModel.next(searchModel);
  }

  constructor( private http: HttpClient,
               private auth: AuthenticationService,
               private _fb:   UntypedFormBuilder ) { }


  delete(site: ISite, id: number) : Observable<employee> {

    const controller =  "/employees/"

    const endPoint = `deleteEmployee`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<employee>(url)

  }

  getEmployeeBySearch(site: ISite, employeeSearchModel: EmployeeSearchModel):  Observable<EmployeeSearchResults> {

    const controller = "/employees/"

    const endPoint = 'getEmployeeBySearch';

    const parameters = '';

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<EmployeeSearchResults>(url, employeeSearchModel);

  }

  getEmployeeByPIN(site: ISite, pin: string):  Observable<EmployeePinResults> {

    const controller = "/employees/"

    const endPoint = 'getEmployeeByPIN';

    const parameters = `?pin=${pin}`;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<EmployeePinResults>(url);

  }

  listEmployeesOnClock(site:ISite):  Observable<EmployeeClockView[]> {

    const controller = "/EmployeeClocks/";

    const endPoint = 'ListEmployeesOnClockView';

    const parameters = '';

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<EmployeeClockView[]>(url).pipe(switchMap(data => {
      const item = data
      let list = item
      if (list.length > 0) {
        list.forEach(data => {
          data.name = `${data.employeeName}`
          data.id = data.employeeID;
        })
        list = list.sort((a, b) => {
          if (a.name < b.name) {
              return -1;
          }
          if (a.name > b.name) {
              return 1;
          }
          return 0;
      });

      }
      return of(list)
    }))

  }

  getAllActiveEmployees(site: ISite):  Observable<IItemBasic[]> {

    const controller = "/employees/"

    const endPoint = 'getAllActiveEmployees';

    const parameters = '';

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IItemBasic[]>(url);

  }

  getEmployee(site: ISite, id: number):  Observable<employee> {

    const endPoint = "/employees/"

    const parameters = `getEmployee?id=${id}`;

    const url = `${site.url}${endPoint}${parameters}`

    return this.http.get<employee>(url);

  }

  getEmployees(site: ISite):  Observable<employee[]> {

    const endPoint = "/employees/"

    const parameters = `getEmployees`;

    const url = `${site.url}${endPoint}${parameters}`

    return this.http.get<employee[]>(url);

  }

   getEmployeeBySearchListOnly(site):  Observable<employee[]> {

    const endPoint = "/employees/"

    const parameters = `getEmployees`;

    const url = `${site.url}${endPoint}${parameters}`

    let  search = {} as EmployeeSearchModel;
    search.pageSize = 50;

    return this.http.post<EmployeeSearchResults>(url, search).pipe(switchMap(data => {
      const item = data as  unknown as EmployeeSearchResults;
      let list = data.results;
      if (list.length > 0) {
        list.forEach(data => {
          data.name = `${data.lastName}, ${data.firstName}`
        })
        list = list.sort((a, b) => {
          if (a.name < b.name) {
              return -1;
          }
          if (a.name > b.name) {
              return 1;
          }
          return 0;
      });

      }
      return of(list)
    }))

  }

  //GetSaleTypes

  // getDrivers(site: ISite):  Observable<IEmployee[]> { return this.getEmployeesByJobType(site,'driver') }

  // getDispatchers(site: ISite):  Observable<IEmployee[]> { return this.getEmployeesByJobType(site,'dispatcher') }

  // getBudtenders(site: ISite):  Observable<IEmployee[]> { return this.getEmployeesByJobType(site,'budTender') }

  // getCashiers(site: ISite):  Observable<IEmployee[]> { return this.getEmployeesByJobType(site,'cashier') }

  // getServers(site: ISite):  Observable<IEmployee[]> { return this.getEmployeesByJobType(site,'server') }

  // getManagers(site: ISite):  Observable<IEmployee[]> { return this.getEmployeesByJobType(site,'dispatcher') }

  // getEmployeesByJobType(site: ISite, name: string) :  Observable<IEmployee[]> {

  //   const controller = `/employees/`

  //   const endPoint = 'GetEmployeeByJobType'

  //   const parameters = `?name='${name}'`

  //   const url = `${site.url}${controller}${endPoint}${parameters}`

  //   return this.http.get<IEmployee[]>(url);

  // }


  saveClient( site: ISite,  client: employee) : Observable<employee> {
    if (client.id !== 0) {
      return this.putEmployee(site, client.id, client)
    } else {
      return this.postEmployee(site, client)
    }
  }

  saveEmployeeClient( site: ISite, clientEmployee: IEmployeeClient):  Observable<IEmployeeClient> {

    const controller = `/ClientTable/`

    const endPoint = 'putEmployeeClient'

    const parameters = ``;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<IEmployeeClient>(url, clientEmployee);

  }

  putEmployee(site: ISite, id: number, employee: employee):  Observable<employee> {

    const controller = `/employees/`

    const endPoint = 'putEmployee'

    const parameters = ``;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<employee>(url, employee);

  }

  putEmployeeMetrcKey(site: ISite, id: number, employee: employee):  Observable<employee> {

    const controller = `/employees/`

    const endPoint = 'putEmployeeMetrcKey'

    const parameters = ``;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<employee>(url, employee);

  }

  postEmployee(site: ISite, employee: employee):  Observable<employee> {

    const controller = `/employees/`

    const endPoint = 'postEmployee'

    const parameters = ``;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<employee>(url, employee);

  }

  //   <div *ngIf="requiredForm.controls['name'].invalid && requiredForm.controls['name'].touched" class="alert alert-danger">
//   <div *ngIf="requiredForm.controls['name'].errors.required">
//   Name is required.
// </div>
// </div>
// , [Validators.required, Validators.maxLength(10), Validators.minLength(4)]
// , [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]
  initForm(fb: UntypedFormGroup): UntypedFormGroup {
    fb = this._fb.group({
      id:                        [''],
      firstName:                 [''],
      lastName:                  [''],
      address:                   [''],
      city:                      [''],
      state:                     [''],
      zip:                       [''],
      phone:                     [''],
      cell:                      [''],
      email:                     [''],
      emergencyContact:          [''],
      emergencyPhone:            [''],
      positionID:                [''],
      dob:                       [''],
      jobTypeID:                 [''],
      courtesyTitle:             [''],
      notes:                     [''],
      reportsTo:                 [''],
      logonOnCheck1:             [''],
      logonCheck2:               [''],
      logonCheck3:               [''],
      password:                  ['' ],
      socialSecurity:            [''],
      payRate:                   [''],
      numberofHoursPrefered:     [''],
      active:                    [''],
      hireDate:                  [''],
      registerLock:              [''],
      withHolding:               [''],
      employeeTier:              [''],
      employeeDiscountRate:      [''],
      employeeCard:              [''],
      title:                     [''],
      prefix:                    [''],
      driverOut:                 [''],
      driverOrder:               [''],
      termTemp:                  [''],
      activePosition:            [''],
      onClock:                   [''],
      terminationDate:           [''],
      upsize_ts:                 [''],
      driverFee:                 [''],
      commissionRate:            [''],
      logonPassword:             [''],
      securityLevel:             [''],
      siteID:                    [''],
      regionMajorID:             [''],
      regionMinorID:             [''],
      regionSuperiorID:          [''],
      commissionDollarLevel:     [''],
      commissionPercentageLevel: [''],
      commissionGroupID:         [''],
      apiPassword:               [''],
      metrcLicenseNumber:        [''],
      metrcStatus:               [''],
      metrcType:                 [''],
      metrcGranted:              [''],
      metrcExpires:              [''],
      metrcHired:                [''],
      metrcMGR:                  [''],
      metrcLastLogin:            [''],
      stateIDNumber:             [''],
      stateIDExpiration:         [''],
      metrcKey:                  [''],
      metrcPass:                 [''],
    })
    return fb
  }
}

// jobType:                   JobType;
