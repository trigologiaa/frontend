import styled, { css } from "styled-components";

const variants = {
	primary: css`
		color: var(--color-primary-contrast);
		background: var(--color-primary);
		border: 1px solid var(--color-primary);
	`,
	secondary: css`
		color: var(--color-text);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
	`,
	danger: css`
		color: var(--color-text);
		background: var(--color-danger-surface);
		border: 1px solid var(--color-danger);
	`,
};

const sizes = {
	md: css`
		padding: 0 var(--space-4);
	`,
	lg: css`
		padding: 0 var(--space-6);
	`,
};

export const StyledButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: var(--space-2);
	min-height: 2.75rem;
	font: inherit;
	font-weight: 600;
	text-decoration: none;
	cursor: pointer;
	border-radius: var(--radius);
	${({ $variant }) => variants[$variant]}
	${({ $size }) => sizes[$size]}

	&:hover:not(:disabled) {
		filter: brightness(1.1);
	}

	&:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
`;
