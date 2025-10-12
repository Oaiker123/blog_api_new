"use client";
import { useEffect } from "react";
import { api } from "@/lib/api";

export default function Page() {
  useEffect(() => {
    api.get("/test")
      .then((res) => console.log("✅ API response:", res.data))
      .catch((err) => console.error("❌ API error:", err));
  }, []);

  return <div>Test API page</div>;
}

