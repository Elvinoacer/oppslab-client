// =============================================================================
// Admin Settings Page
// =============================================================================

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage platform settings and configurations.
        </p>
      </div>

      <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">General Support</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Support Email</label>
            <Input defaultValue="support@oppshub.com" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform Name</label>
            <Input defaultValue="OppsLab" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" />
          </div>
        </div>
        <Button>Save Changes</Button>
      </div>

      <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Clear Cache</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Invalidate all cached data</div>
          </div>
          <Button variant="outline" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/30">
            Clear Cache
          </Button>
        </div>
      </div>
    </div>
  );
}
