import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSPaymentsOptimzed,Result,Summary,Paging } from 'src/app/_interfaces';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'credit-card-payments-print-list',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './credit-card-payments-print-list.component.html',
  styleUrls: ['./credit-card-payments-print-list.component.scss']
})
export class CreditCardPaymentsPrintListComponent implements OnInit {

  @Input() list: IPOSPaymentsOptimzed;
  @Input() autoPrint: boolean;
  @Input() groupType : boolean;
  @Output() renderComplete = new EventEmitter<any>()
  results:      Result[];
  paging:       Paging;
  summary:      Summary;
  errorMessage: null;
  styles$: Observable<any>;
  rendered:boolean;
  constructor(private httpClient: HttpClient) { }

   ngOnInit() {
    this.styles$ =  this.httpClient.get('assets/htmlTemplates/balancesheetStyles.txt', {responseType: 'text'}).pipe(switchMap(data => {
      // console.log('styles', styles)
      const style = document.createElement('style');
      style.innerHTML = data;
      document.head.appendChild(style);
      return of(data)
    })).pipe(switchMap(data => {
      // this.renderComplete.emit(true);
      setTimeout(() => {
        this.renderComplete.emit('credit-card-payments')
      }, 1000);
      return of(data)
    }))
  }

  ngAfterViewInit() {

      // setTimeout(() => {
      //   this.renderComplete.emit('credit-card-payments')
      // }, 1000);

  }

  renderCompleted() {

  }
}


// amountPaid:       number;
// balanceRemaining: number;
// tipAmount:        number;
