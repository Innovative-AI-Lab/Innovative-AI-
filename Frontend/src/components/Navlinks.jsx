import {
  MdOutlineDashboard,
  MdOutlineFolder,
  MdOutlineBarChart,
  MdOutlineSettings,
  MdOutlineHelpCenter,
  MdOutlineLogout,
  MdOutlineLightbulb,
} from 'react-icons/md';
import { BRAND } from '../constants';

export const NAV_LINKS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <MdOutlineDashboard />,
    section: 'main',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <MdOutlineFolder />,
    section: 'main',
  },
  {
    id: 'ai-studio',
    label: 'AI Studio',
    icon: <MdOutlineLightbulb />,
    section: 'main',
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: <MdOutlineBarChart />,
    section: 'main',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <MdOutlineSettings />,
    section: 'secondary',
  },
  {
    id: 'help',
    label: 'Help',
    icon: <MdOutlineHelpCenter />,
    section: 'secondary',
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: <MdOutlineLogout />,
    section: 'secondary',
  },
];

export const BRAND_INFO = {
  name: BRAND.name,
  shortName: BRAND.shortName,
  tagline: BRAND.tagline,
};
