'use client';
import { redirect } from 'next/navigation';

// ==============================|| LANDING PAGE ||============================== //

export default function Landing() {
  redirect('/dashboard/default');
}
