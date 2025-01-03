import "~/globals.css";
import ReactDOM, { Root } from "react-dom/client";
import App from "./App.tsx";

// https://www.chrismytton.com/plain-text-websites/
export default defineContentScript({
  matches: ["*://*/*"],
  main(ctx) {
    const ui = createIntegratedUi(ctx, {
      position: "inline",
      anchor: "body",
      onMount: (container) => {
        // 确保容器不会影响页面布局
        container.style.position = "fixed";
        container.style.left = "0";
        container.style.top = "0";
        container.style.width = "0";
        container.style.height = "0";
        container.style.overflow = "visible";
        container.style.zIndex = "9999999";

        const root = ReactDOM.createRoot(container);
        root.render(<App />);
        return root;
      },
      onRemove: (root?: Root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
