import { Component, OnInit , Input, Output, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'mat-select-ngmodel',
  templateUrl: './mat-select-ngmodel.component.html',
  styleUrls: ['./mat-select-ngmodel.component.scss']
})
export class MatSelectNGModelComponent implements OnInit {

  @Input()  list$      : Observable<any>;
  @Input()  itemID     : any;
  @Output() outPutItem = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

  setItemID(event) {
    console.log(event.value)
    this.outPutItem.emit(event.value)
  }

}


