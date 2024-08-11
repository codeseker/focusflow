"use client";
import { LampDemo } from "@/components/ui/lamp";

import { useEffect, useState } from "react";

export default function Home() {
  const [isRequestSent, setIsRequestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URL(window.location.href).searchParams;
      const code = params.get("code");

      if (!code || isRequestSent) return;

      const fetchData = async () => {
        setIsRequestSent(true);
        setTimeout(() => {
          window.history.go(-2);
        }, 2000);
      };

      fetchData();
    }
  }, [isRequestSent]);

  return <LampDemo />;
}
