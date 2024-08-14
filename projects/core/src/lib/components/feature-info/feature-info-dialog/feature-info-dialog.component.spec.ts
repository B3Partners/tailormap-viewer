import { render, screen, waitFor } from '@testing-library/angular';
import { FeatureInfoDialogComponent } from './feature-info-dialog.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { featureInfoStateKey, initialFeatureInfoState } from '../state/feature-info.state';
import { SharedModule } from '@tailormap-viewer/shared';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { selectCurrentlySelectedFeature, selectFeatureInfoCounts, selectFeatureInfoDialogVisible } from '../state/feature-info.selectors';
import { getAppLayerModel } from '@tailormap-viewer/api';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { TestBed } from '@angular/core/testing';
import { FeatureInfoModel } from '../models/feature-info.model';
import { showNextFeatureInfoFeature, showPreviousFeatureInfoFeature } from '../state/feature-info.actions';
import { ViewerLayoutService } from '../../../services/viewer-layout/viewer-layout.service';
import { CoreSharedModule } from '../../../shared';
import { initialMapState, mapStateKey } from '../../../map/state/map.state';

const getFeatureInfo = (updated?: boolean): FeatureInfoModel => {
  return {
    geometry: null,
    layer: getAppLayerModel(),
    sortedAttributes: [
      { key: 'prop', attributeValue: 'test', label: 'Property' },
      { key: 'prop2', attributeValue: 'another test', label: 'Property 2' },
      { key: 'fid', attributeValue: updated ? '6' : '1', label: 'fid' },
    ],
  };
};

const renderWithState = async (withSelectors = true) => {
  const { container } = await render(FeatureInfoDialogComponent, {
    imports: [
      SharedModule,
      CoreSharedModule,
      NoopAnimationsModule,
      MatIconTestingModule,
    ],
    providers: [
      { provide: ViewerLayoutService, useValue: { setLeftPadding: jest.fn(), setRightPadding: jest.fn() } },
      provideMockStore({
        initialState: {
          [featureInfoStateKey]: { ...initialFeatureInfoState },
          [mapStateKey]: { ...initialMapState },
        },
        selectors: withSelectors ? [
          { selector: selectCurrentlySelectedFeature, value: getFeatureInfo() },
          { selector: selectFeatureInfoDialogVisible, value: true },
          { selector: selectFeatureInfoCounts, value: { total: 1, current: 0 } },
        ] : [],
      }),
    ],
  });
  return { container };
};

describe('FeatureInfoDialogComponent', () => {

  test('runs without feature info', async () => {
    const { container } = await renderWithState(false);
    expect(container.querySelector('.feature-info')).toBeNull();
  });

  test('shows feature info', async () => {
    await renderWithState();
    expect((await screen.findByText(/fid/)).nextSibling?.textContent?.trim()).toEqual('1');
    expect((await screen.findByText(/Property 2/)).nextSibling?.textContent?.trim()).toEqual('another test');
    const store = TestBed.inject(MockStore);
    store.dispatch = jest.fn();
    (await screen.findByText(/Next/)).click();
    expect(store.dispatch).toHaveBeenCalledWith({ type: showNextFeatureInfoFeature.type });
    (await screen.findByText(/Back/)).click();
    expect(store.dispatch).toHaveBeenCalledWith({ type: showPreviousFeatureInfoFeature.type });
  });

  test('updates feature info when state changes', async () => {
    await renderWithState();
    expect((await screen.findByText(/fid/)).nextSibling?.textContent?.trim()).toEqual('1');
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectCurrentlySelectedFeature, getFeatureInfo(true));
    store.refreshState();
    await waitFor(() => {
      expect((screen.getByText(/fid/)).nextSibling?.textContent?.trim()).toEqual('6');
    });
  });

});
