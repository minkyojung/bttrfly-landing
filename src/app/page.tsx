import ProductShowcase from "@/components/ProductShowcase";
import { VirtualMonitor } from "@/components/virtual-monitor/VirtualMonitor";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <VirtualMonitor />
    </div>
  );
}
