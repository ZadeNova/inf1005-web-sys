import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// eslint-disable-next-line no-unused-vars
function mountIsland(id, Component) {
	const root = document.getElementById(id);
	if (root) {
		createRoot(root).render(
			<StrictMode>
				<Component {...JSON.parse(root.dataset.props || "{}")} />
			</StrictMode>,
		);
	}
}

// Register your islands here as you build them
// import PriceChart from './islands/PriceChart'
// mountIsland('price-chart-root', PriceChart)
