import { Helmet } from "react-helmet-async";

const SITE_NAME = "Trigologiaa Dev";

export function Seo({ title, description }) {
	const fullTitle = `${title} | ${SITE_NAME}`;
	return (
		<Helmet>
			<title>{fullTitle}</title>
			<meta property="og:title" content={fullTitle} />
			{description && <meta name="description" content={description} />}
			{description && <meta property="og:description" content={description} />}
		</Helmet>
	);
}
