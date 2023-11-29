import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatChipList } from '@angular/material/chips';

export interface itemsOptions { 
  name: string;
  selected: boolean;
}
@Component({
  selector: 'app-chips-display',
  templateUrl: './chips-display.component.html',
  styleUrls: ['./chips-display.component.scss']
})
export class ChipsDisplayComponent implements OnInit {
  @ViewChild('chipList')
  chipList: MatChipList;
  @Output() onMetaTagSearch = new EventEmitter();
  @Input() items: string;
  itemTags: string[];
  @Input() selectable: boolean = true; 
  selectedChips: any[] = [];
  itemsOptions = [] as itemsOptions[]
  constructor(
    ) {
  
    }

  ngOnInit() {
    this.initItemOptions(this.items)
  }

  initItemOptions(items: string) { 
    if (this.items) { 
      this.itemTags = this.items.split(',')
      this.itemTags.forEach(data => {
        let option = {} as itemsOptions; 
        option.name = data;
        option.selected = false;
        this.itemsOptions.push(option)
      })
    }
  }

 
  getSelectedChips() {
    console.log(this.chipList.selected);
  }

  changeSelected($event, fruit): void {
    fruit.selected = $event.selected;
    console.log('this.selectedChips: ' +  $event.selected);
    this.onMetaTagSearch.emit($event.selected)
  }

  updateItem(item) { 
    item.selected=!item.selected;
    this.onMetaTagSearch.emit(this.itemsOptions.filter(data => { return data.selected }))
  }
  

}
