import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FbContactsService } from 'src/app/_form-builder/fb-contacts.service';
import { clientType, employee, IClientTable, IStatus, IUserProfile } from 'src/app/_interfaces';
import { IPOSOrder, IPOSOrderSearchModel, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { AuthenticationService, AWSBucketService, ContactsService, OrdersService, UserService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { EmployeeService } from 'src/app/_services/people/employee-service.service';
import { IStatuses, StatusTypeService } from 'src/app/_services/people/status-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-check-in-profile',
  templateUrl: './check-in-profile.component.html',
  styleUrls: ['./check-in-profile.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CheckInProfileComponent implements OnInit {

  inputForm: FormGroup;

  // get firstName() {return this.userForm.get("firstName") as FormControl;}
  // get lastName() { return this.userForm.get("lastName") as FormControl;}
  // get phone() { return this.userForm.get("phone") as FormControl;}
  // get email() { return this.userForm.get("email") as FormControl;}
  // get address() {   return this.userForm.get("address") as FormControl;}
  // get clientTypeName() { return this.userForm.get("clientTypeName") as FormControl;}
  // get dob() { return this.userForm.get("dob") as FormControl;}
  // get statusID() { return this.userForm.get("statusID") as FormControl}

  bucketName  :  string;
  awsBucketURL:  string;
  profile     :  IUserProfile;

  statuses$   : Observable<IStatuses[]>;
  client$     : Observable<IClientTable>;

  @Input() clientTable: IClientTable;
  @Input() id       : string;

  posOrders$  : Observable<IPOSOrder[]>;
  orders$     : Observable<IPOSOrder[]>;

  //for swipping

  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };

  public selectedIndex: number;
  isAuthorized  : boolean ;
  isStaff       : boolean;
  minumumAllowedDateForPurchases: Date

  currentOrder:  IPOSOrder;
  _currentOrder: Subscription;

  initSubscriptions() {
    this._currentOrder = this.orderService.currentOrder$.subscribe(data=> {
      this.currentOrder = data;
    })

  }

  constructor(
              private router: Router,
              public route: ActivatedRoute,
              private fb: FormBuilder,
              private sanitizer : DomSanitizer,
              private awsBucket: AWSBucketService,
              private _snackBar: MatSnackBar,
              public contactservice: ContactsService,
              private clientTableService: ClientTableService,
              private orderService: OrdersService,
              private siteService: SitesService,
              private fbContactsService: FbContactsService,
              private userAuthorization       : UserAuthorizationService,
            ) {

      this.id = this.route.snapshot.paramMap.get('id');
      this.initForm()

      this.isAuthorized =  this.userAuthorization.isUserAuthorized('admin, manager')
      this.isStaff      =  this.userAuthorization.isUserAuthorized('admin, manager, employee')
      this.initSubscriptions();
  }

 async ngOnInit() {
    const site = this.siteService.getAssignedSite();
    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.selectedIndex = 0

    if (!this.clientTable) {
      this.client$ = this.clientTableService.getClient(site, this.id);
      this.client$.subscribe(data=> {
        this.clientTable = data
        this.fillForm(this.clientTable.id);
      })
    }

    if (this.clientTable) {
      this.fillForm(this.clientTable.id);
    }

    const currentYear = new Date().getFullYear();
    this.minumumAllowedDateForPurchases = new Date(currentYear - 21, 0, 1);
    this.refreshOrders();
  }


  refreshOrders() {
    const site = this.siteService.getAssignedSite();
    let POSOrderSearchModel = {} as IPOSOrderSearchModel;
    POSOrderSearchModel.clientID = parseInt (this.id)
    this.orders$     = this.orderService.getHistoricalOrders(site, POSOrderSearchModel)
    this.posOrders$  = this.orderService.getCurrentOrders(site, POSOrderSearchModel)
  }

  initForm() {
    this.inputForm = this.fbContactsService.initForm(this.inputForm)
    return this.inputForm
  };

  fillForm(id: any) {

    this.initForm()

    if (this.clientTable) {
       this.inputForm.patchValue(this.clientTable)
       console.log('form value patched', this.clientTable)
       return
    }

    const site = this.siteService.getAssignedSite();
    this.client$ = this.clientTableService.getClient(site, id).pipe(
      tap(data => {
        this.inputForm.patchValue(data)
        console.log('form value patched', data)
        return
       })
    );

  }

  postNewCheckIn() {
    const site = this.siteService.getAssignedSite();
    if (this.id) {
      const order$ = this.orderService.getNewDefaultCheckIn(site, this.id)
      order$.subscribe(
        data => {
          this.notifyEvent(`Order Submitted Order # ${data.id}`, "Posted")
          this.refreshOrders();
        }, catchError => {
          this.notifyEvent("Order was not submitted " + catchError, "Error")
        }
      )
    }

  }

  updateUser(): void {
    const site = this.siteService.getAssignedSite();
    let result = ''

    try {
      const client$ = this.clientTableService.saveClient(site, this.inputForm.value)
      client$.pipe(
        switchMap(data =>
          {
            // console.log('update 0')
            if (!data) { return EMPTY }
            // console.log('update 1')
            if (this.currentOrder) {
              // console.log('update 2')
              return this.orderService.getOrder(site, this.currentOrder.id.toString())
            }
            // console.log('update empty')
            return EMPTY;
          }
        )).subscribe( order => {
          // console.log('update order', order)
          this.orderService.updateOrderSubscription(order)
        })

    } catch (error) {
      this.notifyEvent(result, "Failure")
    }


  };

  updateUserExit() {
    this.updateUser();
    this.goBackToList();
  };

  navUserList() {
    this.goBackToList();
  };

  goBackToList() {
    this.router.navigate(["profileListing"]);
  }

  sanitize(html) {

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  selectChange(): void{
    console.log("Selected INDEX: " + this.selectedIndex);
  }


  // Action triggered when user swipes
  swipe(selectedIndex: any, action = this.SWIPE_ACTION.RIGHT) {

    // Out of range
    if ( selectedIndex < 0 || selectedIndex > 1 ) return;

    // Swipe left, next tab
    if (action === this.SWIPE_ACTION.LEFT) {
      const isLast = selectedIndex === 1;
      selectedIndex = isLast ? 0 : selectedIndex + 1;
      console.log("Swipe right - INDEX: " +  selectedIndex);
    }

    // Swipe right, previous tab
    if (action === this.SWIPE_ACTION.RIGHT) {
      const isFirst = selectedIndex === 0;
      selectedIndex = isFirst ? 1 :  selectedIndex - 1;
      console.log("Swipe left - INDEX: " + selectedIndex);
    }
  }

  deleteUser() {
    const result =  window.confirm('Are you sure you want to delete this profile?')

    if (result == true && this.clientTable) {
      const site = this.siteService.getAssignedSite();
      const client$ = this.contactservice.deleteClient(site, this.clientTable.id)
      client$.subscribe( data => {
        this.notifyEvent('This profile has been removed.', 'Success')
        this.router.navigateByUrl('/profileListing')
      })
    }


  }

  startOrder() {
    this.postNewCheckIn()
  }


}
