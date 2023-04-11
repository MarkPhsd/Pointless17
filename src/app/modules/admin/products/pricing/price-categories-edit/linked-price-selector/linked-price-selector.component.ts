import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IItemBasic } from 'src/app/_services';

@Component({
  selector: 'linked-price-selector',
  templateUrl: './linked-price-selector.component.html',
  styleUrls: ['./linked-price-selector.component.scss']
})
export class LinkedPriceSelectorComponent implements OnInit {
  @Input() inputForm: FormGroup;
  @Input() fieldName: string;
  list: IItemBasic[];

  constructor() { }

  ngOnInit(): void {
      this.initSizes()
  }

  initSizes() {
    const sizes = [
      {name : 'Default', id: 0 },
      {name : '1', id: 1 },
      {name : '2', id: 2 },
      {name : '3', id: 3 },
      {name : '4', id: 4 },
      {name : '5', id: 5 },
      {name : '6', id: 6 },
      {name : '7', id: 7 },
      {name : '8', id: 8 },
      {name : '9', id: 9 },
      {name : '10', id: 10 },
    ] as IItemBasic[];

    this.list = sizes
  }
}
