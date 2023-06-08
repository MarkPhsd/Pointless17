/**
 * Helper interface for listbox items
 */
export interface IListBoxItem {
  value: string;
  text: string;
  groupID: number;
}

export interface IListBoxItemB {
  id: string;
  name: string;
}

export interface IListBoxItemC {
  value: string;
  text: string;
  groupID: number;
  type: string;
  fieldTypeAggregate: string;
}
/**
* Helper interface to emit event when
* items are moved between boxes
*/
export interface IItemsMovedEvent {
  available: Array<{}>;
  selected: Array<{}>;
  movedItems: Array<{}>;
  from: 'selected' | 'available';
  to  : 'selected' | 'available';
}
