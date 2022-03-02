import { Injectable } from '@angular/core';
import { IUser } from 'src/app/_interfaces';
// https://dev.to/rdegges/please-stop-using-local-storage-1i04
@Injectable({
  providedIn: 'root'
})
export class UserAuthorizationService {

  constructor(
      )
  { }

  currentUser() {
    return JSON.parse(localStorage.getItem('user')) as IUser;
  }

  validateUser() {
    const user = this.currentUser()
    if (user && user.username && user.roles)  {  return true }
    return false
  }

  isUserAuthorized(requiredArray: string): boolean {
    const user = this.currentUser();

    if (!user.roles)  { return false}

    if (!this.validateUser) { return false }
    if (!requiredArray)     { return false }
    if (!user) { return false}

    const currentRole = user.roles;
    let result = false;
    requiredArray    = requiredArray.toLowerCase();
    const rolesArray = requiredArray.split(',')
    rolesArray.forEach( data => {
      if (data === currentRole) {
          console.log('isAuthorized', true, data)
          result = true;
        }
      }
    )

    return result
  }

  isCurrentUserStaff(): boolean {
    return  this.isUserAuthorized('admin, manager, employee')
  }

  get isStaff(): boolean {
    return  this.isUserAuthorized('admin, manager, employee')
  }
  get isUser(): boolean {
    return  this.isUserAuthorized('user')
  }
  get isManagement(): boolean {
    return  this.isUserAuthorized('admin, manager')
  }
  get isAdmin(): boolean {
    return  this.isUserAuthorized('admin')
  }
}
