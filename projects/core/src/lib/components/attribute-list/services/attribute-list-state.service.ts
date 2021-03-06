import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectDataIdForSelectedTab } from '../state/attribute-list.selectors';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttributeListStateService {

  constructor(
    private store$: Store,
  ) {}

  public executeActionForCurrentData(callback: (dataId: string) => void) {
    this.store$.select(selectDataIdForSelectedTab)
      .pipe(take(1))
      .subscribe(dataId => {
        if (!dataId) {
          return;
        }
        callback(dataId);
      });
  }

}
