import { render, screen, waitFor } from '@testing-library/angular';
import { EditFormComponent } from './edit-form.component';
import { AttributeType, getFeatureModel, getLayerDetailsModel } from '@tailormap-viewer/api';
import { SharedModule } from '@tailormap-viewer/shared';
import userEvent from '@testing-library/user-event';

describe('EditFormComponent', () => {

  test('should render', async () => {
    const featureAttributeChanged = jest.fn();
    await render(EditFormComponent, {
      imports: [SharedModule],
      inputs: { feature: {
        feature: getFeatureModel(),
        columnMetadata: [
          { key: 'prop', alias: 'Property', type: AttributeType.STRING },
          { key: 'prop2', alias: 'Property 2', type: AttributeType.STRING },
          { key: 'fid', alias: 'fid', type: AttributeType.STRING },
        ],
        details: getLayerDetailsModel({
          editable: true,
          attributes: [
            { id: 1, type: AttributeType.STRING, featureType: 1, key: 'prop', editable: true, nullable: null, allowValueListOnly: false },
            { id: 2, type: AttributeType.STRING, featureType: 1, key: 'prop2', editable: true, nullable: null, allowValueListOnly: false },
          ],
        }),
      } },
      on: { featureAttributeChanged: featureAttributeChanged },
    });
    expect(await screen.findByText('Property')).toBeInTheDocument();
    expect(await screen.findByText('Property 2')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('Property'), '123');
    await waitFor(() => expect(featureAttributeChanged).toHaveBeenCalledWith({ attribute: 'prop', value: '123', invalid: false }));
  });

});
