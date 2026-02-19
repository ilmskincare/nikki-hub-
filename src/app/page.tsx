// Server component — runs on the server, checks auth before rendering anything
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Dashboard from './dashboard';

export default function Home() {
  const cookieStore = cookies();
  const auth = cookieStore.get('auth');
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword || !auth || auth.value !== appPassword) {
    redirect('/login');
  }

  return <Dashboard />;
}
