import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit ,Input} from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeNestedDataSource } from '@angular/material/tree';
import { PB_Components, PB_Main } from 'src/app/_services/partbuilder/part-builder-main.service';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { BooleanValueAccessor } from '@ionic/angular';

interface RecipeFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

interface PB_MainTreeNode {
  id: number;
  name: string;
  pb_MainID_Associations: PB_MainTreeNode[];
}

@Component({
  selector: 'part-builder-tree',
  templateUrl: './part-builder-tree.component.html',
  styleUrls: ['./part-builder-tree.component.scss']
})
export class PartBuilderTreeComponent{
  viewDetails : boolean;
  @Input() pb_Main: PB_Main // = PIZZA_RECIPE_DATA;

  treeControl = new NestedTreeControl<PB_MainTreeNode>((node) => node.pb_MainID_Associations);
  dataSource = new MatTreeNestedDataSource<PB_MainTreeNode>();

  constructor() {
    if (!this.pb_Main) { return  }
    this.dataSource.data = [this.transformData(this.pb_Main)];
  }

  private transformData(main: PB_Main): PB_MainTreeNode {
    return {
      id: main?.id,
      name: main?.name,//,
      pb_MainID_Associations: []
      // pb_MainID_Associations: main.pB_Components.map(
      //   (subMain) => this.transformData(subMain)
      // ),
    };
  }

  hasChild = (_: number, node: PB_MainTreeNode) =>
    !!node.pb_MainID_Associations && node.pb_MainID_Associations.length > 0;
}
