import { BrowserRouter } from "react-router";
import { ErrorBoundary } from "react-error-boundary";
import NavigationRoutes from "@/views/NavigationRoutes";
import "./App.css";

function App() {
  return (
    <ErrorBoundary FallbackComponent={() => <div>⚠️Something went wrong.</div>}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <NavigationRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
