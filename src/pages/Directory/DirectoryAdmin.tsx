import React from 'react';
import AdminPanel from '../../components/AdminPanel';

// Dedicated admin directory entry point.
// This page can be hooked into routing later; currently it just renders the AdminPanel.

export default function DirectoryAdmin() {
  const [open, setOpen] = React.useState(true);

  if (!open) return null;

  return <AdminPanel onClose={() => setOpen(false)} />;
}

