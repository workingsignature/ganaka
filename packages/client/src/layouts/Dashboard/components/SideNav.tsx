import { SignedIn, UserButton } from "@clerk/clerk-react";
import { Icon } from "@iconify/react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import ganakaLogo from "../../../assets/Ganaka.svg";

const NavbarLink = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <Tooltip label={label} position="right" offset={10}>
      <ActionIcon
        size="lg"
        variant={active ? "filled" : "subtle"}
        color={active ? "cyan" : "dark"}
        onClick={onClick}
      >
        <Icon icon={icon} height={20} />
      </ActionIcon>
    </Tooltip>
  );
};

const navItems = [
  {
    icon: "grommet-icons:overview",
    label: "Overview",
    path: "/dashboard/overview",
  },
  {
    icon: "tabler:list-details",
    label: "Instrument Shortlists",
    path: "/dashboard/shortlists",
  },
];

export const SideNav = () => {
  // HOOKS
  const location = useLocation();
  const navigate = useNavigate();

  // DRAW
  return (
    <nav className="w-full h-full rounded-sm flex flex-col items-center justify-between gap-2 py-2">
      <div className="w-full flex items-center justify-center mb-5">
        <img src={ganakaLogo} alt="Ganaka" className="w-10 h-10" />
      </div>
      <div className="w-full h-full flex flex-col items-center justify-between gap-5">
        <div className="w-full h-fit flex flex-col items-center justify-start gap-5">
          {navItems.map((link) => (
            <NavbarLink
              icon={link.icon}
              label={link.label}
              key={link.label}
              active={location.pathname === link.path}
              onClick={() => navigate(link.path)}
            />
          ))}
        </div>
        <div className="w-full h-fit flex flex-col items-center justify-start gap-5">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};
