import { ReactNode, useEffect, useState } from 'react';

// third-party
import { IntlProvider, MessageFormatElement } from 'react-intl';

// project-imports
import useConfig from 'hooks/useConfig';
import { I18n } from 'types/config';

// load locales files
function loadLocaleData(locale: I18n) {
  switch (locale) {
    case 'fr':
      return import('utils/locales/fr.json');
    case 'ro':
      return import('utils/locales/ro.json');
    case 'zh':
      return import('utils/locales/zh.json');
    case 'vi':
      return import('utils/locales/vi.json');
    case 'en':
      return import('utils/locales/en.json');

    default:
      return import('utils/locales/vi.json');
  }
}

// ==============================|| LOCALIZATION ||============================== //

interface Props {
  children: ReactNode;
}

export default function Locales({ children }: Props) {
  const { i18n } = useConfig();

  const [messages, setMessages] = useState<Record<string, string> | Record<string, MessageFormatElement[]> | undefined>();

  useEffect(() => {
    loadLocaleData(i18n).then((d: { default: Record<string, string> | Record<string, MessageFormatElement[]> | undefined }) => {
      setMessages(d.default);
    });
  }, [i18n]);

  return (
    <>
      {messages && (
        <IntlProvider locale={i18n} defaultLocale="vi" messages={messages}>
          {children}
        </IntlProvider>
      )}
    </>
  );
}
