import RouteCreator from "./components/routes/RouteCreator";
import { AuthProvider } from "./components/auth/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <RouteCreator />
      </div>
    </AuthProvider>
  );
}

export default App;
