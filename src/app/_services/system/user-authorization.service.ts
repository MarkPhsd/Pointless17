import { Injectable } from '@angular/core';
import { IUser } from 'src/app/_interfaces';
import { ClientTableService } from '../people/client-table.service';
import { SitesService } from '../reporting/sites.service';
// https://dev.to/rdegges/please-stop-using-local-storage-1i04
@Injectable({
  providedIn: 'root'
})
export class UserAuthorizationService {

  constructor(
      private siteService: SitesService,
      private clientTableService: ClientTableService,
      )
  { }

  currentUser() {
    const item = localStorage.getItem('user');
    return JSON.parse(item) as IUser;
  }

  setUser(user: IUser) {
    localStorage.setItem('user', JSON.stringify(user))
    const site =  this.siteService.getAssignedSite()
    this.clientTableService.putPreference(site, user.userPreferences, user.id).subscribe(data => {
    })
  }

  get user() {
    const item = localStorage.getItem('user');
    return JSON.parse(item) as IUser;
  }

  validateUser() {
    const user = this.currentUser()
    if (user && user.username && user.roles)  {  return true }
    return false
  }

  isUserAuthorized(requiredArray: string): boolean {

    const user = this.currentUser();

    if (user && user.roles) {
      // console.log(user?.roles, user?.lastName)
    }
    if (!user || !user.roles) {return}

    // console.log(user.roles, user.lastName)
    const currentRole = user?.roles.toLowerCase();

    if (!currentRole) { return }
    if (!user || !user?.roles) { return false}
    if (!this.validateUser)   { return false }
    if (!requiredArray)       { return false }

    let result = false;
    requiredArray    = requiredArray.toLowerCase();
    const rolesArray = requiredArray.split(',')
    rolesArray.forEach( data => {
      if (data.trim() === currentRole) {
          result = true;
        }
      }
    )

    // console.log('result', result)
    return result
  }

  isCurrentUserStaff(): boolean {
    const item =    this.isUserAuthorized('admin,manager,employee')
    if (item == undefined) {
      return false
    }
    return item
  }

  get isStaff(): boolean {
    const item =  this.isUserAuthorized('admin,manager,employee')
    if (item == undefined) {
      return false
    }
    return item
  }
  get isUser(): boolean {
    const item =   this.isUserAuthorized('user')
    if (item == undefined) {
      return false
    }
    return item
  }
  get isManagement(): boolean {

    // console.log('is management', this.isUserAuthorized('admin,manager'))
    const item =   this.isUserAuthorized('admin,manager')
    if (item == undefined) {
      return false
    }
    return item
  }
  get isManager(): boolean {
    const item =   this.isUserAuthorized('admin,manager')
    if (item == undefined) {
      return false
    }
    return item
  }
  get isAdmin(): boolean {
    const item =   this.isUserAuthorized('admin')
    if (item == undefined) {
      return false
    }
    return item
  }
}
