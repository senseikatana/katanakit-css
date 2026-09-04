/**
 * Example: IntersectionObserver and lazy-loading utilities.
 *
 * NOTE: IntersectionObserver requires a browser environment, so this example
 * is illustrative only and will not run under Bun/Node.
 */
import { LazyLoaderService, ObserverService } from "@/infrastructure/observer/observer.service";

const observer = ObserverService.getInstance();
const lazyLoader = LazyLoaderService.getInstance();

// Create a fade-in observer and observe elements.
observer.useCreate(
	"fade-in",
	(entry) => {
		entry.target.classList.toggle("visible");
	},
	{ threshold: 0.2 },
);

observer.useObserve("fade-in", "#hero");
observer.useObserveAll("fade-in", ".card");

// Create an analytics observer.
observer.useCreate("track-view", (entry) => {
	console.log(`View: ${entry.target.id}`);
});
observer.useObserve("track-view", "#promo-banner");

// Lazy load images for different sections.
lazyLoader.useInit("pokemon-list", ".pokemon-card img", "300px");
lazyLoader.useInit("blog-posts", ".post-cover img");

// Selective cleanup.
observer.useDisconnect("track-view");
lazyLoader.useStop("pokemon-list");

// Full cleanup (e.g., on SPA route change or component unmount).
observer.useDisconnectAll();
lazyLoader.useStopAll();
