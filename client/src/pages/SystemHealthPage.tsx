import SystemHealthMonitor from "@/components/SystemHealthMonitor";

export default function SystemHealthPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Health Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time monitoring of your framing business's critical systems
        </p>
      </div>
      
      <SystemHealthMonitor />
    </div>
  );
}