import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserProfile } from './user-profile';
import { MobileNav } from './mobile-nav';

export function DashboardHeader() {
  return (
    <header className="bg-background border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <MobileNav />
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search designs..."
              className="w-64 pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="hidden sm:block">
            <Bell className="h-5 w-5" />
          </Button>
          <UserProfile />
        </div>
      </div>
    </header>
  );
}