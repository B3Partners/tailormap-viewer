import { render, screen, waitFor } from '@testing-library/angular';
import { CatalogTreeComponent } from './catalog-tree.component';
import { getMockStore } from '@ngrx/store/testing';
import { LoadingStateEnum, SharedModule } from '@tailormap-viewer/shared';
import { Store } from '@ngrx/store';
import { getCatalogTree, getGeoService, TAILORMAP_ADMIN_API_V1_SERVICE, TailormapAdminApiV1MockService } from '@tailormap-admin/admin-api';
import { CatalogState, catalogStateKey, initialCatalogState } from '../state/catalog.state';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { of } from 'rxjs';
import userEvent from '@testing-library/user-event';
import { addGeoServices } from '../state/catalog.actions';

const setup = async (state: Partial<CatalogState> = {}) => {
  const mockStore = getMockStore({
    initialState: { [catalogStateKey]: { ...initialCatalogState, ...state } },
  });
  const mockDispatch = jest.fn();
  mockStore.dispatch = mockDispatch;
  const mockApiService = {
    getGeoService$: jest.fn(() => {
      return of(getGeoService());
    }),
  };
  await render(CatalogTreeComponent, {
    imports: [ SharedModule, MatIconTestingModule ],
    providers: [
      { provide: Store, useValue: mockStore },
      { provide: TAILORMAP_ADMIN_API_V1_SERVICE, useValue: mockApiService },
    ],
  });
  return { mockStore, mockDispatch, mockApiService };
};

describe('GeoRegistryTreeComponent', () => {

  test('should trigger loading catalog', async () => {
    const { mockDispatch } = await setup();
    expect(mockDispatch).toHaveBeenCalledWith({ type: '[Catalog] Load Catalog' });
  });

  test('should render spinner when loading', async () => {
    await setup({ catalogLoadStatus: LoadingStateEnum.LOADING });
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  test('should render tree for nodes and load service when expanding node', async () => {
    const catalogNodes = getCatalogTree();
    const state: Partial<CatalogState> = {
      catalogLoadStatus: LoadingStateEnum.LOADED,
      catalog: catalogNodes,
    };
    const { mockDispatch, mockApiService } = await setup(state);
    expect(await screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(await screen.findByText(catalogNodes[1].title)).toBeInTheDocument();

    await userEvent.click(await screen.findByLabelText(`expand Background services`));
    await userEvent.click(await screen.findByLabelText(`expand Background services - aerial`));
    expect(mockApiService.getGeoService$).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalledTimes(4); // load catalog, expand, expand, add services
    expect(mockDispatch.mock.calls[3][0].type).toEqual(addGeoServices.type);
  });

  test('should render tree for nodes and not load service for already loaded services', async () => {
    const catalogNodes = getCatalogTree();
    const state: Partial<CatalogState> = {
      catalogLoadStatus: LoadingStateEnum.LOADED,
      catalog: catalogNodes,
      geoServices: [{ ...getGeoService({ id: '1' }), layers: [] }, { ...getGeoService({ id: '2' }), layers: [] }],
    };
    const { mockDispatch, mockApiService } = await setup(state);
    expect(await screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(await screen.findByText(catalogNodes[1].title)).toBeInTheDocument();

    await userEvent.click(await screen.findByLabelText(`expand Background services`));
    await userEvent.click(await screen.findByLabelText(`expand Background services - aerial`));
    expect(mockApiService.getGeoService$).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledTimes(3); // load catalog, expand, expand
  });

});
