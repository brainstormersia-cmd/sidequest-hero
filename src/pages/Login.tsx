import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginForm } from "@/components/LoginForm";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next");

  return <LoginForm onBack={() => navigate("/")} nextPath={nextPath} />;
};

export default Login;
