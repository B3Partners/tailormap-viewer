import { render, screen } from '@testing-library/angular';
import { ApplicationCreateComponent } from './application-create.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApplicationService } from '../services/application.service';
import { of } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ApplicationCreateComponent', () => {

  test('should render', async () => {
    await render(ApplicationCreateComponent, {
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [MatSnackBarModule],
      providers: [
        { provide: ApplicationService, useValue: { createApplication$: jest.fn(() => of({})) } },
      ],
    });
    expect(screen.getByText('Create application'));
  });

});
