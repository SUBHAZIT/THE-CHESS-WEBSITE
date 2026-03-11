import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Knockout() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/rounds', { replace: true });
  }, [navigate]);

  return null;
}
