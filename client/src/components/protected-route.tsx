import { Route, Redirect } from "wouter";
import { useApp } from "@/lib/app-context";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
  roles?: string[];
};

export default function ProtectedRoute({
  path,
  component: Component,
  roles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useApp();

  // Mientras se carga la sesión, no mostramos nada
  if (isLoading) {
    return null; // luego puedes poner un spinner
  }

  return (
    <Route path={path}>
      {(params) => {
        // 1️⃣ No logueado → login
        if (!user) {
          return <Redirect to="/auth" />;
        }

        // 2️⃣ Logueado pero sin permisos
        if (roles && !roles.includes(user.role)) {
          return <Redirect to="/forbidden" />;
        }

        // 3️⃣ Todo OK → renderiza la página
        return <Component {...params} />;
      }}
    </Route>
  );
}
