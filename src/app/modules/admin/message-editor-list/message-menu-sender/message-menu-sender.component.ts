import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { RequestMessageService } from 'src/app/_services/system/request-message.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'message-menu-sender',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './message-menu-sender.component.html',
  styleUrls: ['./message-menu-sender.component.scss']
})
export class MessageMenuSenderComponent {
  messagesNotZero$ = this.requestMessageService.getTemplateBalanceIsNotZeroMessages()  // Observable<IRequestMessage[]>;
  messagesZero$ = this.requestMessageService.getTemplateBalanceIsZeroMessages() //   Observable<IRequestMessage[]>;
  action$: Observable<any>;

  @Input() order: IPOSOrder;
  @Input() isStaff : boolean;

  isApp: boolean;

  constructor(private platFormService: PlatformService,
              public userAuthorizationService: UserAuthorizationService,
              private authenticationService: AuthenticationService,
              public orderMethodsService: OrderMethodsService,
              private requestMessageService: RequestMessageService,
          ) { }

  ngOnInit() {
    this.isApp = this.platFormService.isApp();
  }

  sendMessage(item, order) {
    this.action$ = this.orderMethodsService.sendOrderForMessageService(item, order)
  }
}
