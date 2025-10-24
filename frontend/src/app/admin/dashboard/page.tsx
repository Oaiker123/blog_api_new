"use client";
import DashboardChart from "@/components/admin/DashboardChart";

import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardChart />
    </motion.div>
  );
}
