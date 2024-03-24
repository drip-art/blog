import clsx from "clsx";
interface Props {
    /**
     * CSS class names to be applied to the logo
     */
    className?: string;
    /**
     * The css color classes for the logo.
     */
    color?: string;
};

/**
 * @returns An SVG logo
 */
const Logo = ({
    className = "w-auto h-2",
    ...props
}: Props) => {
    return (
        <img src="https://drip.art/drip-site-logo.png" style={{ height: "50px" }} />
    );
};

export default Logo;