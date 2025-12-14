import React from 'react';

type Props = { error?: string | null };

export default function FormErrorDisplay({ error }: Props) {
  if (!error) return null;
  return <div className="text-red-500 text-sm">{error}</div>;
}
