import {
  Header,
  HeaderLogo,
  HeaderPortals,
  HeaderUser,
} from '@/components/shared/header';
import { MenuItemLink } from '@/components/shared/menu-item';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { HeaderNotifications } from '@/features/notification';
import { useMenu } from '@/hooks/use-menu';
import type { Menu } from '@/types/menu.type';
import { useAbility } from '@casl/react';
import {
  RiArchiveFill,
  RiArchiveLine,
  RiBookFill,
  RiBookLine,
  RiDashboardFill,
  RiDashboardLine,
  RiPriceTag3Fill,
  RiPriceTag3Line,
  // RiExchangeFill,
  // RiExchangeLine,
  // RiTeamFill,
  // RiTeamLine,
} from '@remixicon/react';
import { Link, Outlet } from 'react-router-dom';

const MenuGroup: {
  group: string;
  menus: Menu[];
}[] = [
  {
    group: 'Library',
    menus: [
      {
        path: '/officer/library/categories',
        label: 'Categories',
        Icon: RiPriceTag3Line,
        IconActive: RiPriceTag3Fill,
        ability: { action: 'read', subject: 'library:category' },
      },
      {
        path: '/officer/library/books',
        label: 'Books',
        Icon: RiBookLine,
        IconActive: RiBookFill,
        ability: { action: 'read', subject: 'library:book' },
      },
      {
        path: '/officer/library/stock',
        label: 'Stock',
        Icon: RiArchiveLine,
        IconActive: RiArchiveFill,
        ability: { action: 'read', subject: 'library:book' },
      },
      // {
      //   path: '/officer/library/members',
      //   label: 'Members',
      //   Icon: RiTeamLine,
      //   IconActive: RiTeamFill,
      //   ability: { action: 'read', subject: 'library:member' },
      // },
      // {
      //   path: '/officer/library/loans',
      //   label: 'Loans',
      //   Icon: RiExchangeLine,
      //   IconActive: RiExchangeFill,
      //   ability: { action: 'read', subject: 'library:loan' },
      // },
    ],
  },
];

const OfficerLayout = () => {
  const ability = useAbility();
  const { activeMenu } = useMenu(MenuGroup.flatMap((mg) => mg.menus));

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar">
        <SidebarHeader>
          <HeaderLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={!activeMenu} asChild>
                  <Link to={'/officer'}>
                    {!activeMenu ? <RiDashboardFill /> : <RiDashboardLine />}{' '}
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {MenuGroup.map((mg) => {
            const menus = mg.menus.filter(
              (menu) =>
                !menu.ability ||
                ability.can(menu.ability.action, menu.ability.subject)
            );
            return menus.length ? (
              <SidebarGroup key={mg.group}>
                <SidebarGroupLabel>{mg.group}</SidebarGroupLabel>
                <SidebarMenu>
                  {menus.map((menu) => (
                    <SidebarMenuItem key={menu.path}>
                      <SidebarMenuButton
                        isActive={activeMenu?.path === menu.path}
                        asChild
                      >
                        <MenuItemLink
                          menu={menu}
                          active={activeMenu?.path === menu.path}
                        />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            ) : (
              ''
            );
          })}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header
          className="sticky -mb-(--header-h)"
          slotLeft={<SidebarTrigger />}
          slotRight={
            <>
              <HeaderNotifications />
              <HeaderPortals />
              <HeaderUser />
            </>
          }
        />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default OfficerLayout;
