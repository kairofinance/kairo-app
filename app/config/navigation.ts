import {
  HomeIcon,
  DocumentDuplicateIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export type IconComponent = React.ForwardRefExoticComponent<
  Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
    title?: string;
    titleId?: string;
  } & React.RefAttributes<SVGSVGElement>
>;

export interface NavigationItem {
  name: string;
  href: string;
  icon: IconComponent;
  current: boolean;
}

export interface NavigationGroup {
  name: string;
  items: {
    name: string;
    href: string;
    icon: IconComponent;
  }[];
}

export type NavigationElement = NavigationItem | NavigationGroup;

export const navigation: NavigationElement[] = [
  { name: "Home", href: "/", icon: HomeIcon, current: false },
  { name: "Overview", href: "/overview", icon: HomeIcon, current: false },
  { name: "Create", href: "/create", icon: PlusIcon, current: false },
  {
    name: "View",
    items: [
      {
        name: "Vesting Schedules",
        href: "/vesting",
        icon: DocumentDuplicateIcon,
      },
      { name: "Token Streams", href: "/streams", icon: DocumentDuplicateIcon },
      { name: "Invoices", href: "/invoices", icon: DocumentDuplicateIcon },
    ],
  },
  { name: "Teams", href: "/teams", icon: PlusIcon, current: false },
];

export const teams = [
  {
    id: 1,
    name: "Plasma",
    href: "/teams/plasma",
    initial: "K",
    current: false,
  },
  { id: 2, name: "Reown", href: "/teams/reown", initial: "R", current: false },
  {
    id: 3,
    name: "Protocol",
    href: "/teams/protocol",
    initial: "P",
    current: false,
  },
];
