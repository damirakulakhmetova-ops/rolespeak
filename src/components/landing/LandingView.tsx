"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function LandingView() {
  useEffect(() => {
    track("landing_view");
  }, []);
  return null;
}
