import { useState } from 'react';
import { FiCheck, FiShare2 } from 'react-icons/fi';
import Button from './Button.jsx';
import { shareContent } from '../utils/share.js';

export default function ShareButton({ title, text, url, size = 'md', className = '' }) {
  const [status, setStatus] = useState(null);

  const handle = async () => {
    const result = await shareContent({ title, text, url });
    if (result === 'cancelled') return;
    setStatus(result === 'shared' ? 'shared' : result === 'copied' ? 'copied' : 'failed');
    setTimeout(() => setStatus(null), 2500);
  };

  const labels = {
    shared: 'Shared!',
    copied: 'Link copied!',
    failed: 'Could not copy',
  };

  return (
    <Button
      variant={status === 'copied' ? 'success' : 'primary'}
      size={size}
      icon={status ? FiCheck : FiShare2}
      onClick={handle}
      className={className}
    >
      {labels[status] ?? 'Share'}
    </Button>
  );
}
