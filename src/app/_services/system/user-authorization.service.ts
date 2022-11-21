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
    const item = localStorage.getItem('user');
    return JSON.parse(item) as IUser;
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

    return result
  }

  isCurrentUserStaff(): boolean {
    return  this.isUserAuthorized('admin,manager,employee')
  }

  get isStaff(): boolean {
    return  this.isUserAuthorized('admin,manager,employee')
  }
  get isUser(): boolean {
    return  this.isUserAuthorized('user')
  }
  get isManagement(): boolean {
    return  this.isUserAuthorized('admin,manager')
  }
  get isManager(): boolean {
    return  this.isUserAuthorized('admin,manager')
  }
  get isAdmin(): boolean {
    return  this.isUserAuthorized('admin')
  }
}
