import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import { useTranslation } from 'react-i18next';
import i18n from '../config';

const TestComponent = ({ translationKey }: { translationKey: string }) => {
  const { t } = useTranslation();
  return <div>{t(translationKey)}</div>;
};

describe('Translations', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  it('loads English translations correctly', () => {
    renderWithProviders(<TestComponent translationKey="app.name" />);
    expect(screen.getByText('BPMP')).toBeInTheDocument();
  });

  it('switches to Hindi translations', async () => {
    await i18n.changeLanguage('hi');
    renderWithProviders(<TestComponent translationKey="app.name" />);
    expect(screen.getByText('बीपीएमपी')).toBeInTheDocument();
  });

  it('handles nested translation keys', () => {
    renderWithProviders(
      <TestComponent translationKey="pages.dashboard.title" />
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('formats numbers according to locale', () => {
    const TestNumber = () => {
      const { i18n } = useTranslation();
      return (
        <div>
          {new Intl.NumberFormat(i18n.language).format(1234567.89)}
        </div>
      );
    };

    renderWithProviders(<TestNumber />);
    expect(screen.getByText('1,234,567.89')).toBeInTheDocument();
  });
}); 