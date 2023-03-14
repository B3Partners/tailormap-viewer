import { render, screen } from '@testing-library/angular';
import { GrouplistComponent } from './grouplist.component';
import { of } from 'rxjs';
import { TAILORMAP_ADMIN_API_V1_SERVICE } from '@tailormap-admin/admin-api';
import { SharedModule } from '@tailormap-viewer/shared';
import { MatListModule } from '@angular/material/list';

const setup = async () => {
  const mockApiService = {
    getGroups$: jest.fn(() => of(null)),
  };

  await render(GrouplistComponent, {
    imports: [ SharedModule, MatListModule ],
    providers: [
      { provide: TAILORMAP_ADMIN_API_V1_SERVICE, useValue: mockApiService },
    ],
  });
  return { mockApiService };
};

describe('GrouplistComponent', () => {
  test('should render', async () => {
    const { mockApiService } = await setup();
    expect(screen.getByText('Groups'));
  });
});
