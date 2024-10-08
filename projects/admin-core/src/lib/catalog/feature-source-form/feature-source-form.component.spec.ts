import { render, screen, waitFor } from '@testing-library/angular';
import { FeatureSourceFormComponent } from './feature-source-form.component';
import { SharedModule } from '@tailormap-viewer/shared';
import userEvent from '@testing-library/user-event';
import { PasswordFieldComponent } from '../../shared/components/password-field/password-field.component';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('FeatureSourceFormComponent', () => {

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should render', async () => {
    const ue = userEvent.setup({ advanceTimers: jest.advanceTimersByTimeAsync });
    const changedFn = jest.fn();
    await render(FeatureSourceFormComponent, {
      imports: [ SharedModule, MatIconTestingModule ],
      declarations: [PasswordFieldComponent],
      on: { changed: changedFn },
    });
    expect(await screen.queryByPlaceholderText('URL')).not.toBeInTheDocument();
    expect(await screen.queryByPlaceholderText('Database')).not.toBeInTheDocument();
    await ue.type(await screen.findByPlaceholderText('Title'), 'Some WFS source');
    await ue.click(await screen.findByPlaceholderText('Protocol'));
    await ue.click(await screen.findByText('WFS'));
    expect(await screen.queryByPlaceholderText('URL')).toBeInTheDocument();
    expect(await screen.queryByPlaceholderText('Database')).not.toBeInTheDocument();
    await ue.type(await screen.findByPlaceholderText('URL'), 'http://localhost.test');
    await waitFor(() => {
      expect(changedFn).toHaveBeenCalledTimes(1);
      expect(changedFn).toHaveBeenCalledWith({ title: 'Some WFS source', url: 'http://localhost.test', protocol: 'WFS', authentication: undefined, jdbcConnection: undefined });
    });
  });

  test('should show JDBC fields in case of JDBC protocol', async () => {
    const ue = userEvent.setup({ advanceTimers: jest.advanceTimersByTimeAsync });
    await render(FeatureSourceFormComponent, {
      imports: [ SharedModule, MatIconTestingModule ],
      declarations: [PasswordFieldComponent],
    });
    expect(await screen.queryByPlaceholderText('URL')).not.toBeInTheDocument();
    expect(await screen.queryByPlaceholderText('Database')).not.toBeInTheDocument();
    await ue.click(await screen.findByPlaceholderText('Protocol'));
    await ue.click(await screen.findByText('JDBC'));
    expect(await screen.queryByPlaceholderText('URL')).not.toBeInTheDocument();
    expect(await screen.queryByPlaceholderText('Database')).toBeInTheDocument();
  });

});
