import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListComponent } from './attribute-list.component';
import { attributeListStateKey, initialAttributeListState } from '../state/attribute-list.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '@tailormap/shared';
import { getApplicationServiceMockProvider } from '@tailormap/testing-utilities';

describe('AttributeListComponent', () => {

  let spectator: Spectator<AttributeListComponent>;
  const initialState = { [attributeListStateKey]: initialAttributeListState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: AttributeListComponent,
    imports: [ SharedModule ],
    providers: [
      provideMockStore({ initialState }),
      getApplicationServiceMockProvider(),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    store = spectator.inject(MockStore);
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
