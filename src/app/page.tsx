'use client';
// project-imports
import Hero from 'sections/landing/Hero';
import Technologies from 'sections/landing/Technologies';
import Combo from 'sections/landing/Combo';
import Apps from 'sections/landing/Apps';
import Free from 'sections/landing/Free';
import Testimonial from 'sections/landing/Testimonial';
import Partner from 'sections/landing/Partner';
import ContactUs from 'sections/landing/ContactUs';
import SimpleLayout from 'layout/SimpleLayout';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Domain } from 'config';
import AuthGuard from 'utils/route-guard/AuthGuard';
import DashboardLayout from 'layout/DashboardLayout';

// ==============================|| LANDING PAGE ||============================== //

export default function Landing() {
  const [domainType, setDomainType] = useState<string>('');
  const slugCompany = Cookies.get('slugCompany') || 'anyone';

  useEffect(() => {
    // Lấy giá trị domainType từ cookie
    const type = Cookies.get('domainType') || 'main';
    setDomainType(type);
  }, []);

  const renderUiByDomain = () => {
    switch (domainType) {
      case Domain.main:
        return (
          <SimpleLayout>
            <Hero />
            <Technologies />
            <Combo />
            <Apps />
            <Free />
            <Testimonial />
            <Partner />
            <ContactUs />
          </SimpleLayout>
        );
      case Domain.admin:
        return (
          <AuthGuard>
            <DashboardLayout>Hello admin !</DashboardLayout>
          </AuthGuard>
        );
      case Domain.company:
        return (
          <AuthGuard>
            {/* <Hero title={`Hello ${slugCompany} !`} /> */}
            <DashboardLayout>{`Hello ${slugCompany} !`}</DashboardLayout>
          </AuthGuard>
        );
      default:
        break;
    }
  };

  return renderUiByDomain();
}
