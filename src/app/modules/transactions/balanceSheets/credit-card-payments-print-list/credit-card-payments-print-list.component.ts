import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { IPOSPaymentsOptimzed,Result,Summary,Paging } from 'src/app/_interfaces';

@Component({
  selector: 'credit-card-payments-print-list',
  templateUrl: './credit-card-payments-print-list.component.html',
  styleUrls: ['./credit-card-payments-print-list.component.scss']
})
export class CreditCardPaymentsPrintListComponent implements OnInit {

  @Input() list: IPOSPaymentsOptimzed;

  results:      Result[];
  paging:       Paging;
  summary:      Summary;
  errorMessage: null;

  constructor(private httpClient: HttpClient) { }

  async  ngOnInit() {

    const styles = await this.httpClient.get('assets/htmlTemplates/balancesheetStyles.txt', {responseType: 'text'}).pipe().toPromise()
    // console.log('styles', styles)
    const style = document.createElement('style');
    style.innerHTML = styles;
    document.head.appendChild(style);

  }

}



// amountPaid:       number;
// balanceRemaining: number;
// tipAmount:        number;
