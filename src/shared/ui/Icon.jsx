export function Icon({ icon: Glyph, ...props }) {
	return <Glyph aria-hidden="true" focusable="false" {...props} />;
}
