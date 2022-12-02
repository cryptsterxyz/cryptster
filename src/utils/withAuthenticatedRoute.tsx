import React, { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import getIsAuthTokensAvailable from "@utils/getIsAuthTokensAvailable";

const withAuthenticatedRoute = (Component: JSX.IntrinsicAttributes, options = {}) => {
  const AuthenticatedRoute = (props: any): JSX.Element => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    useEffect(() => {
      if (getIsAuthTokensAvailable()) {
        setLoading(false);
      } else {
        router.push("/");
      }
    }, []);

    if (loading) {
      return <div />;
    }

    return <Component {...props} />;
  };

  return AuthenticatedRoute;
};

export default withAuthenticatedRoute;
