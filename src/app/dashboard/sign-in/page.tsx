import { redirect } from 'next/navigation';

export default function DashboardSignIn() {
  // Redirect to main sign-in page with dashboard redirect parameter
  redirect('/sign-in?redirect=/dashboard');
}
