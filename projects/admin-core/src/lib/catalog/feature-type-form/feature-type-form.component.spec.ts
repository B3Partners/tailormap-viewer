import { render, screen } from '@testing-library/angular';
import { FeatureTypeFormComponent } from './feature-type-form.component';
import { of } from 'rxjs';
import { getFeatureType, getFeatureTypeSummary } from '@tailormap-admin/admin-api';
import { SharedModule } from '@tailormap-viewer/shared';
import { ExtendedFeatureTypeModel } from '../models/extended-feature-type.model';
import { FeatureSourceService } from '../services/feature-source.service';
import { FeatureTypeAttributesComponent } from '../feature-type-attributes/feature-type-attributes.component';
import { SaveButtonComponent } from '../../shared/components/save-button/save-button.component';

const setup = async () => {
  const featureSourceService = { updateFeatureSource$: jest.fn(() => of({})) };
  const featureTypeModel: ExtendedFeatureTypeModel = {
    ...getFeatureTypeSummary({ name: 'ft_1', title: 'some table' }),
    id: '1_ft_1',
    originalId: 'ft_1',
    featureSourceId: '1',
    catalogNodeId: 'node-1',
  };
  await render(FeatureTypeFormComponent, {
    declarations: [ FeatureTypeAttributesComponent, SaveButtonComponent ],
    imports: [SharedModule],
    componentInputs: {
      featureType: featureTypeModel,
    },
    providers: [
      { provide: FeatureSourceService, useValue: featureSourceService },
    ],
  });
  return { featureSourceService, featureTypeModel };
};

describe('FeatureTypeFormComponent', () => {

  test('should render', async () => {
    await setup();
    expect(await screen.findByText('Details for feature type some table')).toBeInTheDocument();
  });

});
