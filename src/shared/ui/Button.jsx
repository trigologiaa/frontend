import { StyledButton } from "./Button.styles";
import { Icon } from "./Icon";

export function Button({
	variant = "primary",
	size = "md",
	as,
	type,
	icon,
	children,
	...props
}) {
	return (
		<StyledButton
			as={as}
			type={as ? type : (type ?? "button")}
			$variant={variant}
			$size={size}
			{...props}
		>
			{icon && <Icon icon={icon} />}
			{children}
		</StyledButton>
	);
}
