import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { BehaviorSubject, EMPTY, Observable, } from 'rxjs';
import { IClientTable, ISite, IUserProfile,employee, FlowVendor, ImportFlowVendorResults }   from  'src/app/_interfaces';
import { IDriversLicense } from 'src/app/_interfaces/people/drivers-license';
import { employeeBreak, EmployeeClock } from 'src/app/_interfaces/people/employeeClock';
import { IItemBasic } from '../menuPrompt/prompt-group.service';


export interface EmployeeClockResults{
  results : EmployeeClock[]
  message : string;
  errorMessage : string;
  paging : any;
  summary: EmployeeClock;
}

export interface EmployeeClockSearchModel{
  pageNumber: number;
  pageSize: number;
  startDate: string;
  endDate: string;
  employeeID: number;
  summary: boolean;
  orderBy: string;
}


@Injectable({
  providedIn: 'root'
})
export class EmployeeClockService {

  public _searchModel       = new BehaviorSubject<EmployeeClockSearchModel>(null);
  public  searchModel$       = this._searchModel.asObservable();

  pageNumber = 1;
  pageSize  = 50;
  controller = `/EmployeeClocks`

  constructor( private http: HttpClient, private auth: AuthenticationService) {

  }

  updateSearch(search:EmployeeClockSearchModel) {
    this._searchModel.next(search)
  }

  listEmployeesOnClock(site:ISite) : Observable<EmployeeClock[]> {

    const endPoint = '/listEmployeesOnClock'

    const parameters = ``

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.get<EmployeeClock[]>(url);

  }

  listEmployeesBetweenPeriod(site:ISite,search: EmployeeClockSearchModel): Observable<EmployeeClockResults> {

    // ?startDate=${start}&end=${end}

    const endPoint = '/listEmployeesBetweenPeriod'

    const parameters = ``

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.post<EmployeeClockResults>(url, search);

  }

  getTimeClockSummaryOnly(site:ISite,search: EmployeeClockSearchModel): Observable<EmployeeClock> {

    const endPoint = '/getTimeClockSummaryOnly'

    const parameters = ``

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.post<EmployeeClock>(url, search);

  }

  getTimeClockSummary(site:ISite,search: EmployeeClockSearchModel): Observable<EmployeeClockResults> {

    const endPoint = '/getTimeClockSummary'

    const parameters = ``

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.post<EmployeeClockResults>(url, search);

  }

  getEmployeeClock(site:ISite,id: number) : Observable<EmployeeClock> {
    const endPoint = '/getEmployeeClock'

    const parameters = `?id=${id}`

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.get<EmployeeClock>(url)
  }

  refreshCalcsEmployeesBetweenPeriod(site: ISite, searchModel: EmployeeClockSearchModel):  Observable<EmployeeClockResults> {
    const endPoint = '/refreshCalcsEmployeesBetweenPeriod'

    const parameters = ``

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.post<EmployeeClockResults>(url, searchModel)
  }

  clockIn(site:ISite,employeeID:number,jobID:number): Observable<EmployeeClock> {
    const endPoint = '/clockIn'

    const parameters = `?employeeID=${employeeID}&jobID=${jobID}`

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.get<EmployeeClock>(url)
  }

  clockOut(site:ISite,employeeID:number) : Observable<EmployeeClock> {
    const endPoint = '/clockOut'

    const parameters = `?employeeID=${employeeID}`

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.get<EmployeeClock>(url)
  }

  isOnClock(site:ISite,employeeID:number) : Observable<EmployeeClock> {
    const endPoint = '/isOnClock'

    const parameters = `?employeeID=${employeeID}`

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.get<EmployeeClock>(url)
  }

  iSOnBreak(site:ISite, employeeID:number) {
    const endPoint = '/isOnClock'

    const parameters = `?employeeID=${employeeID}`

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.get<EmployeeClock>(url)
  }

  _isOnBreak(site, user, clock: EmployeeClock): employeeBreak {

    if (!clock) { return null; }

    if (!clock.breaks) {
      return null; // or true, based on your logic if an empty array should return true
    }

    if (clock.breaks.length === 0) {
      return null; // or true, based on your logic if an empty array should return true
    }

    // Access the last item directly
    const lastBreak = clock.breaks[clock.breaks.length - 1];
    // Check if timeEnd is not set (null, undefined, or any falsy value)
    if (!lastBreak.timeEnd) {
      return lastBreak
    }
    return null;

  }

  startBreak(site:ISite, breakID: number, employeeID :number) : Observable<employeeBreak> {
    const endPoint = '/StartBreak';

    const parameters = `?BreakID=${breakID}&employeeID=${employeeID}`;

    const url = `${site.url}${this.controller}${endPoint}${parameters}`;

    return this.http.get<employeeBreak>(url);
  }

  endBreak(site:ISite,employeeID :number) : Observable<employeeBreak> {

    const endPoint = '/endBreak'

    const parameters = `?employeeID=${employeeID}`

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.get<employeeBreak>(url);

  }


  getBreakList(site:ISite) : Observable<any> {

    const endPoint = '/getBreakList'

    const parameters = ``

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.get<any>(url);

  }

  addBreakType(site:ISite, name: string, disableTime: boolean) : Observable<IItemBasic> {

    const endPoint = '/AddBreakType'

    const parameters = `?BreakName=${name}&disableTIme=${disableTime}`

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.get<IItemBasic>(url);

  }

  putEmployeeClock(site:ISite,id:number,clock: EmployeeClock) : Observable<EmployeeClock> {

    const endPoint = '/putEmployeeClock'

    const parameters = `?id=${id}`

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.put<EmployeeClock>(url, clock) ;

  }

  postEmployeeClock(site:ISite,clock: EmployeeClock): Observable<EmployeeClock> {

    const endPoint = '/postEmployeeClock'

    const parameters = ``

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.post<EmployeeClock>(url, clock)

  }

  deleteEmployeeClock(site:ISite,id:number): Observable<EmployeeClock> {

    const endPoint = '/deleteEmployeeClock'

    const parameters = `?id=${id}`

    const url = `${site.url}${this.controller}${endPoint}${parameters}`

    return this.http.delete<EmployeeClock>(url);

  }


}
