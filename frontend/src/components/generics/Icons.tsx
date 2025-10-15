import React from "react";

interface IconSvgProps extends React.SVGProps<SVGSVGElement> {
    paths: string[];
}

const IconSvg: React.FC<IconSvgProps> = ({ paths, ...props }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            {...props}
        >
            {paths.map((path, i) => (
                <path
                    key={i}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={path}
                />
            ))}
        </svg>
    );
};

type IconProps = React.SVGProps<SVGSVGElement>;

const MenuIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M5 7h14M5 12h14M5 17h14"]}
            {...props}
        />
    );
};

const BackIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["m15 19-7-7 7-7"]}
            {...props}
        />
    );
};

const FrontIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["m9 5 7 7-7 7"]}
            {...props}
        />
    );
};

const ExpandIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["m19 9-7 7-7-7"]}
            {...props}
        />
    );
};

const ExitIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M6 18 18 6m0 12L6 6"]}
            {...props}
        />
    );
};

const PlusIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M5 12h14m-7 7V5"]}
            {...props}
        />
    );
};

const EditIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["m14.3 4.8 2.9 2.9M7 7H4a1 1 0 0 0-1 1v10c0 .6.4 1 1 1h11c.6 0 1-.4 1-1v-4.5m2.4-10a2 2 0 0 1 0 3l-6.8 6.8L8 14l.7-3.6 6.9-6.8a2 2 0 0 1 2.8 0Z"]}
            {...props}
        />
    );
};

const CasesIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M9 8h10M9 12h10M9 16h10M5 8h0m0 4h0m0 4h0"]}
            {...props}
        />
    );
};

const ExecutionsIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["m8 9 3 3-3 3m5 0h3M4 19h16c.6 0 1-.4 1-1V6c0-.6-.4-1-1-1H4a1 1 0 0 0-1 1v12c0 .6.4 1 1 1Z"]}
            {...props}
        />
    );
};

const ParametryIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M20 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6h-2m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4"]}
            {...props}
        />
    );
};

const ProfileIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M15 9h3m-3 3h3m-3 3h3m-6 1c-.3-.6-1-1-1.6-1H7.6c-.7 0-1.3.4-1.6 1M4 5h16c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1V6c0-.6.4-1 1-1Zm7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"]}
            {...props}
        />
    );
};

const LogoutIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"]}
            {...props}
        />
    );
};

const InfoIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M10 11h2v5m-2 0h4m-2.6-8.5h0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"]}
            {...props}
        />
    );
};

const EyeIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M5 7.8C6.7 6.3 9.2 5 12 5s5.3 1.3 7 2.8a12.7 12.7 0 0 1 2.7 3.2c.2.2.3.6.3 1s-.1.8-.3 1a2 2 0 0 1-.6 1 12.7 12.7 0 0 1-9.1 5c-2.8 0-5.3-1.3-7-2.8A12.7 12.7 0 0 1 2.3 13c-.2-.2-.3-.6-.3-1s.1-.8.3-1c.1-.4.3-.7.6-1 .5-.7 1.2-1.5 2.1-2.2Zm7 7.2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"]}
            {...props}
        />
    );
};

const EyeSlashIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["m4 15.6 3-3V12a5 5 0 0 1 5-5h.5l1.8-1.7A9 9 0 0 0 12 5C6.6 5 2 10.3 2 12c.3 1.4 1 2.7 2 3.6Z",
                "m14.7 10.7 5-5a1 1 0 1 0-1.4-1.4l-5 5A3 3 0 0 0 9 12.7l.2.6-5 5a1 1 0 1 0 1.4 1.4l5-5 .6.2a3 3 0 0 0 3.6-3.6 3 3 0 0 0-.2-.6Z",
                "M19.8 8.6 17 11.5a5 5 0 0 1-5.6 5.5l-1.7 1.8 2.3.2c6.5 0 10-5.2 10-7 0-1.2-1.6-2.9-2.2-3.4Z"]}
            {...props}
        />
    );
};

const SuccessIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"]}
            {...props}
        />
    );
};

const WarningIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"]}
            {...props}
        />
    );
};

const ErrorIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"]}
            {...props}
        />
    );
};

const CardIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M3 10h18M6 14h2m3 0h5M3 7v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1Z"]}
            {...props}
        />
    );
};

const MechantIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M5.535 7.677c.313-.98.687-2.023.926-2.677H17.46c.253.63.646 1.64.977 2.61.166.487.312.953.416 1.347.11.42.148.675.148.779 0 .18-.032.355-.09.515-.06.161-.144.3-.243.412-.1.111-.21.192-.324.245a.809.809 0 0 1-.686 0 1.004 1.004 0 0 1-.324-.245c-.1-.112-.183-.25-.242-.412a1.473 1.473 0 0 1-.091-.515 1 1 0 1 0-2 0 1.4 1.4 0 0 1-.333.927.896.896 0 0 1-.667.323.896.896 0 0 1-.667-.323A1.401 1.401 0 0 1 13 9.736a1 1 0 1 0-2 0 1.4 1.4 0 0 1-.333.927.896.896 0 0 1-.667.323.896.896 0 0 1-.667-.323A1.4 1.4 0 0 1 9 9.74v-.008a1 1 0 0 0-2 .003v.008a1.504 1.504 0 0 1-.18.712 1.22 1.22 0 0 1-.146.209l-.007.007a1.01 1.01 0 0 1-.325.248.82.82 0 0 1-.316.08.973.973 0 0 1-.563-.256 1.224 1.224 0 0 1-.102-.103A1.518 1.518 0 0 1 5 9.724v-.006a2.543 2.543 0 0 1 .029-.207c.024-.132.06-.296.11-.49.098-.385.237-.85.395-1.344ZM4 12.112a3.521 3.521 0 0 1-1-2.376c0-.349.098-.8.202-1.208.112-.441.264-.95.428-1.46.327-1.024.715-2.104.958-2.767A1.985 1.985 0 0 1 6.456 3h11.01c.803 0 1.539.481 1.844 1.243.258.641.67 1.697 1.019 2.72a22.3 22.3 0 0 1 .457 1.487c.114.433.214.903.214 1.286 0 .412-.072.821-.214 1.207A3.288 3.288 0 0 1 20 12.16V19a2 2 0 0 1-2 2h-6a1 1 0 0 1-1-1v-4H8v4a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-6.888ZM13 15a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2Z"]}
            {...props}
        />
    );
};

const MobilePhoneIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M6 15h12M6 6h12m-6 12h.01M7 21h10a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1Z"]}
            {...props}
        />
    );
};

const ClockIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"]}
            {...props}
        />
    );
};

const PieChartIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M10 6.025A7.5 7.5 0 1 0 17.975 14H10V6.025Z",
                "M13.5 3c-.169 0-.334.014-.5.025V11h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 13.5 3Z"]}
            {...props}
        />
    );
};

const PercentIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M8.891 15.107 15.11 8.89m-5.183-.52h.01m3.089 7.254h.01M14.08 3.902a2.849 2.849 0 0 0 2.176.902 2.845 2.845 0 0 1 2.94 2.94 2.849 2.849 0 0 0 .901 2.176 2.847 2.847 0 0 1 0 4.16 2.848 2.848 0 0 0-.901 2.175 2.843 2.843 0 0 1-2.94 2.94 2.848 2.848 0 0 0-2.176.902 2.847 2.847 0 0 1-4.16 0 2.85 2.85 0 0 0-2.176-.902 2.845 2.845 0 0 1-2.94-2.94 2.848 2.848 0 0 0-.901-2.176 2.848 2.848 0 0 1 0-4.16 2.849 2.849 0 0 0 .901-2.176 2.845 2.845 0 0 1 2.941-2.94 2.849 2.849 0 0 0 2.176-.901 2.847 2.847 0 0 1 4.159 0Z"]}
            {...props}
        />
    );
};

const ReceiptIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M5.617 2.076a1 1 0 0 1 1.09.217L8 3.586l1.293-1.293a1 1 0 0 1 1.414 0L12 3.586l1.293-1.293a1 1 0 0 1 1.414 0L16 3.586l1.293-1.293A1 1 0 0 1 19 3v18a1 1 0 0 1-1.707.707L16 20.414l-1.293 1.293a1 1 0 0 1-1.414 0L12 20.414l-1.293 1.293a1 1 0 0 1-1.414 0L8 20.414l-1.293 1.293A1 1 0 0 1 5 21V3a1 1 0 0 1 .617-.924ZM9 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H9Zm0 4a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Zm0 4a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z"]}
            {...props}
        />
    );
};

const TrashIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"]}
            {...props}
        />
    );
};

const CodeIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14"]}
            {...props}
        />
    );
};

const BoxIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M12.013 6.175 7.006 9.369l5.007 3.194-5.007 3.193L2 12.545l5.006-3.193L2 6.175l5.006-3.194 5.007 3.194ZM6.981 17.806l5.006-3.193 5.006 3.193L11.987 21l-5.006-3.194Z", "m12.013 12.545 5.006-3.194-5.006-3.176 4.98-3.194L22 6.175l-5.007 3.194L22 12.562l-5.007 3.194-4.98-3.211Z"]}
            {...props}
        />
    );
};

const PlayIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z"]}
            {...props}
        />
    );
};

const ArrowUpRightIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"]}
            {...props}
        />
    );
};

const ArrowUpIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M12 6v13m0-13 4 4m-4-4-4 4"]}
            {...props}
        />
    );
};

const ArrowDownIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M12 19V5m0 14-4-4m4 4 4-4"]}
            {...props}
        />
    );
};

const RefreshIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"]}
            {...props}
        />
    );
};

const FilterIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"]}
            {...props}
        />
    );
};

const FilterSolidIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg
            paths={["M5.05 3C3.291 3 2.352 5.024 3.51 6.317l5.422 6.059v4.874c0 .472.227.917.613 1.2l3.069 2.25c1.01.742 2.454.036 2.454-1.2v-7.124l5.422-6.059C21.647 5.024 20.708 3 18.95 3H5.05Z"]}
            {...props}
        />
    );
};

const ThreeDotIcon: React.FC<IconProps> = (props) => {
    return (
        <IconSvg

            paths={["M 11 12 a 1,1 0 1,0 2,0 a 1,1 0 1,0 -2,0", "M 11 5 a 1,1 0 1,0 2,0 a 1,1 0 1,0 -2,0", "M 11 19 a 1,1 0 1,0 2,0 a 1,1 0 1,0 -2,0"]}
            {...props}
        />
    );
};

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export {
    MenuIcon,
    BackIcon,
    FrontIcon,
    ExpandIcon,
    ExitIcon,
    PlusIcon,
    EditIcon,
    CasesIcon,
    ExecutionsIcon,
    ParametryIcon,
    ProfileIcon,
    LogoutIcon,
    InfoIcon,
    EyeIcon,
    EyeSlashIcon,
    SuccessIcon,
    WarningIcon,
    ErrorIcon,
    CardIcon,
    MechantIcon,
    MobilePhoneIcon,
    ClockIcon,
    PieChartIcon,
    PercentIcon,
    ReceiptIcon,
    TrashIcon,
    CodeIcon,
    BoxIcon,
    PlayIcon,
    ArrowUpRightIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    RefreshIcon,
    FilterIcon,
    FilterSolidIcon,
    ThreeDotIcon,
    SearchIcon
};
