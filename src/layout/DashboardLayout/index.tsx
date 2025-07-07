'use client';

import { ReactNode, useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';

// project-imports
import Loader from 'components/Loader';
import AddCustomer from 'sections/apps/customer/AddCustomer';
import Drawer from './Drawer';
import HorizontalBar from './Drawer/HorizontalBar';
import Header from './Header';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { DRAWER_WIDTH, MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';

// assets
import { IconButton, Typography } from '@mui/material';
import { ArrowLeft } from 'iconsax-react';
import navigation from 'menu-items';
import { usePathname } from 'next/navigation';
import { FormattedMessage } from 'react-intl';
import { NavItemType } from 'types/menu';
import { useRouter } from 'next/navigation';
// ==============================|| MAIN LAYOUT ||============================== //

export default function DashboardLayout({ children, backHref }: { children: ReactNode; backHref?: string }) {
  const theme = useTheme();
  const router = useRouter();

  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery(theme.breakpoints.down('xl'));
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const [title, setTitle] = useState<string>('');

  const { container, miniDrawer, menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      handlerDrawerOpen(!downXL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);
  const location = usePathname();

  useEffect(() => {
    const matchUrl = (pattern: string, path: string): boolean => {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
      return regex.test(path);
    };

    const findItem = (menuItems: NavItemType[]): { main?: NavItemType; item?: NavItemType } | undefined => {
      for (const menu of menuItems) {
        if (menu.url && typeof menu.url === 'string' && matchUrl(menu.url, location)) {
          return { main: menu, item: menu };
        }
        if (menu.children) {
          const found = findItem(menu.children);
          if (found) {
            return { main: menu, item: found.item };
          }
        }
      }
      return undefined;
    };

    const foundItem = findItem(navigation?.items || []);

    if (foundItem) {
      setTitle(foundItem?.item?.id || 'default.id');
    }
  }, [location]);

  const handleBack = () => {
    if (backHref) router.push(backHref);
  };

  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header />
      {!isHorizontal ? <Drawer /> : <HorizontalBar />}

      <Box component="main" sx={{ width: `calc(100% - ${DRAWER_WIDTH}px)`, flexGrow: 1, p: { xs: 1, sm: 3 } }}>
        <Toolbar sx={{ mt: isHorizontal ? 8 : 'inherit', mb: isHorizontal ? 2 : 'inherit' }} />
        <Container
          maxWidth={container ? 'xl' : false}
          sx={{
            ...(container && { px: { xs: 0, sm: 2 } }),
            position: 'relative',
            minHeight: 'calc(100vh - 124px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* <Breadcrumbs /> */}
          <Box display="flex" alignItems={'center'} gap={'8px'}>
            {backHref && (
              <IconButton onClick={handleBack}>
                <ArrowLeft size="32" />
              </IconButton>
            )}

            <Typography variant="h2" sx={{ fontWeight: 700 }}>
              {title ? <FormattedMessage id={title} /> : 'Default Title'}
            </Typography>
          </Box>

          {children}
          {/* <Footer /> */}
        </Container>
        {/* <Links style={{ textDecoration: 'none' }} href={url} target="_blank">
          <Button variant="contained" color="error" sx={{ zIndex: 1199, position: 'fixed', bottom: 50, right: 30 }}>
            <ListItemIcon>
              <ShoppingCart color={theme.palette.common.white} />
            </ListItemIcon>
            Buy Now
          </Button>
        </Links> */}
      </Box>
      <AddCustomer />
    </Box>
  );
}
