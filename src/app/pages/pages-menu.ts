import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Web Application Firewall',
    icon: 'settings-2-outline',
    children: [
      {
        title: 'Summary',
        link: '/pages/waf',
      },
    ],
  },
];
