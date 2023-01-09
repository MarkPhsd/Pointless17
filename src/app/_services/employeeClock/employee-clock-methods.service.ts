import { Injectable } from '@angular/core';
import { ISite, IUser } from 'src/app/_interfaces';
import { employeeBreak, EmployeeClock } from 'src/app/_interfaces/people/employeeClock';
import { EmployeeService } from '../people/employee-service.service';
import { SitesService } from '../reporting/sites.service';
import { UserAuthorizationService } from '../system/user-authorization.service';
import { EmployeeClockService } from './employee-clock.service';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeClockMethodsService {

  break: employeeBreak;
  clock: EmployeeClock;
  isOnBreak: boolean;

  constructor(private employeeClockService: EmployeeClockService,
    private siteService: SitesService,
    private employeeService: EmployeeService,
    private userAuthorizationService: UserAuthorizationService,
  ) { }

  getUserOnClock(site: ISite, user: IUser): Observable<any> {
    return this.employeeClockService.isOnClock(site, user.employeeID).pipe(
      switchMap(data => {
        // console.log('get user on clock ')
        this.clock = data;
        this.getUserOnBreak(data)
        return of(data)
    }));
  }

  getUserOnBreak(clock: EmployeeClock) {

    const site = this.siteService.getAssignedSite()
    const user = this.userAuthorizationService.user;

    this.isOnBreak = false;
    this.break = this.employeeClockService._isOnBreak(site, user, clock)
    if (this.break) {
      this.isOnBreak = true;
    }
    return false;

  }

}
