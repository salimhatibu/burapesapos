import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function PageSlide({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const nav = useNavigationType();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
  return (
    <div className="page-slide" data-direction={nav === "POP" ? "back" : "forward"} key={location.pathname}>
      {children}
    </div>
  );
}
