import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/angular';
import { SharedModule } from '@tailormap-viewer/shared';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { SaveButtonComponent } from '../../shared/components/save-button/save-button.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GeoServiceService } from '../services/geo-service.service';
import { getGeoService, getGeoServiceLayer } from '@tailormap-admin/admin-api';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ExtendedGeoServiceModel } from '../models/extended-geo-service.model';
import { ExtendedGeoServiceLayerModel } from '../models/extended-geo-service-layer.model';
import { provideMockStore } from '@ngrx/store/testing';
import { createGeoServiceMock } from '../helpers/mocks/geo-service.service.mock';
import { GeoServiceLayerFormDialogComponent } from './geo-service-layer-form-dialog.component';
import { catalogStateKey } from '../state/catalog.state';
import { SpinnerButtonComponent } from '@tailormap-viewer/shared';
import { CatalogExtendedTypeEnum } from '../models/catalog-extended.model';

const setup = async () => {
  const dialogRefMock = { close: jest.fn() };
  const geoServiceModelMock: ExtendedGeoServiceModel = {
    ...getGeoService({ id: 'test', title: 'my service', url: 'http://test.service' }),
    layerIds: ['my-layer'],
    catalogNodeId: '1',
    type: CatalogExtendedTypeEnum.SERVICE_TYPE,
  };
  const geoServiceLayerMock: ExtendedGeoServiceLayerModel = {
    ...getGeoServiceLayer({ name: 'my-layer', title: 'nice layer' }),
    id: 'my-layer',
    serviceId: 'test',
    catalogNodeId: '1',
    originalId: 'my-layer',
    type: CatalogExtendedTypeEnum.SERVICE_LAYER_TYPE,
  };
  const { geoServiceService, updateGeoService$ } = createGeoServiceMock();
  await render(GeoServiceLayerFormDialogComponent, {
    imports: [ SharedModule, MatIconTestingModule ],
    declarations: [ SaveButtonComponent, SpinnerButtonComponent ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
      { provide: MatDialogRef, useValue: dialogRefMock },
      provideMockStore({
        initialState: {
          [catalogStateKey]: { geoServices: [geoServiceModelMock], geoServiceLayers: [geoServiceLayerMock] },
        },
      }),
      { provide: MAT_DIALOG_DATA, useValue: { geoService: geoServiceModelMock, geoServiceLayer: geoServiceLayerMock } },
      { provide: GeoServiceService, useValue: geoServiceService },
    ],
  });
  return { dialogRefMock };
};

describe('GeoServiceLayerFormDialogComponent', () => {

  test('should render and handle cancel', async () => {
    const { dialogRefMock } = await setup();
    expect(await screen.findByText('Edit settings for layer nice layer')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Cancel'));
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

});
