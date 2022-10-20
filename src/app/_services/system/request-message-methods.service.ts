import { Injectable } from '@angular/core';
import { IPositionElements } from 'ngx-infinite-scroll';
import { IPOSOrder } from 'src/app/_interfaces';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { SitesService } from '../reporting/sites.service';
import { MessageService } from './message-service';
import { RequestMessageService,IRequestMessage, IRequestMessageSearchModel } from './request-message.service';
import { UserAuthorizationService } from './user-authorization.service';

@Injectable({
  providedIn: 'root'
})
export class RequestMessageMethodsService {

  constructor(private requestMessageService: RequestMessageService, 
               private userAuthorization: UserAuthorizationService,
              private siteService: SitesService) { }
  
  requestItem(item: IPOSOrderItem, order: IPOSOrder) { 
    if (!item) {}
    const site = this.siteService.getAssignedSite();
    const message = {} as IRequestMessage
    message.message = `${order.tableName} is requesting Item ${item.unitName} - ${item.unitName}.`
    message.subject = `Item Request - ${order.tableName}` 
    message.type    = 'IR' 
    message.method  = `menuitems;id=${item.productID}`
    message.userID  = order.employeeID;
    message.userRequested = order.employeeName;
    if (this.userAuthorization.user) { 
      message.senderID = this.userAuthorization.user?.id;
      message.senderName = `${this.userAuthorization?.user?.firstName}  ${this.userAuthorization?.user?.lastName}`
    }
    return this.requestMessageService.saveMessage(site, message )
  }

  requestService(order: IPOSOrder ) { 
    if (!order) {}
    const site = this.siteService.getAssignedSite();
    let message = {} as IRequestMessage
    message.message = `${order.tableName} is requesting service.`
    message.subject = `Service requested at table ${order.tableName}` 
    message.type    = 'TSR' 
    message.method  = `${order.id}`
    message = this.assignCustomerEmployee(order, message)
    return this.requestMessageService.saveMessage(site, message )
  }
  
  requestCheck(order: IPOSOrder) { 
    if (!order) {}
    const site = this.siteService.getAssignedSite();
    let message = {} as IRequestMessage
    message.message = `${order.tableName} is requesting Check.`
    message.subject = `Check requested at table ${order.tableName}` 
    message.type    = 'CSR'
    message.method  = `${order.id}` 
    message = this.assignCustomerEmployee(order, message)
    return this.requestMessageService.saveMessage(site, message )
  }

  assignCustomerEmployee(order: IPOSOrder, message: IRequestMessage) : IRequestMessage { 
    message.employeeID    = order.employeeID;
    message.userRequested = order.employeeName;
    if (this.userAuthorization.user) { 
      message.senderID = this.userAuthorization.user?.id;
      message.senderName = `${this.userAuthorization?.user?.firstName}  ${this.userAuthorization?.user?.lastName}`
    }
    return message
  }
  
  getCurrentUsersOpenMessages() { 

    if (!this.userAuthorization.user) { return}
    if (this.userAuthorization.user) { 
      if (this.userAuthorization.user.username === 'temp'){ 
        return 
      }
    }

    ///setup as something else when going to a larger format.
    const search = {} as IRequestMessageSearchModel
    search.pageNumber = 1
    search.pageSize = 25

    const site = this.siteService.getAssignedSite();
    return this.requestMessageService.getRequestMessagesByCurrentUser(site, search)

  }

}
