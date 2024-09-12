import { Injectable } from '@angular/core';
import { IPositionElements } from 'ngx-infinite-scroll';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { SitesService } from '../reporting/sites.service';
import { MessageService } from './message-service';
import { RequestMessageService,IRequestMessage, IRequestMessageSearchModel } from './request-message.service';
import { UserAuthorizationService } from './user-authorization.service';
import { of, switchMap } from 'rxjs';
import { SendGridService } from '../twilio/send-grid.service';
import { UIHomePageSettings } from './settings/uisettings.service';

@Injectable({
  providedIn: 'root'
})
export class RequestMessageMethodsService {

  constructor(private requestMessageService : RequestMessageService,
              private userAuthorization     : UserAuthorizationService,
              private sendGridService: SendGridService,
              private siteService           : SitesService) { }

  communicationRequest(order: IPOSOrder, user: IUser, name: string,  message: string) {
    return  this.orderCommunication( order,  user, 'oc', name, message )
  }

  orderCommunication(order: IPOSOrder, user: IUser, type: string,
                    name: string, requestMessage: string,) {

    const site = this.siteService.getAssignedSite();
    const message = {} as IRequestMessage;

    let tableName = ''
    if (order.tableName) {tableName = order.tableName };
    let orderName = ''
    if (order.customerName) { orderName = order.customerName};

    message.message = requestMessage
    message.subject = `${requestMessage} ${order.id} - ${tableName} -  ${orderName}`;
    message.type    = 'OC'
    message.orderID = order.id
    message.method  = `openOrder;id=${order.id}`
    message.userID  = user.id;
    message.userRequested = user?.firstName + user?.lastName;
    if (this.userAuthorization.isStaff) {
      message.employeeID = order?.employeeID;
    }
    if (this.userAuthorization.user) {
      message.senderID = this.userAuthorization.user?.id;
      message.senderName = `${this.userAuthorization?.user?.firstName}  ${this.userAuthorization?.user?.lastName}`
    }
    return this.requestMessageService.saveMessage(site, message );
  }

  requestPriceChange(item: IPOSOrderItem, order: IPOSOrder, user: IUser) {
    return  this.requestItemEdit(item, order,  user,'PC', 'Price Change Request - ', ' have the price adjusted.' )
  }

  requestRefund(item: IPOSOrderItem, order: IPOSOrder, user: IUser) {
    return this.requestItemEdit(item, order,  user, 'refundItem', 'Refund Item request - ', ' be refunded.' )
  }

  requestVoidItem(item: IPOSOrderItem, order: IPOSOrder, user: IUser) {
    return this.requestItemEdit(item, order,  user, 'voidItem', 'Void Item request - ', ' be voided.' )
  }

  requestItemEdit(item: IPOSOrderItem, order: IPOSOrder, user: IUser, type: string,
                 requestMessage: string, operationDescription: string) {
    if (!item) {}
    const site = this.siteService.getAssignedSite();
    const message = {} as IRequestMessage

    let tableName = ''
    if (order.tableName) {tableName =order.tableName };
    let orderName = ''
    if (order.customerName) { orderName = order.customerName};
    let unitName  = ''
    if (item.unitName) { unitName = '-' + item.unitName};
    let productName = ''
    if (item.productName) { productName = item.productName };
    let serialCode =''
    if (item.serialCode) {
      serialCode = ` having a serial code of ${item.serialCode},`
    }

    message.message = `${user.firstName} is requesting Item ${item.productName} ${item.unitName},${serialCode}
                      having a quantity of ${item.quantity}, ${operationDescription}.`
    message.subject = `${requestMessage} ${order.id} - ${tableName} -  ${orderName}`
    message.type    = 'PC'
    message.orderItemID = item.id;
    message.orderID = order.id
    message.method  = `priceChange;id=${item.id}`
    message.userID  = user.id;
    message.userRequested = user?.firstName + user?.lastName;
    if (this.userAuthorization.isStaff) {
      message.employeeID = order.employeeID;
    }
    if (this.userAuthorization.user) {
      message.senderID = this.userAuthorization.user?.id;
      message.senderName = `${this.userAuthorization?.user?.firstName}  ${this.userAuthorization?.user?.lastName}`
    }
    return this.requestMessageService.saveMessage(site, message )
  }

  requestItem(item: IPOSOrderItem, order: IPOSOrder) {
    if (!item) {}
    const site = this.siteService.getAssignedSite();
    const message = {} as IRequestMessage
    message.message = `${order.tableName} is requesting Item ${item.productName} - ${item.unitName}.`
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

  requestVoidOrder(order: IPOSOrder,emailTo: string ) {
    if (!order) {}
    const site = this.siteService.getAssignedSite();
    let message = {} as IRequestMessage
    message.message = `Please void this order : ${order.id}`
    message.subject = `Please void this order : ${order.id}`
    message.type    = 'IR'
    message.method  = `priceChange;id=${order.id}`
    message.orderID = order.id
    message = this.assignCustomerEmployee(order, message)
    return this.requestMessageService.saveMessage(site, message ).pipe(switchMap(data => {
      console.log(emailTo)
      return this.sendGridService.sendTemplateOrder(order.id, order.history, emailTo, 'Staff Request', "", "Void Order Request", "Please void order :" + order?.id , ''   )
      return of(data)
    }))
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
    // message.   = order.employeeName;
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
